import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Internal mappings - hidden from user
const HOME_ENERGY_MAP = {
  low: { electricity_kwh: 3, gas_kwh: 1 },
  normal: { electricity_kwh: 6, gas_kwh: 3 },
  high: { electricity_kwh: 12, gas_kwh: 6 }
};

const WASTE_MAP = {
  very_low: 0.2,
  normal: 0.6,
  high: 1.2
};

type HomeEnergyLevel = 'low' | 'normal' | 'high';
type WasteLevel = 'very_low' | 'normal' | 'high';

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
  const [meatMeals, setMeatMeals] = useState('');
  const [vegetarianMeals, setVegetarianMeals] = useState('');
  
  // New simplified inputs
  const [homeEnergy, setHomeEnergy] = useState<HomeEnergyLevel>('normal');
  const [wasteLevel, setWasteLevel] = useState<WasteLevel>('normal');
  
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

      // Convert home energy selection to internal values
      const energyValues = HOME_ENERGY_MAP[homeEnergy];
      entry.energy = {
        electricity_kwh: energyValues.electricity_kwh,
        gas_units: energyValues.gas_kwh
      };

      // Add food data if provided
      const meatValue = meatMeals ? Number(meatMeals) : 0;
      const vegValue = vegetarianMeals ? Number(vegetarianMeals) : 0;
      if (meatValue > 0 || vegValue > 0) {
        entry.food = {
          meat_meals: meatValue > 0 ? meatValue : undefined,
          vegetarian_meals: vegValue > 0 ? vegValue : undefined
        };
      }

      // Convert waste selection to internal value
      entry.waste = { kg: WASTE_MAP[wasteLevel] };

      const response = await supabase.functions.invoke('carbon-submit', {
        body: { entry }
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      
      toast({
        title: "🌱 Entry Logged!",
        description: `CO₂: ${result.data.co2_emissions} kg | +${result.data.points_awarded} eco-points`,
      });

      // Reset form
      setTransportKm('');
      setMeatMeals('');
      setVegetarianMeals('');
      setHomeEnergy('normal');
      setWasteLevel('normal');

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

  const SelectionButton = ({ 
    selected, 
    onClick, 
    children,
    variant = 'default'
  }: { 
    selected: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
    variant?: 'low' | 'normal' | 'high' | 'default';
  }) => {
    const variantColors = {
      low: 'border-green-500 bg-green-500/20 text-green-700 dark:text-green-300',
      normal: 'border-yellow-500 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      high: 'border-red-500 bg-red-500/20 text-red-700 dark:text-red-300',
      default: 'border-primary bg-primary/20 text-primary'
    };

    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200",
          selected 
            ? variantColors[variant]
            : "border-border bg-background hover:bg-muted text-muted-foreground"
        )}
      >
        {children}
      </button>
    );
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
            Log Today's Impact
          </CardTitle>
          <CardDescription>
            Quick & easy — just tap your choices!
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

            {/* Home Energy Section - SIMPLIFIED */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">⚡ Home Energy Today</h3>
                <p className="text-sm text-muted-foreground">Estimated using household averages</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <SelectionButton 
                  selected={homeEnergy === 'low'} 
                  onClick={() => setHomeEnergy('low')}
                  variant="low"
                >
                  🌿 Low
                </SelectionButton>
                <SelectionButton 
                  selected={homeEnergy === 'normal'} 
                  onClick={() => setHomeEnergy('normal')}
                  variant="normal"
                >
                  ⚡ Normal
                </SelectionButton>
                <SelectionButton 
                  selected={homeEnergy === 'high'} 
                  onClick={() => setHomeEnergy('high')}
                  variant="high"
                >
                  🔥 High
                </SelectionButton>
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
                    min="0"
                    max="10"
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
                    min="0"
                    max="10"
                    value={vegetarianMeals}
                    onChange={(e) => setVegetarianMeals(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Waste Section - SIMPLIFIED */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">🗑️ Waste Today</h3>
              <div className="flex flex-wrap gap-3">
                <SelectionButton 
                  selected={wasteLevel === 'very_low'} 
                  onClick={() => setWasteLevel('very_low')}
                  variant="low"
                >
                  ♻️ Very little
                </SelectionButton>
                <SelectionButton 
                  selected={wasteLevel === 'normal'} 
                  onClick={() => setWasteLevel('normal')}
                  variant="normal"
                >
                  🗑️ Normal
                </SelectionButton>
                <SelectionButton 
                  selected={wasteLevel === 'high'} 
                  onClick={() => setWasteLevel('high')}
                  variant="high"
                >
                  🚮 A lot
                </SelectionButton>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
            >
              {loading ? "Logging..." : "🌍 Log Today"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
