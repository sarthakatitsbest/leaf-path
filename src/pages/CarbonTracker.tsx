import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import CarbonEntryForm from '@/components/CarbonEntryForm';
import { EmissionsChart } from '@/components/EmissionsChart';
import CarbonInsights from '@/components/CarbonInsights';
import ReceiptScanner from '@/components/ReceiptScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, Leaf, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function CarbonTracker() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5">
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
            <div className="p-3 rounded-2xl bg-primary/10">
              <TrendingDown className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-poppins font-black gradient-teal-lime bg-clip-text text-transparent mb-2">
            Carbon Tracker
          </h1>
          <p className="text-muted-foreground font-inter text-lg max-w-2xl mx-auto">
            Log your daily activities, track emissions, and get personalized insights to reduce your carbon footprint
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Entry Forms */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="glass rounded-3xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="font-poppins flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  Log Your Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CarbonEntryForm />
              </CardContent>
            </Card>

            <Card className="glass rounded-3xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="font-poppins flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Scan Receipt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReceiptScanner />
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Charts & Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="glass rounded-3xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="font-poppins">Emissions Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <EmissionsChart />
              </CardContent>
            </Card>

            {user && <CarbonInsights userId={user.id} />}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
