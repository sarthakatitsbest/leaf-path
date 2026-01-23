import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import PlasticClassifier from '@/components/PlasticClassifier';
import PlasticPitchAnalyzer from '@/components/PlasticPitchAnalyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Mic, Recycle, Brain } from 'lucide-react';
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem } from '@/components/PageTransition';

export default function PlasticIntelligence() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-primary/5">
      <Navbar />
      
      <PageTransition className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <AnimatedSection className="mb-8 text-center">
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="p-3 rounded-2xl bg-green-100">
              <Recycle className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-poppins font-black gradient-teal-lime bg-clip-text text-transparent mb-2">
            Plastic Waste Intelligence
          </h1>
          <p className="text-muted-foreground font-inter text-lg max-w-2xl mx-auto">
            AI-powered tools to classify plastic types and analyze sustainability pitches
          </p>
        </AnimatedSection>

        {/* Feature Highlights */}
        <StaggerContainer className="grid md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
          <StaggerItem>
            <motion.div 
              whileHover={{ y: -10, scale: 1.03 }} 
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="glass rounded-2xl border-0 shadow-lg h-full">
                <CardContent className="pt-6 text-center">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Camera className="h-10 w-10 text-primary mx-auto mb-3" />
                  </motion.div>
                  <h3 className="font-poppins font-bold mb-1">Image Classification</h3>
                  <p className="text-sm text-muted-foreground">Identify plastic types from photos</p>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div 
              whileHover={{ y: -10, scale: 1.03 }} 
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="glass rounded-2xl border-0 shadow-lg h-full">
                <CardContent className="pt-6 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Mic className="h-10 w-10 text-accent mx-auto mb-3" />
                  </motion.div>
                  <h3 className="font-poppins font-bold mb-1">Pitch Analyzer</h3>
                  <p className="text-sm text-muted-foreground">AI analysis of sustainability ideas</p>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        {/* Main Tools */}
        <AnimatedSection delay={0.3}>
          <Tabs defaultValue="classifier" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-2xl h-12">
              <TabsTrigger value="classifier" className="rounded-xl font-poppins">
                <Camera className="h-4 w-4 mr-2" />
                Plastic Classifier
              </TabsTrigger>
              <TabsTrigger value="analyzer" className="rounded-xl font-poppins">
                <Brain className="h-4 w-4 mr-2" />
                Pitch Analyzer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classifier">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass rounded-3xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="font-poppins flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" />
                      Classify Plastic from Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PlasticClassifier />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="analyzer">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass rounded-3xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="font-poppins flex items-center gap-2">
                      <Brain className="h-5 w-5 text-accent" />
                      Analyze Sustainability Pitch
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PlasticPitchAnalyzer />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </AnimatedSection>
      </PageTransition>
    </div>
  );
}
