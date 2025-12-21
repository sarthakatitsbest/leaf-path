import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Droplets, 
  Leaf, 
  Wind, 
  Utensils, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface WellnessData {
  wellness: {
    aqiScore: number;
    waterScore: number;
    carbonScore: number;
    dietScore: number;
    overallScore: number;
  };
  healthTips: {
    tips: string[];
    dietSuggestions: string[];
    activitySuggestions: string[];
  };
  autoEstimates: {
    city: string;
    waterEstimate: number;
    dailyCarbon: number;
    cityAverage: number;
    comparisonPercentage: number;
    betterThanAverage: boolean;
  };
  weeklyTotals: {
    carbon: number;
    water: number;
    waste: number;
    greenTrips: number;
  };
}

export default function WellnessWidget() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WellnessData | null>(null);
  const [aqi, setAqi] = useState(100);
  const [temperature, setTemperature] = useState(28);
  const [city, setCity] = useState('');

  useEffect(() => {
    if (user) {
      detectLocationAndFetchWellness();
    }
  }, [user]);

  const detectLocationAndFetchWellness = async () => {
    setLoading(true);
    try {
      // Try to get user location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchAQIAndWellness(latitude, longitude);
          },
          async () => {
            // Default to Mumbai if location denied
            await fetchAQIAndWellness(19.076, 72.8777);
          }
        );
      } else {
        await fetchAQIAndWellness(19.076, 72.8777);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchAQIAndWellness = async (lat: number, lon: number) => {
    try {
      // Fetch AQI data
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;

      const aqiResponse = await supabase.functions.invoke('air-quality', {
        body: { lat, lon }
      });

      let fetchedAqi = 100;
      let fetchedTemp = 28;
      let fetchedCity = 'Your City';

      if (aqiResponse.data) {
        fetchedAqi = aqiResponse.data.aqi || 100;
        fetchedTemp = aqiResponse.data.temperature || 28;
        fetchedCity = aqiResponse.data.city || 'Your City';
      }

      setAqi(fetchedAqi);
      setTemperature(fetchedTemp);
      setCity(fetchedCity);

      // Fetch wellness data
      const wellnessResponse = await supabase.functions.invoke('compute-wellness', {
        body: { aqi: fetchedAqi, temperature: fetchedTemp, city: fetchedCity }
      });

      if (wellnessResponse.data?.ok) {
        setData(wellnessResponse.data);
      }
    } catch (error) {
      console.error('Wellness fetch error:', error);
      toast.error('Failed to fetch wellness data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'bg-green-500', icon: CheckCircle2 };
    if (aqi <= 100) return { label: 'Moderate', color: 'bg-yellow-500', icon: AlertTriangle };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'bg-orange-500', icon: AlertTriangle };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'bg-red-500', icon: AlertTriangle };
    return { label: 'Very Unhealthy', color: 'bg-purple-500', icon: AlertTriangle };
  };

  if (loading) {
    return (
      <Card className="glass rounded-3xl border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="glass rounded-3xl border-0 shadow-xl">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No wellness data available. Log some activities to see your wellness score!
          </p>
        </CardContent>
      </Card>
    );
  }

  const aqiStatus = getAQIStatus(aqi);
  const AQIIcon = aqiStatus.icon;

  return (
    <div className="space-y-6">
      {/* Main Wellness Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass rounded-3xl border-0 shadow-xl overflow-hidden">
          <div className="absolute inset-0 gradient-teal-lime opacity-10" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-poppins font-bold text-xl flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Daily Wellness Score
                </CardTitle>
                <CardDescription className="font-inter flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {city || 'Your Location'}
                </CardDescription>
              </div>
              <div className={`text-4xl font-poppins font-black ${getScoreColor(data.wellness.overallScore)}`}>
                {data.wellness.overallScore}
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/30 rounded-2xl">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Wind className="h-4 w-4" />
                  AQI Score
                </div>
                <Progress value={data.wellness.aqiScore * 4} className="h-2" />
                <p className="text-xs mt-1">{data.wellness.aqiScore}/25</p>
              </div>
              <div className="p-3 bg-white/30 rounded-2xl">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Droplets className="h-4 w-4" />
                  Water Score
                </div>
                <Progress value={data.wellness.waterScore * 4} className="h-2" />
                <p className="text-xs mt-1">{data.wellness.waterScore}/25</p>
              </div>
              <div className="p-3 bg-white/30 rounded-2xl">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Leaf className="h-4 w-4" />
                  Carbon Score
                </div>
                <Progress value={data.wellness.carbonScore * 4} className="h-2" />
                <p className="text-xs mt-1">{data.wellness.carbonScore}/25</p>
              </div>
              <div className="p-3 bg-white/30 rounded-2xl">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Utensils className="h-4 w-4" />
                  Diet Score
                </div>
                <Progress value={data.wellness.dietScore * 4} className="h-2" />
                <p className="text-xs mt-1">{data.wellness.dietScore}/25</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AQI & Health Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass rounded-3xl border-0 shadow-xl h-full">
            <CardHeader>
              <CardTitle className="font-poppins font-bold flex items-center gap-2">
                <Wind className="h-5 w-5" />
                Air Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-poppins font-black">{aqi}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${aqiStatus.color} text-white`}>
                      {aqiStatus.label}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl">🌡️ {temperature}°C</div>
                </div>
              </div>
              
              <div className="space-y-2">
                {data.healthTips.tips.map((tip, i) => (
                  <p key={i} className="text-sm p-2 bg-white/20 rounded-lg">{tip}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass rounded-3xl border-0 shadow-xl h-full">
            <CardHeader>
              <CardTitle className="font-poppins font-bold flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Diet & Activity Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">🥗 Diet Suggestions</h4>
                <div className="space-y-1">
                  {data.healthTips.dietSuggestions.map((tip, i) => (
                    <p key={i} className="text-sm p-2 bg-white/20 rounded-lg">{tip}</p>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">🏃 Activity Tips</h4>
                <div className="space-y-1">
                  {data.healthTips.activitySuggestions.map((tip, i) => (
                    <p key={i} className="text-sm p-2 bg-white/20 rounded-lg">{tip}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Auto Estimates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass rounded-3xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="font-poppins font-bold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Auto Estimates vs City Average
            </CardTitle>
            <CardDescription>Based on {city} data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/30 rounded-2xl text-center">
                <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{data.autoEstimates.waterEstimate}L</div>
                <p className="text-xs text-muted-foreground">Daily Water Est.</p>
              </div>
              <div className="p-4 bg-white/30 rounded-2xl text-center">
                <Leaf className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{data.autoEstimates.dailyCarbon} kg</div>
                <p className="text-xs text-muted-foreground">Your Daily CO₂</p>
              </div>
              <div className="p-4 bg-white/30 rounded-2xl text-center">
                <TrendingDown className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{data.autoEstimates.cityAverage} kg</div>
                <p className="text-xs text-muted-foreground">City Average</p>
              </div>
              <div className="p-4 bg-white/30 rounded-2xl text-center">
                {data.autoEstimates.betterThanAverage ? (
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-500" />
                )}
                <div className={`text-2xl font-bold ${data.autoEstimates.betterThanAverage ? 'text-green-500' : 'text-red-500'}`}>
                  {data.autoEstimates.betterThanAverage ? '+' : ''}{data.autoEstimates.comparisonPercentage.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.autoEstimates.betterThanAverage ? 'Better than avg' : 'Above average'}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              📍 Location is used only to estimate environmental conditions. Exact location is not stored.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
