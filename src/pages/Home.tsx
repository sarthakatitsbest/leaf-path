import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Users, Award, TrendingDown, Leaf, Zap } from 'lucide-react';
import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import SustainableAISection from '@/components/SustainableAISection';
import FeaturesGrid from '@/components/FeaturesGrid';
import GamificationSection from '@/components/GamificationSection';
import NewsletterSection from '@/components/NewsletterSection';
import FAQSection from '@/components/FAQSection';

export default function Home() {
  const { user } = useAuth();

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
        <div className="max-w-5xl mx-auto">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
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

          {/* Enhanced Action Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
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
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="w-full justify-start glass rounded-2xl h-12">
                      <TrendingDown className="mr-3 h-5 w-5" />
                      <span className="font-poppins font-semibold">Log Emissions</span>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
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
                      transition={{ delay: 0.7 }}
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
                      transition={{ delay: 0.8 }}
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
                      transition={{ delay: 0.9 }}
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