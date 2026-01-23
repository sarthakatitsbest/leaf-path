import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  TrendingDown, 
  Leaf, 
  FileText, 
  Download, 
  BarChart3,
  Droplets,
  Trash2,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Shield,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

// Mock data for demo
const mockMetrics = {
  totalCarbon: 12450,
  carbonChange: -12.5,
  totalWater: 45000,
  waterChange: -8.2,
  totalWaste: 1250,
  wasteChange: -15.3,
  employeesOptedIn: 47,
  totalEmployees: 65,
  campaignsCompleted: 8,
  esgScore: 78
};

const mockTrendData = [
  { month: 'Aug', carbon: 1800, water: 5200, waste: 180 },
  { month: 'Sep', carbon: 1650, water: 4800, waste: 165 },
  { month: 'Oct', carbon: 1500, water: 4500, waste: 150 },
  { month: 'Nov', carbon: 1400, water: 4200, waste: 140 },
  { month: 'Dec', carbon: 1300, water: 4000, waste: 130 },
  { month: 'Jan', carbon: 1200, water: 3800, waste: 120 },
];

const mockDepartments = [
  { name: 'Engineering', carbon: 3200, employees: 18, change: -15 },
  { name: 'Marketing', carbon: 2100, employees: 12, change: -8 },
  { name: 'Operations', carbon: 4500, employees: 20, change: -18 },
  { name: 'HR', carbon: 1200, employees: 8, change: -5 },
  { name: 'Sales', carbon: 1450, employees: 7, change: -12 },
];

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    // Simulate loading company data
    const timer = setTimeout(() => {
      setCompany({
        name: 'EcoTech Solutions',
        plan: 'pro',
        domain: 'ecotech.com'
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Leaf className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </div>
    );
  }

  const participationRate = (mockMetrics.employeesOptedIn / mockMetrics.totalEmployees) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <AnimatedSection delay={0}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold">{company?.name || 'Company Dashboard'}</h1>
                  <Badge variant="secondary" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 border-amber-500/30">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro Plan
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Environmental, Social & Governance metrics overview
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/company/reports">
                  <Button variant="outline" className="rounded-xl">
                    <FileText className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </Link>
                <Link to="/company/employees">
                  <Button className="rounded-xl">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Team
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* ESG Score Card */}
          <AnimatedSection delay={0.1}>
            <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary-foreground">{mockMetrics.esgScore}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-background">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">ESG Performance Score</h3>
                      <p className="text-muted-foreground text-sm">Based on carbon reduction, sustainability practices & team engagement</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          +5 from last month
                        </Badge>
                        <Badge variant="outline">Top 15% in Industry</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Link to="/company/reports">
                      <Button size="lg" className="rounded-xl">
                        <Download className="h-4 w-4 mr-2" />
                        Generate ESG Report
                      </Button>
                    </Link>
                    <span className="text-xs text-muted-foreground">PDF & CSV available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* KPI Cards */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StaggerItem>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Carbon Emissions</p>
                      <p className="text-2xl font-bold">{mockMetrics.totalCarbon.toLocaleString()} kg</p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowDownRight className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">{mockMetrics.carbonChange}%</span>
                        <span className="text-xs text-muted-foreground">vs last quarter</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Water Consumption</p>
                      <p className="text-2xl font-bold">{mockMetrics.totalWater.toLocaleString()} L</p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowDownRight className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">{mockMetrics.waterChange}%</span>
                        <span className="text-xs text-muted-foreground">vs last quarter</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <Droplets className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Waste Reduction</p>
                      <p className="text-2xl font-bold">{mockMetrics.totalWaste.toLocaleString()} kg</p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowDownRight className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">{mockMetrics.wasteChange}%</span>
                        <span className="text-xs text-muted-foreground">vs last quarter</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10">
                      <Trash2 className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Team Participation</p>
                      <p className="text-2xl font-bold">{mockMetrics.employeesOptedIn}/{mockMetrics.totalEmployees}</p>
                      <div className="mt-2">
                        <Progress value={participationRate} className="h-2" />
                        <span className="text-xs text-muted-foreground">{participationRate.toFixed(0)}% opted in</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>

          {/* Charts Section */}
          <AnimatedSection delay={0.3}>
            <Tabs defaultValue="carbon" className="mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="carbon">Carbon</TabsTrigger>
                <TabsTrigger value="water">Water</TabsTrigger>
                <TabsTrigger value="waste">Waste</TabsTrigger>
              </TabsList>

              <TabsContent value="carbon">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Carbon Emissions Trend
                    </CardTitle>
                    <CardDescription>Monthly CO2 emissions in kg (last 6 months)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockTrendData}>
                          <defs>
                            <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="carbon" 
                            stroke="hsl(var(--primary))" 
                            fillOpacity={1} 
                            fill="url(#colorCarbon)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="water">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      Water Consumption Trend
                    </CardTitle>
                    <CardDescription>Monthly water usage in liters (last 6 months)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockTrendData}>
                          <defs>
                            <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="water" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorWater)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="waste">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-amber-500" />
                      Waste Reduction Trend
                    </CardTitle>
                    <CardDescription>Monthly waste in kg (last 6 months)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockTrendData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Bar dataKey="waste" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </AnimatedSection>

          {/* Department Breakdown */}
          <AnimatedSection delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Department Performance
                </CardTitle>
                <CardDescription>Carbon emissions by department (anonymized)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDepartments.map((dept, index) => (
                    <motion.div
                      key={dept.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{dept.name}</span>
                          <span className="text-sm text-muted-foreground">{dept.employees} employees</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={(dept.carbon / 5000) * 100} className="flex-1 h-2" />
                          <span className="text-sm font-medium w-20">{dept.carbon} kg</span>
                          <Badge className={dept.change < -10 ? 'bg-green-500/20 text-green-600' : 'bg-amber-500/20 text-amber-600'}>
                            {dept.change}%
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Quick Actions */}
          <AnimatedSection delay={0.5}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Link to="/company/employees">
                <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Invite Employees</h3>
                      <p className="text-sm text-muted-foreground">Grow your sustainability team</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/company/reports">
                <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-secondary/10">
                      <FileText className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Generate Reports</h3>
                      <p className="text-sm text-muted-foreground">Download ESG PDF & CSV</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/company/pricing">
                <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10">
                      <Sparkles className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Upgrade Plan</h3>
                      <p className="text-sm text-muted-foreground">Unlock enterprise features</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </AnimatedSection>
        </main>
      </PageTransition>
    </div>
  );
}
