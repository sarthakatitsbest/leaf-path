import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import WellnessWidget from '@/components/WellnessWidget';
import CertificateProgress from '@/components/CertificateProgress';
import BadgeGallery from '@/components/BadgeGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Award, Trophy, Activity } from 'lucide-react';
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem } from '@/components/PageTransition';

export default function Wellness() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pink-50/20 to-accent/5">
      <Navbar />
      
      <PageTransition className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <AnimatedSection className="mb-8 text-center">
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="p-3 rounded-2xl bg-pink-100">
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-poppins font-black gradient-purple-pink bg-clip-text text-transparent mb-2">
            Wellness & Achievements
          </h1>
          <p className="text-muted-foreground font-inter text-lg max-w-2xl mx-auto">
            Track your wellness score, earn certificates, and celebrate your environmental achievements
          </p>
        </AnimatedSection>

        {/* Quick Stats */}
        <StaggerContainer className="grid md:grid-cols-3 gap-6 mb-8">
          <StaggerItem>
            <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-2xl border-0 shadow-lg">
                <CardContent className="pt-6 flex items-center gap-4">
                  <motion.div 
                    className="p-3 rounded-xl bg-pink-100"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Activity className="h-6 w-6 text-pink-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-poppins font-bold">Wellness Score</h3>
                    <p className="text-sm text-muted-foreground">Daily health metrics</p>
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
                    className="p-3 rounded-xl bg-yellow-100"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Award className="h-6 w-6 text-yellow-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-poppins font-bold">Certificates</h3>
                    <p className="text-sm text-muted-foreground">Verified achievements</p>
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
                    className="p-3 rounded-xl bg-purple-100"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-poppins font-bold">Badges</h3>
                    <p className="text-sm text-muted-foreground">Your eco achievements</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <AnimatedSection delay={0.3} className="space-y-6">
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-3xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="font-poppins flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Today's Wellness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WellnessWidget />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-3xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="font-poppins flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-warning" />
                    Your Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BadgeGallery />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>

          {/* Right Column */}
          <AnimatedSection delay={0.4}>
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-3xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="font-poppins flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Certificate Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CertificateProgress />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>
        </div>
      </PageTransition>
    </div>
  );
}
