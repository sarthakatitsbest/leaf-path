import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapCompareProps {
  lat: number;
  lon: number;
  userId: string;
}

export default function MapCompare({ lat, lon, userId }: MapCompareProps) {
  const [airData, setAirData] = useState<any>(null);
  const [compareData, setCompareData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch air quality data
        const { data: air, error: airError } = await supabase.functions.invoke('air-quality', {
          body: { lat, lon }
        });
        
        if (!airError && air) {
          setAirData(air);
        }

        // Fetch comparison data
        const { data: compare, error: compareError } = await supabase.functions.invoke('carbon-compare', {
          body: { user_id: userId, lat, lon, radius_km: 10, days: 7 }
        });
        
        if (!compareError && compare) {
          setCompareData(compare);
        }
      } catch (e) {
        console.error('Error fetching map data:', e);
      } finally {
        setLoading(false);
      }
    }

    if (lat && lon && userId) fetchData();
  }, [lat, lon, userId]);

  const getAqiInfo = (aqi: number) => {
    if (aqi <= 1) return { color: 'green', label: 'Good' };
    if (aqi <= 2) return { color: 'yellow', label: 'Fair' };
    if (aqi <= 3) return { color: 'orange', label: 'Moderate' };
    if (aqi <= 4) return { color: 'red', label: 'Poor' };
    return { color: 'purple', label: 'Very Poor' };
  };

  const aqi = airData?.data?.list?.[0]?.main?.aqi;
  const aqiInfo = aqi ? getAqiInfo(aqi) : null;

  return (
    <div className="space-y-4">
      <div style={{ height: 400, width: '100%' }}>
        <MapContainer center={[lat, lon]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[lat, lon]}>
            <Popup>
              <div className="text-sm">
                <strong>Your Location</strong>
                {compareData && (
                  <>
                    <p>Your avg: {compareData.user_avg} kg CO₂/day</p>
                    <p>City avg: {compareData.city_avg} kg CO₂/day</p>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
          {aqiInfo && (
            <Circle
              center={[lat, lon]}
              radius={2000}
              pathOptions={{ color: aqiInfo.color, fillOpacity: 0.2 }}
            />
          )}
        </MapContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="font-semibold mb-2">Air Quality</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : aqiInfo ? (
            <p className="text-sm">
              <span style={{ color: aqiInfo.color }}>●</span> {aqiInfo.label} (AQI: {aqi})
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No data available</p>
          )}
        </div>
        
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="font-semibold mb-2">Emissions Comparison</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : compareData ? (
            <>
              <p className="text-sm">You: {compareData.user_avg} kg CO₂</p>
              <p className="text-sm">City: {compareData.city_avg} kg CO₂</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
