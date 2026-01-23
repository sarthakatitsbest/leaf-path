import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import LeaderboardCard from '@/components/LeaderboardCard';
import ScoreCard from '@/components/ScoreCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, TrendingUp, Medal } from 'lucide-react';
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem } from '@/components/PageTransition';

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-yellow-50/20 to-warning/5">
      <Navbar />
      
      <PageTransition className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <AnimatedSection className="mb-8 text-center">
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="p-3 rounded-2xl bg-yellow-100">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-poppins font-black gradient-warm bg-clip-text text-transparent mb-2">
            Leaderboard & Rankings
          </h1>
          <p className="text-muted-foreground font-inter text-lg max-w-2xl mx-auto">
            Compete with fellow eco-warriors, climb the ranks, and earn recognition for your sustainability efforts
          </p>
        </AnimatedSection>

        {/* Stats Row */}
        <StaggerContainer className="grid md:grid-cols-3 gap-6 mb-8">
          <StaggerItem>
            <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-2xl border-0 shadow-lg">
                <CardContent className="pt-6 flex items-center gap-4">
                  <motion.div 
                    className="p-3 rounded-xl bg-yellow-100"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Medal className="h-6 w-6 text-yellow-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-poppins font-bold">Your Rank</h3>
                    <motion.p 
                      className="text-2xl font-black text-primary"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      #47
                    </motion.p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-2xl border-0 shadow-lg">
                <CardContent className="pt-6 flex items-center gap-4">
                  <motion.div 
                    className="p-3 rounded-xl bg-green-100"
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-poppins font-bold">Weekly Points</h3>
                    <p className="text-2xl font-black text-primary">+245</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-2xl border-0 shadow-lg">
                <CardContent className="pt-6 flex items-center gap-4">
                  <motion.div 
                    className="p-3 rounded-xl bg-blue-100"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Users className="h-6 w-6 text-blue-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-poppins font-bold">Active Users</h3>
                    <p className="text-2xl font-black text-primary">1,234</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Score Card */}
          <AnimatedSection delay={0.3}>
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-3xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="font-poppins flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Your Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreCard dailyScore={12.5} weeklyTotal={89.2} improvement={15} />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>

          {/* Leaderboard Widget */}
          <AnimatedSection delay={0.4} className="lg:col-span-2">
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-3xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="font-poppins flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-warning" />
                    Top Eco-Warriors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeaderboardWidget />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>
        </div>

        {/* Detailed Leaderboard */}
        <AnimatedSection delay={0.5} className="mt-8">
          <LeaderboardCard />
        </AnimatedSection>
      </PageTransition>
    </div>
  );
}
