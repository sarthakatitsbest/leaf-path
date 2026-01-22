import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import MapPOI from '@/components/MapPOI';
import PlasticHotspotMap from '@/components/PlasticHotspotMap';
import { MapCompare } from '@/components/MapCompare';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Recycle, Zap, Bus } from 'lucide-react';

export default function MapView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
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
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-poppins font-black gradient-teal-lime bg-clip-text text-transparent mb-2">
            Eco Map & Locations
          </h1>
          <p className="text-muted-foreground font-inter text-lg max-w-2xl mx-auto">
            Discover nearby eco-friendly locations, recycling centers, EV chargers, and public transit options
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
              <div className="p-3 rounded-xl bg-green-100">
                <Recycle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-poppins font-bold">Recycling Centers</h3>
                <p className="text-sm text-muted-foreground">Find drop-off points</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-poppins font-bold">EV Chargers</h3>
                <p className="text-sm text-muted-foreground">Electric vehicle stations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <Bus className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-poppins font-bold">Public Transit</h3>
                <p className="text-sm text-muted-foreground">Reduce your footprint</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Map Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="poi" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 rounded-2xl h-12">
              <TabsTrigger value="poi" className="rounded-xl font-poppins">
                <MapPin className="h-4 w-4 mr-2" />
                Eco POIs
              </TabsTrigger>
              <TabsTrigger value="hotspots" className="rounded-xl font-poppins">
                <Recycle className="h-4 w-4 mr-2" />
                Plastic Hotspots
              </TabsTrigger>
              <TabsTrigger value="compare" className="rounded-xl font-poppins">
                <Zap className="h-4 w-4 mr-2" />
                City Compare
              </TabsTrigger>
            </TabsList>

            <TabsContent value="poi">
              <Card className="glass rounded-3xl border-0 shadow-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-poppins">Nearby Eco-Friendly Locations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px]">
                    <MapPOI />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hotspots">
              <Card className="glass rounded-3xl border-0 shadow-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-poppins">Plastic Waste Hotspots</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlasticHotspotMap />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compare">
              <Card className="glass rounded-3xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="font-poppins">City Carbon Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <MapCompare />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
