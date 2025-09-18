import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Users, Award, Calendar, Zap, Car, Utensils } from 'lucide-react';
import CarbonEntryForm from '@/components/CarbonEntryForm';
import LeaderboardCard from '@/components/LeaderboardCard';
import AiChatWidget from '@/components/AiChatWidget';
import ReceiptScanner from '@/components/ReceiptScanner';

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
        .select('log_date, total_emissions, travel_emissions, energy_emissions, food_emissions')
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your environmental impact and progress
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.total_points || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Keep up the great work!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.current_streak || 0} days</div>
                <p className="text-xs text-muted-foreground">
                  Days of consistent tracking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Daily Emissions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgDailyEmissions.toFixed(1)} kg</div>
                <p className="text-xs text-muted-foreground">
                  CO₂ equivalent per day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{carbonLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  Recorded activities
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Carbon Entry Form and Receipt Scanner */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CarbonEntryForm onSubmitSuccess={fetchUserData} />
            <ReceiptScanner />
          </div>

          {/* Detailed Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Emissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Emissions</CardTitle>
                <CardDescription>Your last 7 days of carbon tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {carbonLogs.length > 0 ? (
                    carbonLogs.map((log, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(log.log_date).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Car className="h-3 w-3 mr-1" />
                              {log.travel_emissions?.toFixed(1) || 0} kg
                            </span>
                            <span className="flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              {log.energy_emissions?.toFixed(1) || 0} kg
                            </span>
                            <span className="flex items-center">
                              <Utensils className="h-3 w-3 mr-1" />
                              {log.food_emissions?.toFixed(1) || 0} kg
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {log.total_emissions?.toFixed(1) || 0} kg
                          </p>
                          <p className="text-xs text-muted-foreground">CO₂</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No emissions logged yet. Start tracking your carbon footprint!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
                <CardDescription>Your environmental impact profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Display Name</h4>
                    <p className="text-muted-foreground">
                      {profile?.display_name || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Account</h4>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Environmental Impact</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Emissions</p>
                        <p className="font-medium">{totalEmissions.toFixed(1)} kg CO₂</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Days Tracked</p>
                        <p className="font-medium">{carbonLogs.length} days</p>
                      </div>
                    </div>
                  </div>

                  {carbonLogs.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Breakdown (Last 7 Days)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="flex items-center">
                            <Car className="h-3 w-3 mr-2" />
                            Travel
                          </span>
                          <span>{carbonLogs.reduce((sum, log) => sum + (log.travel_emissions || 0), 0).toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center">
                            <Zap className="h-3 w-3 mr-2" />
                            Energy
                          </span>
                          <span>{carbonLogs.reduce((sum, log) => sum + (log.energy_emissions || 0), 0).toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center">
                            <Utensils className="h-3 w-3 mr-2" />
                            Food
                          </span>
                          <span>{carbonLogs.reduce((sum, log) => sum + (log.food_emissions || 0), 0).toFixed(1)} kg</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <LeaderboardCard />
          </div>
        </div>
      </div>
      
      {/* AI Chat Widget - positioned fixed */}
      <AiChatWidget userProfile={profile} recentData={carbonLogs.slice(0, 3)} />
    </div>
  );
}