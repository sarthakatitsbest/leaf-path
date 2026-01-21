import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Hotspot {
  id: string;
  city: string;
  area_name: string;
  location_lat: number;
  location_lng: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  sources: string[];
}

interface HotspotStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  average_score: number;
}

const severityColors = {
  critical: { bg: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-500/10 text-red-600 border-red-200' },
  high: { bg: 'bg-orange-500', text: 'text-orange-600', badge: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  medium: { bg: 'bg-amber-500', text: 'text-amber-600', badge: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  low: { bg: 'bg-green-500', text: 'text-green-600', badge: 'bg-green-500/10 text-green-600 border-green-200' },
};

export default function PlasticHotspotMap() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [stats, setStats] = useState<HotspotStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const fetchHotspots = async (lat?: number, lng?: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (lat && lng) {
        params.set('lat', lat.toString());
        params.set('lng', lng.toString());
      }

      const response = await fetch(
        `https://fbmphwihmfzbbyavgusl.supabase.co/functions/v1/plastic-hotspots?${params}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibXBod2lobWZ6YmJ5YXZndXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTAxMzIsImV4cCI6MjA3MzA2NjEzMn0.etMn07UhYbVu2NEiYQzBgIYO_7O3SqCL2u3tiOR18KA',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch hotspots');

      const data = await response.json();
      setHotspots(data.hotspots || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Hotspots error:', error);
      toast({
        title: 'Failed to load hotspots',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          fetchHotspots(loc.lat, loc.lng);
        },
        () => {
          // Fallback: fetch without location
          fetchHotspots();
        }
      );
    } else {
      fetchHotspots();
    }
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-destructive" />
            Plastic Hotspots
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => userLocation && fetchHotspots(userLocation.lat, userLocation.lng)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <p className="text-lg font-bold text-red-600">{stats.critical}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <p className="text-lg font-bold text-orange-600">{stats.high}</p>
                  <p className="text-xs text-muted-foreground">High</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <p className="text-lg font-bold text-amber-600">{stats.medium}</p>
                  <p className="text-xs text-muted-foreground">Medium</p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <p className="text-lg font-bold text-green-600">{stats.low}</p>
                  <p className="text-xs text-muted-foreground">Low</p>
                </div>
              </div>
            )}

            {/* Visual Map Representation */}
            <div className="relative h-48 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg overflow-hidden">
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Hotspot markers */}
              {hotspots.slice(0, 8).map((hotspot, index) => {
                // Calculate position based on index for visual representation
                const angle = (index / 8) * Math.PI * 2;
                const radius = 30 + (hotspot.score / 100) * 20;
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;
                
                return (
                  <motion.div
                    key={hotspot.id || index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="absolute"
                    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full ${severityColors[hotspot.severity].bg} animate-pulse`}
                      title={`${hotspot.area_name}: ${hotspot.score}%`}
                    />
                  </motion.div>
                );
              })}

              {/* Center marker (user location) */}
              {userLocation && (
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
                </div>
              )}
            </div>

            {/* Hotspot List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {hotspots.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-4">
                  No hotspots detected in your area
                </p>
              ) : (
                hotspots.slice(0, 5).map((hotspot, index) => (
                  <motion.div
                    key={hotspot.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSeverityIcon(hotspot.severity)}</span>
                      <div>
                        <p className="text-sm font-medium">{hotspot.area_name}</p>
                        <p className="text-xs text-muted-foreground">{hotspot.city}</p>
                      </div>
                    </div>
                    <Badge className={severityColors[hotspot.severity].badge}>
                      {hotspot.score}%
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>

            {/* Warning for critical areas */}
            {stats && stats.critical > 0 && (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">
                  {stats.critical} critical hotspot{stats.critical > 1 ? 's' : ''} detected. 
                  Immediate intervention recommended.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
