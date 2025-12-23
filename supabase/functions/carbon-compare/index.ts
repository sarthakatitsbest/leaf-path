import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Haversine formula to calculate distance between two lat/lon points
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Support both POST body and query params
    let userId: string | null = null;
    let lat: number = NaN;
    let lon: number = NaN;
    let radiusKm: number = 10;
    let days: number = 7;

    if (req.method === "POST") {
      const body = await req.json();
      userId = body.user_id;
      lat = parseFloat(body.lat);
      lon = parseFloat(body.lon);
      radiusKm = parseFloat(body.radius_km) || 10;
      days = parseInt(body.days) || 7;
    } else {
      const url = new URL(req.url);
      userId = url.searchParams.get("user_id");
      lat = parseFloat(url.searchParams.get("lat") || "");
      lon = parseFloat(url.searchParams.get("lon") || "");
      radiusKm = parseFloat(url.searchParams.get("radius_km") || "10");
      days = parseInt(url.searchParams.get("days") || "7");
    }

    if (!userId || isNaN(lat) || isNaN(lon)) {
      console.log("Invalid params:", { userId, lat, lon });
      return new Response(
        JSON.stringify({ error: "Missing or invalid parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get user's average
    const { data: userLogs, error: userError } = await supabaseClient
      .from("carbon_logs")
      .select("total_emissions")
      .eq("user_id", userId)
      .gte("log_date", startDate);

    if (userError) throw userError;

    const userAvg = userLogs && userLogs.length > 0
      ? userLogs.reduce((sum, log) => sum + (log.total_emissions || 0), 0) / userLogs.length
      : 0;

    // Get all other users' logs with location
    const { data: allLogs, error: allError } = await supabaseClient
      .from("carbon_logs")
      .select("lat, lon, total_emissions, user_id")
      .neq("user_id", userId)
      .gte("log_date", startDate)
      .not("lat", "is", null)
      .not("lon", "is", null);

    if (allError) throw allError;

    // Filter logs within radius
    const nearbyLogs = allLogs?.filter((log) => {
      if (!log.lat || !log.lon) return false;
      const distance = haversine(lat, lon, log.lat, log.lon);
      return distance <= radiusKm;
    }) || [];

    const cityAvg = nearbyLogs.length > 0
      ? nearbyLogs.reduce((sum, log) => sum + (log.total_emissions || 0), 0) / nearbyLogs.length
      : 0;

    return new Response(
      JSON.stringify({
        user_avg: parseFloat(userAvg.toFixed(3)),
        city_avg: parseFloat(cityAvg.toFixed(3)),
        nearby_users: nearbyLogs.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carbon-compare function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
