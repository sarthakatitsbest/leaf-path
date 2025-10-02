import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTips } from '@/utils/tipEngine';

interface CarbonInsightsProps {
  userId: string;
}

export default function CarbonInsights({ userId }: CarbonInsightsProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.functions.invoke('carbon-aggregates', {
          body: { user_id: userId, days: 7 }
        });

        if (!error && data) {
          const totalCo2 = data.totals.reduce((a: number, b: number) => a + b, 0);
          const transportKg = data.breakdowns.transport.reduce((a: number, b: number) => a + b, 0);
          const energyKg = data.breakdowns.energy.reduce((a: number, b: number) => a + b, 0);
          const foodKg = data.breakdowns.food.reduce((a: number, b: number) => a + b, 0);
          
          const summary = {
            total_co2: totalCo2,
            transport_kg: transportKg,
            food_kg: foodKg,
            waste_kg: 0,
            energy_kg: energyKg,
            avg_per_day: totalCo2 / 7
          };
          
          const tips = getTips(summary);
          setInsights({ summary, tips, data });
        }
      } catch (e) {
        console.error('Error fetching insights:', e);
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchInsights();
  }, [userId]);

  if (loading) {
    return <Card><CardContent className="p-6">Loading insights...</CardContent></Card>;
  }

  if (!insights) {
    return <Card><CardContent className="p-6">No data available</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Total CO₂: {insights.summary.total_co2.toFixed(2)} kg</p>
            <p>Daily Average: {insights.summary.avg_per_day.toFixed(2)} kg</p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="p-2 bg-muted rounded">
                <p className="text-xs text-muted-foreground">Transport</p>
                <p className="font-semibold">{insights.summary.transport_kg.toFixed(1)} kg</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="text-xs text-muted-foreground">Energy</p>
                <p className="font-semibold">{insights.summary.energy_kg.toFixed(1)} kg</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="text-xs text-muted-foreground">Food</p>
                <p className="font-semibold">{insights.summary.food_kg.toFixed(1)} kg</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insights.tips.map((tip: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
