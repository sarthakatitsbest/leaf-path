import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Users, Award, Calendar, Zap, Car, Utensils } from 'lucide-react';
import CarbonEntryForm from '@/components/CarbonEntryForm';
import LeaderboardCard from '@/components/LeaderboardCard';
import AiChatWidget from '@/components/AiChatWidget';
import ReceiptScanner from '@/components/ReceiptScanner';
import ScoreCard from '@/components/ScoreCard';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import MapCompare from '@/components/MapCompare';
import EmissionsChart from '@/components/EmissionsChart';
import CarbonInsights from '@/components/CarbonInsights';

interface UserProfile {
  display_name: string;
  total_points: number;
  current_streak: number;
}

interface CarbonLog {
  log_date: string;
  total_emissions: number;
  travel_emissions: number;
  energy_emissions: number;
  food_emissions: number;
  lat?: number;
  lon?: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [carbonLogs, setCarbonLogs] = useState<CarbonLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('display_name, total_points, current_streak')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch recent carbon logs
      const { data: logsData } = await supabase
        .from('carbon_logs')
        .select('log_date, total_emissions, travel_emissions, energy_emissions, food_emissions, lat, lon')
        .eq('user_id', user?.id)
        .order('log_date', { ascending: false })
        .limit(7);

      if (logsData) {
        setCarbonLogs(logsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const totalEmissions = carbonLogs.reduce((sum, log) => sum + (log.total_emissions || 0), 0);
  const avgDailyEmissions = carbonLogs.length > 0 ? totalEmissions / carbonLogs.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-teal-50/20">
      <Navbar />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-6 py-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-poppins font-black gradient-teal-lime bg-clip-text text-transparent mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground font-inter text-lg">
              Track your eco-journey and make a positive impact
            </p>
          </motion.div>

          {/* Main dashboard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Left column - Score card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4"
            >
              <ScoreCard 
                dailyScore={avgDailyEmissions} 
                weeklyTotal={totalEmissions} 
                improvement={15} 
              />
            </motion.div>

            {/* Center column - Overview cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-8 grid grid-cols-2 gap-4"
            >
              <motion.div whileHover={{ y: -4, scale: 1.02 }}>
                <Card className="glass rounded-2xl border-0 shadow-lg">
                  <div className="absolute inset-0 gradient-warm opacity-5 rounded-2xl" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-poppins font-semibold">Total Points</CardTitle>
                    <Award className="h-5 w-5 text-warning" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-poppins font-black text-primary">{profile?.total_points || 0}</div>
                    <p className="text-xs text-muted-foreground">Keep it up! 🌟</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ delay: 0.1 }}>
                <Card className="glass rounded-2xl border-0 shadow-lg">
                  <div className="absolute inset-0 gradient-purple-pink opacity-5 rounded-2xl" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-poppins font-semibold">Streak</CardTitle>
                    <Calendar className="h-5 w-5 text-accent" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-poppins font-black text-primary">{profile?.current_streak || 0}</div>
                    <p className="text-xs text-muted-foreground">Days tracked 🔥</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ delay: 0.2 }}>
                <Card className="glass rounded-2xl border-0 shadow-lg">
                  <div className="absolute inset-0 gradient-teal-lime opacity-5 rounded-2xl" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-poppins font-semibold">Total Logs</CardTitle>
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-poppins font-black text-primary">{carbonLogs.length}</div>
                    <p className="text-xs text-muted-foreground">Activities logged 📊</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ delay: 0.3 }}>
                <Card className="glass rounded-2xl border-0 shadow-lg">
                  <div className="absolute inset-0 gradient-warm opacity-5 rounded-2xl" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-poppins font-semibold">Weekly Avg</CardTitle>
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-poppins font-black text-primary">{avgDailyEmissions.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">kg CO₂/day 🌱</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>

          {/* Action Forms and New Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Entry Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <CarbonEntryForm onSubmitSuccess={fetchUserData} />
            </motion.div>

            {/* Receipt Scanner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <ReceiptScanner />
            </motion.div>

            {/* New Leaderboard Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <LeaderboardWidget />
            </motion.div>
          </div>

          {/* Emissions Chart and Map Integration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Emissions Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 }}
            >
              {user?.id && <EmissionsChart userId={user.id} days={7} />}
            </motion.div>

            {/* Map Comparison */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="glass rounded-3xl border-0 shadow-xl">
                <div className="absolute inset-0 gradient-teal-lime opacity-5 rounded-3xl" />
                <CardHeader className="relative z-10">
                  <CardTitle className="font-poppins font-bold">Location & Air Quality</CardTitle>
                  <CardDescription className="font-inter">Compare your emissions with your city</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  {carbonLogs.length > 0 && carbonLogs[0].lat && carbonLogs[0].lon && user?.id ? (
                    <MapCompare
                      lat={carbonLogs[0].lat}
                      lon={carbonLogs[0].lon}
                      userId={user.id}
                      radiusKm={10}
                    />
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      <p className="text-center">
                        Log your carbon activities with location to see the map and air quality data
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Carbon Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="mb-8"
          >
            {user?.id && <CarbonInsights userId={user.id} />}
          </motion.div>

          {/* Detailed Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Emissions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="glass rounded-3xl border-0 shadow-xl">
                <div className="absolute inset-0 gradient-teal-lime opacity-5 rounded-3xl" />
                <CardHeader className="relative z-10">
                  <CardTitle className="font-poppins font-bold">Recent Emissions</CardTitle>
                  <CardDescription className="font-inter">Your last 7 days of carbon tracking</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    {carbonLogs.length > 0 ? (
                      carbonLogs.map((log, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between p-3 bg-white/30 rounded-2xl border-b pb-2 last:border-b-0"
                        >
                          <div>
                            <p className="text-sm font-poppins font-semibold">
                              {new Date(log.log_date).toLocaleDateString()}
                            </p>
                            <div className="flex space-x-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Car className="h-3 w-3 mr-1" />
                                {log.travel_emissions?.toFixed(1) || 0}
                              </span>
                              <span className="flex items-center">
                                <Zap className="h-3 w-3 mr-1" />
                                {log.energy_emissions?.toFixed(1) || 0}
                              </span>
                              <span className="flex items-center">
                                <Utensils className="h-3 w-3 mr-1" />
                                {log.food_emissions?.toFixed(1) || 0}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-poppins font-bold text-primary">
                              {log.total_emissions?.toFixed(1) || 0} kg
                            </p>
                            <p className="text-xs text-muted-foreground">CO₂</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8 font-inter">
                        No emissions logged yet. Start tracking your carbon footprint! 🌱
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Profile Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="glass rounded-3xl border-0 shadow-xl">
                <div className="absolute inset-0 gradient-purple-pink opacity-5 rounded-3xl" />
                <CardHeader className="relative z-10">
                  <CardTitle className="font-poppins font-bold">Profile Summary</CardTitle>
                  <CardDescription className="font-inter">Your environmental impact profile</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div>
                    <h4 className="font-poppins font-semibold mb-2 text-primary">Display Name</h4>
                    <p className="text-muted-foreground font-inter">
                      {profile?.display_name || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-poppins font-semibold mb-2 text-primary">Account</h4>
                    <p className="text-muted-foreground font-inter">{user?.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-poppins font-semibold mb-2 text-primary">Environmental Impact</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-white/30 rounded-2xl">
                        <p className="text-muted-foreground font-inter">Total Emissions</p>
                        <p className="font-poppins font-bold text-primary">{totalEmissions.toFixed(1)} kg CO₂</p>
                      </div>
                      <div className="p-3 bg-white/30 rounded-2xl">
                        <p className="text-muted-foreground font-inter">Days Tracked</p>
                        <p className="font-poppins font-bold text-primary">{carbonLogs.length} days</p>
                      </div>
                    </div>
                  </div>

                  {carbonLogs.length > 0 && (
                    <div>
                      <h4 className="font-poppins font-semibold mb-3 text-primary">Breakdown (Last 7 Days)</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center p-2 bg-white/20 rounded-xl">
                          <span className="flex items-center font-inter">
                            <Car className="h-4 w-4 mr-2 text-primary" />
                            Travel
                          </span>
                          <span className="font-poppins font-bold">{carbonLogs.reduce((sum, log) => sum + (log.travel_emissions || 0), 0).toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/20 rounded-xl">
                          <span className="flex items-center font-inter">
                            <Zap className="h-4 w-4 mr-2 text-secondary" />
                            Energy
                          </span>
                          <span className="font-poppins font-bold">{carbonLogs.reduce((sum, log) => sum + (log.energy_emissions || 0), 0).toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/20 rounded-xl">
                          <span className="flex items-center font-inter">
                            <Utensils className="h-4 w-4 mr-2 text-accent" />
                            Food
                          </span>
                          <span className="font-poppins font-bold">{carbonLogs.reduce((sum, log) => sum + (log.food_emissions || 0), 0).toFixed(1)} kg</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Classic Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <LeaderboardCard />
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Enhanced AI Chat Widget */}
      <AiChatWidget userProfile={profile} recentData={carbonLogs.slice(0, 3)} />
    </div>
  );
}