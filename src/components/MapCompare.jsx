// Plain JS component to avoid TypeScript circular dependencies
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function MapCompare({ lat, lon, userId, radiusKm = 10 }) {
  const [leafletModules, setLeafletModules] = useState(null);
  const [air, setAir] = useState(null);
  const [compare, setCompare] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch air quality data
        const { data: airData, error: airError } = await supabase.functions.invoke('air-quality', {
          body: { lat, lon }
        });

        if (airError) throw airError;
        setAir(airData);

        // Fetch comparison data
        const { data: compareData, error: compareError } = await supabase.functions.invoke('carbon-compare', {
          body: { user_id: userId, lat, lon, radius_km: radiusKm, days: 7 }
        });

        if (compareError) throw compareError;
        setCompare(compareData);
      } catch (e) {
        console.error("Error fetching map data:", e);
        setError("Failed to load map data");
      } finally {
        setLoading(false);
      }
    }

    if (lat && lon && userId) {
      fetchData();
    }
  }, [lat, lon, userId, radiusKm]);

  useEffect(() => {
    let mounted = true;

    async function loadLeaflet() {
      try {
        // Dynamic import to avoid build-time TypeScript issues
        const L = await import("leaflet");
        const RL = await import("react-leaflet");

        if (!mounted) return;

        // Fix default marker icon issue with Leaflet + Webpack
        delete L.default.Icon.Default.prototype._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        setLeafletModules({
          L: L.default,
          MapContainer: RL.MapContainer,
          TileLayer: RL.TileLayer,
          Marker: RL.Marker,
          Circle: RL.Circle,
          Popup: RL.Popup,
        });
      } catch (e) {
        console.error("Failed to load Leaflet:", e);
        setError("Map library failed to load");
      }
    }

    loadLeaflet();
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!leafletModules || loading) {
    return (
      <div className="p-6 border rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Circle, Popup } = leafletModules;
  
  const aqi = air?.list?.[0]?.main?.aqi;
  const components = air?.list?.[0]?.components;

  function getAqiColor(aqiValue) {
    if (!aqiValue) return "#999";
    if (aqiValue === 1) return "#00e400"; // Good
    if (aqiValue === 2) return "#ffff00"; // Fair
    if (aqiValue === 3) return "#ff7e00"; // Moderate
    if (aqiValue === 4) return "#ff0000"; // Poor
    return "#8f3f97"; // Very Poor
  }

  function getAqiLabel(aqiValue) {
    if (!aqiValue) return "Unknown";
    const labels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    return labels[aqiValue - 1] || "Unknown";
  }

  return (
    <div className="space-y-4">
      <div style={{ height: 400, width: "100%", borderRadius: "0.5rem", overflow: "hidden" }}>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <MapContainer
          center={[lat, lon]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={[lat, lon]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Your Location</p>
                {compare && (
                  <>
                    <p>Your avg: {compare.user_avg?.toFixed(2) ?? "—"} kg CO₂/day</p>
                    <p>City avg: {compare.city_avg?.toFixed(2) ?? "—"} kg CO₂/day</p>
                  </>
                )}
                {aqi && <p>AQI: {aqi} ({getAqiLabel(aqi)})</p>}
              </div>
            </Popup>
          </Marker>
          {aqi && (
            <Circle
              center={[lat, lon]}
              radius={2000}
              pathOptions={{
                color: getAqiColor(aqi),
                fillColor: getAqiColor(aqi),
                fillOpacity: 0.2,
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-xs text-muted-foreground mb-1">Air Quality Index</p>
          <p className="text-2xl font-bold" style={{ color: getAqiColor(aqi) }}>
            {aqi ? `${aqi} - ${getAqiLabel(aqi)}` : "—"}
          </p>
          {components && (
            <p className="text-xs text-muted-foreground mt-2">
              PM2.5: {components.pm2_5?.toFixed(1) ?? "—"} µg/m³
            </p>
          )}
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <p className="text-xs text-muted-foreground mb-1">Comparison</p>
          {compare ? (
            <>
              <p className="text-sm">
                <span className="font-semibold">You:</span> {compare.user_avg?.toFixed(2) ?? "—"} kg/day
              </p>
              <p className="text-sm">
                <span className="font-semibold">City:</span> {compare.city_avg?.toFixed(2) ?? "—"} kg/day
              </p>
              {compare.user_avg && compare.city_avg && (
                <p className="text-xs text-muted-foreground mt-2">
                  {compare.user_avg < compare.city_avg
                    ? `${((1 - compare.user_avg / compare.city_avg) * 100).toFixed(0)}% below city avg`
                    : `${(((compare.user_avg / compare.city_avg) - 1) * 100).toFixed(0)}% above city avg`}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
