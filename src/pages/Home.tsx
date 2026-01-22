import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Award, 
  TrendingDown, 
  Leaf, 
  Zap,
  MapPin,
  Bot,
  Recycle,
  Heart,
  Trophy,
  ArrowRight
} from 'lucide-react';
import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import SustainableAISection from '@/components/SustainableAISection';
import FeaturesGrid from '@/components/FeaturesGrid';
import GamificationSection from '@/components/GamificationSection';
import NewsletterSection from '@/components/NewsletterSection';
import FAQSection from '@/components/FAQSection';

const featureCards = [
  {
    path: '/carbon',
    title: 'Carbon Tracker',
    description: 'Log daily activities and track your emissions',
    icon: TrendingDown,
    gradient: 'gradient-teal-lime',
    color: 'text-primary'
  },
  {
    path: '/campaigns',
    title: 'Go-Green Campaigns',
    description: 'Join community environmental initiatives',
    icon: Users,
    gradient: 'gradient-purple-pink',
    color: 'text-accent'
  },
  {
    path: '/map',
    title: 'Eco Map',
    description: 'Find recycling centers, EV chargers & more',
    icon: MapPin,
    gradient: 'gradient-teal-lime',
    color: 'text-secondary'
  },
  {
    path: '/plastic',
    title: 'Plastic AI',
    description: 'Classify plastic & analyze sustainability pitches',
    icon: Recycle,
    gradient: 'gradient-warm',
    color: 'text-green-600'
  },
  {
    path: '/wellness',
    title: 'Wellness & Badges',
    description: 'Track wellness score & earn certificates',
    icon: Heart,
    gradient: 'gradient-purple-pink',
    color: 'text-pink-500'
  },
  {
    path: '/leaderboard',
    title: 'Leaderboard',
    description: 'Compete with eco-warriors globally',
    icon: Trophy,
    gradient: 'gradient-warm',
    color: 'text-warning'
  },
  {
    path: '/chat',
    title: 'AI Assistant',
    description: 'Get personalized eco-tips from AI',
    icon: Bot,
    gradient: 'gradient-purple-pink',
    color: 'text-accent'
  },
  {
    path: '/dashboard',
    title: 'Full Dashboard',
    description: 'Access all features in one place',
    icon: BarChart3,
    gradient: 'gradient-teal-lime',
    color: 'text-primary'
  }
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <SustainableAISection />
        <FeaturesGrid />
        <GamificationSection />
        <NewsletterSection />
        <FAQSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-teal-50/20">
      <Navbar />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-6 py-8"
      >
        <div className="max-w-6xl mx-auto">
          {/* Animated Welcome */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-poppins font-black gradient-purple-pink bg-clip-text text-transparent mb-2">
              Welcome back, eco-warrior! 🌍
            </h1>
            <p className="text-muted-foreground font-inter text-lg">
              Here's your environmental impact overview
            </p>
          </motion.div>

          {/* Animated Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => navigate('/carbon')}
              className="cursor-pointer"
            >
              <Card className="glass rounded-3xl border-0 shadow-xl overflow-hidden">
                <div className="absolute inset-0 gradient-teal-lime opacity-10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-poppins font-semibold">Today's Emissions</CardTitle>
                  <TrendingDown className="h-5 w-5 text-primary animate-pulse" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-poppins font-black gradient-teal-lime bg-clip-text text-transparent">2.4 kg</div>
                  <p className="text-xs text-muted-foreground font-inter">
                    -12% from yesterday 📉
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => navigate('/dashboard')}
              className="cursor-pointer"
            >
              <Card className="glass rounded-3xl border-0 shadow-xl overflow-hidden">
                <div className="absolute inset-0 gradient-purple-pink opacity-10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-poppins font-semibold">Weekly Average</CardTitle>
                  <BarChart3 className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-poppins font-black text-primary">18.7 kg</div>
                  <p className="text-xs text-muted-foreground font-inter">
                    +2% from last week 📊
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => navigate('/wellness')}
              className="cursor-pointer"
            >
              <Card className="glass rounded-3xl border-0 shadow-xl overflow-hidden">
                <div className="absolute inset-0 gradient-warm opacity-10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-poppins font-semibold">Total Points</CardTitle>
                  <Award className="h-5 w-5 text-warning animate-pulse" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-poppins font-black text-primary">1,245</div>
                  <p className="text-xs text-muted-foreground font-inter">
                    +32 this week 🏆
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => navigate('/leaderboard')}
              className="cursor-pointer"
            >
              <Card className="glass rounded-3xl border-0 shadow-xl overflow-hidden">
                <div className="absolute inset-0 gradient-teal-lime opacity-10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-poppins font-semibold">Leaderboard Rank</CardTitle>
                  <Users className="h-5 w-5 text-secondary" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-poppins font-black text-primary">#47</div>
                  <p className="text-xs text-muted-foreground font-inter">
                    Top 15% this month 🌟
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Feature Navigation Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-poppins font-bold mb-6 text-center">
              Explore Features
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featureCards.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(feature.path)}
                    className="cursor-pointer"
                  >
                    <Card className="glass rounded-2xl border-0 shadow-lg overflow-hidden h-full hover:shadow-xl transition-shadow">
                      <div className={`absolute inset-0 ${feature.gradient} opacity-5`} />
                      <CardContent className="relative z-10 p-4">
                        <div className={`p-2 rounded-xl ${feature.gradient} bg-opacity-10 w-fit mb-3`}>
                          <Icon className={`h-6 w-6 ${feature.color}`} />
                        </div>
                        <h3 className="font-poppins font-bold text-sm mb-1">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                        <div className="flex items-center mt-3 text-xs text-primary font-medium">
                          <span>Open</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Enhanced Action Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="glass rounded-3xl border-0 shadow-xl overflow-hidden">
                <div className="absolute inset-0 gradient-purple-pink opacity-5" />
                <CardHeader className="relative z-10">
                  <CardTitle className="font-poppins font-bold flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="font-inter">
                    Log your daily activities and make an impact
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <Link to="/dashboard">
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full justify-start gradient-teal-lime text-white border-0 rounded-2xl h-12">
                        <BarChart3 className="mr-3 h-5 w-5" />
                        <span className="font-poppins font-semibold">View Full Dashboard</span>
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/carbon">
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button variant="outline" className="w-full justify-start glass rounded-2xl h-12">
                        <TrendingDown className="mr-3 h-5 w-5" />
                        <span className="font-poppins font-semibold">Log Emissions</span>
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="glass rounded-3xl border-0 shadow-xl overflow-hidden">
                <div className="absolute inset-0 gradient-warm opacity-5" />
                <CardHeader className="relative z-10">
                  <CardTitle className="font-poppins font-bold flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-secondary animate-pulse" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="font-inter">
                    Your latest environmental actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                      className="flex items-center p-3 bg-white/30 rounded-2xl"
                    >
                      <div className="w-3 h-3 bg-secondary rounded-full mr-3 animate-pulse"></div>
                      <div>
                        <p className="text-sm font-poppins font-semibold">Walked to work</p>
                        <p className="text-xs text-muted-foreground font-inter">Saved 2.1 kg CO₂ 🚶‍♂️</p>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                      className="flex items-center p-3 bg-white/30 rounded-2xl"
                    >
                      <div className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></div>
                      <div>
                        <p className="text-sm font-poppins font-semibold">Used renewable energy</p>
                        <p className="text-xs text-muted-foreground font-inter">+50 points earned ⚡</p>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 }}
                      className="flex items-center p-3 bg-white/30 rounded-2xl"
                    >
                      <div className="w-3 h-3 bg-warning rounded-full mr-3 animate-pulse"></div>
                      <div>
                        <p className="text-sm font-poppins font-semibold">Vegetarian meal</p>
                        <p className="text-xs text-muted-foreground font-inter">Reduced food emissions 🥗</p>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}