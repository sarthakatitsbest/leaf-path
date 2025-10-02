import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { supabase } from '@/integrations/supabase/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EmissionsChartProps {
  userId: string;
  days?: number;
}

export default function EmissionsChart({ userId, days = 7 }: EmissionsChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAggregates() {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('carbon-aggregates', {
          body: { user_id: userId, days }
        });

        if (!error && data) {
          setChartData({
            labels: data.labels,
            datasets: [
              {
                label: 'Total CO₂ (kg)',
                data: data.totals,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
              },
              {
                label: 'Transport',
                data: data.breakdowns.transport,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.3,
              },
              {
                label: 'Energy',
                data: data.breakdowns.energy,
                borderColor: 'rgb(255, 205, 86)',
                backgroundColor: 'rgba(255, 205, 86, 0.2)',
                tension: 0.3,
              },
              {
                label: 'Food',
                data: data.breakdowns.food,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.3,
              },
            ],
          });
        }
      } catch (e) {
        console.error('Error fetching aggregates:', e);
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchAggregates();
  }, [userId, days]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Carbon Emissions - Last ${days} Days`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'kg CO₂',
        },
      },
    },
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading chart...</div>;
  }

  if (!chartData) {
    return <div className="flex items-center justify-center h-64">No data available</div>;
  }

  return <Line data={chartData} options={options} />;
}
