import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import WellnessWidget from '@/components/WellnessWidget';
import CertificateProgress from '@/components/CertificateProgress';
import BadgeGallery from '@/components/BadgeGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Award, Trophy, Activity } from 'lucide-react';

export default function Wellness() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pink-50/20 to-accent/5">
      <Navbar />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-pink-100">
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
          </div>
          <h1 className="text-4xl font-poppins font-black gradient-purple-pink bg-clip-text text-transparent mb-2">
            Wellness & Achievements
          </h1>
          <p className="text-muted-foreground font-inter text-lg max-w-2xl mx-auto">
            Track your wellness score, earn certificates, and celebrate your environmental achievements
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="glass rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-pink-100">
                <Activity className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-poppins font-bold">Wellness Score</h3>
                <p className="text-sm text-muted-foreground">Daily health metrics</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-100">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-poppins font-bold">Certificates</h3>
                <p className="text-sm text-muted-foreground">Verified achievements</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-poppins font-bold">Badges</h3>
                <p className="text-sm text-muted-foreground">Your eco achievements</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
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

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
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
        </div>
      </motion.div>
    </div>
  );
}
