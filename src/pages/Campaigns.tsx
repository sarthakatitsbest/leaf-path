import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { CampaignList } from '@/components/campaigns/CampaignList';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MapPin, Award } from 'lucide-react';
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem } from '@/components/PageTransition';

export default function Campaigns() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/5">
      <Navbar />
      
      <PageTransition className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <AnimatedSection className="mb-8 text-center">
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="p-3 rounded-2xl bg-accent/10">
              <Users className="h-8 w-8 text-accent" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-poppins font-black gradient-purple-pink bg-clip-text text-transparent mb-2">
            Go-Green Campaigns
          </h1>
          <p className="text-muted-foreground font-inter text-lg max-w-2xl mx-auto">
            Join community-driven environmental initiatives, earn certificates, and make a collective impact
          </p>
        </AnimatedSection>

        {/* Feature Highlights */}
        <StaggerContainer className="grid md:grid-cols-3 gap-6 mb-8">
          <StaggerItem>
            <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-2xl border-0 shadow-lg text-center h-full">
                <CardContent className="pt-6">
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
                  </motion.div>
                  <h3 className="font-poppins font-bold mb-1">GPS Check-in</h3>
                  <p className="text-sm text-muted-foreground">Verify participation with location</p>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-2xl border-0 shadow-lg text-center h-full">
                <CardContent className="pt-6">
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <Users className="h-10 w-10 text-accent mx-auto mb-3" />
                  </motion.div>
                  <h3 className="font-poppins font-bold mb-1">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">Work together for bigger impact</p>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass rounded-2xl border-0 shadow-lg text-center h-full">
                <CardContent className="pt-6">
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <Award className="h-10 w-10 text-warning mx-auto mb-3" />
                  </motion.div>
                  <h3 className="font-poppins font-bold mb-1">Earn Certificates</h3>
                  <p className="text-sm text-muted-foreground">Get verified participation proof</p>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        {/* Main Content */}
        <AnimatedSection delay={0.4}>
          <CampaignList />
        </AnimatedSection>
      </PageTransition>
    </div>
  );
}
