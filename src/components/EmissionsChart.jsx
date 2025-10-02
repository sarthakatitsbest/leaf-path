import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmissionsChart({ userId, days = 7 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: fetchError } = await supabase.functions.invoke(
          "carbon-aggregates",
          {
            body: { user_id: userId, days },
          }
        );

        if (fetchError) throw fetchError;

        if (result && result.labels && result.totals) {
          const chartData = result.labels.map((label, index) => ({
            date: new Date(label).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            total: result.totals[index] || 0,
            transport: result.breakdowns?.transport?.[index] || 0,
            energy: result.breakdowns?.energy?.[index] || 0,
            food: result.breakdowns?.food?.[index] || 0,
          }));
          setData(chartData);
        }
      } catch (e) {
        console.error("Error fetching emissions data:", e);
        setError("Failed to load emissions data");
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchData();
    }
  }, [userId, days]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Emissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Emissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {error || "No data available"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Emissions Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{
                value: "kg CO₂",
                angle: -90,
                position: "insideLeft",
                style: { fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "hsl(var(--card-foreground))" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              name="Total CO₂"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="transport"
              name="Transport"
              stroke="#8884d8"
              strokeWidth={1.5}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="energy"
              name="Energy"
              stroke="#82ca9d"
              strokeWidth={1.5}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="food"
              name="Food"
              stroke="#ffc658"
              strokeWidth={1.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
