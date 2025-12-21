import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_MIN = 30;

function cityKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let lat: number;
    let lon: number;

    // Support both query params (GET) and body (POST)
    if (req.method === "POST") {
      const body = await req.json();
      lat = parseFloat(body.lat);
      lon = parseFloat(body.lon);
    } else {
      const url = new URL(req.url);
      lat = parseFloat(url.searchParams.get("lat") || "");
      lon = parseFloat(url.searchParams.get("lon") || "");
    }

    if (isNaN(lat) || isNaN(lon)) {
      return new Response(
        JSON.stringify({ error: "Invalid lat/lon parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const key = cityKey(lat, lon);

    // Check cache
    const { data: cachedData } = await supabaseClient
      .from("city_air_cache")
      .select("*")
      .eq("city_key", key)
      .single();

    if (cachedData) {
      const fetchedAt = new Date(cachedData.fetched_at);
      const now = new Date();
      const ageMinutes = (now.getTime() - fetchedAt.getTime()) / 60000;

      if (ageMinutes < CACHE_TTL_MIN) {
        return new Response(
          JSON.stringify({ cached: true, data: cachedData.data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch from OpenWeather
    const OPENWEATHER_KEY = Deno.env.get("OPENWEATHER_API_KEY");
    if (!OPENWEATHER_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenWeather API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error("OpenWeather API error:", response.status);
      return new Response(
        JSON.stringify({ error: "Failed to fetch air quality data" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const airData = await response.json();

    // Update cache
    await supabaseClient
      .from("city_air_cache")
      .upsert({
        lat,
        lon,
        city_key: key,
        data: airData,
        fetched_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ cached: false, data: airData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in air-quality function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
