import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CarbonEntry {
  transport?: {
    mode: string;
    km: number;
  }[];
  energy?: {
    electricity_kwh?: number;
    gas_units?: number;
  };
  food?: {
    meat_meals?: number;
    vegetarian_meals?: number;
  };
  waste?: {
    kg?: number;
  };
}

export default function CarbonEntryForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [transportMode, setTransportMode] = useState('car');
  const [transportKm, setTransportKm] = useState('');
  const [electricityKwh, setElectricityKwh] = useState('');
  const [gasUnits, setGasUnits] = useState('');
  const [meatMeals, setMeatMeals] = useState('');
  const [vegetarianMeals, setVegetarianMeals] = useState('');
  const [wasteKg, setWasteKg] = useState('');
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const entry: CarbonEntry = {};

      // Add transport data if provided
      if (transportKm && Number(transportKm) > 0) {
        entry.transport = [{
          mode: transportMode,
          km: Number(transportKm)
        }];
      }

      // Add energy data if provided  
      const elecValue = electricityKwh ? Number(electricityKwh) : 0;
      const gasValue = gasUnits ? Number(gasUnits) : 0;
      if (elecValue > 0 || gasValue > 0) {
        entry.energy = {
          electricity_kwh: elecValue > 0 ? elecValue : undefined,
          gas_units: gasValue > 0 ? gasValue : undefined
        };
      }

      // Add food data if provided
      const meatValue = meatMeals ? Number(meatMeals) : 0;
      const vegValue = vegetarianMeals ? Number(vegetarianMeals) : 0;
      if (meatValue > 0 || vegValue > 0) {
        entry.food = {
          meat_meals: meatValue > 0 ? meatValue : undefined,
          vegetarian_meals: vegValue > 0 ? vegValue : undefined
        };
      }

      // Add waste data if provided
      const wasteValue = wasteKg ? Number(wasteKg) : 0;
      if (wasteValue > 0) {
        entry.waste = { kg: wasteValue };
      }

      // Ensure we have at least some data
      if (Object.keys(entry).length === 0) {
        throw new Error('Please enter at least one value to track your carbon footprint');
      }

      const response = await supabase.functions.invoke('carbon-submit', {
        body: JSON.stringify({ entry }),
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      
      toast({
        title: "Entry Submitted Successfully!",
        description: `CO₂ Emissions: ${result.data.co2_emissions} kg | Points Earned: ${result.data.points_awarded}`,
      });

      // Reset form
      setTransportKm('');
      setElectricityKwh('');
      setGasUnits('');
      setMeatMeals('');
      setVegetarianMeals('');
      setWasteKg('');

      onSubmitSuccess?.();
    } catch (error: any) {
      console.error('Error submitting carbon entry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit carbon entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full bg-gradient-to-br from-background to-secondary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Log Your Daily Carbon Footprint
          </CardTitle>
          <CardDescription>
            Track your daily activities to calculate your carbon emissions and earn eco-points!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transport Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">🚗 Transportation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transport-mode">Mode of Transport</Label>
                  <Select value={transportMode} onValueChange={setTransportMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="bike">Bicycle</SelectItem>
                      <SelectItem value="motorbike">Motorbike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transport-km">Distance (km)</Label>
                  <Input
                    id="transport-km"
                    type="number"
                    placeholder="0"
                    value={transportKm}
                    onChange={(e) => setTransportKm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Energy Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">⚡ Energy Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="electricity">Electricity (kWh)</Label>
                  <Input
                    id="electricity"
                    type="number"
                    placeholder="0"
                    value={electricityKwh}
                    onChange={(e) => setElectricityKwh(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gas">Gas (units)</Label>
                  <Input
                    id="gas"
                    type="number"
                    placeholder="0"
                    value={gasUnits}
                    onChange={(e) => setGasUnits(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Food Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">🍽️ Food Consumption</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meat-meals">Meat Meals</Label>
                  <Input
                    id="meat-meals"
                    type="number"
                    placeholder="0"
                    value={meatMeals}
                    onChange={(e) => setMeatMeals(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vegetarian-meals">Vegetarian Meals</Label>
                  <Input
                    id="vegetarian-meals"
                    type="number"
                    placeholder="0"
                    value={vegetarianMeals}
                    onChange={(e) => setVegetarianMeals(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Waste Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">🗑️ Waste</h3>
              <div>
                <Label htmlFor="waste">Waste Generated (kg)</Label>
                <Input
                  id="waste"
                  type="number"
                  placeholder="0"
                  value={wasteKg}
                  onChange={(e) => setWasteKg(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
            >
              {loading ? "Calculating..." : "Submit Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}