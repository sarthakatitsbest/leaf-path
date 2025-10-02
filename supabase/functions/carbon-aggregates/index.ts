import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const days = parseInt(url.searchParams.get("days") || "7");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch carbon logs for the last N days
    const { data: logs, error } = await supabaseClient
      .from("carbon_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order("log_date", { ascending: true });

    if (error) {
      throw error;
    }

    // Process logs into chart data
    const labels: string[] = [];
    const totals: number[] = [];
    const transport: number[] = [];
    const energy: number[] = [];
    const food: number[] = [];

    logs?.forEach((log) => {
      labels.push(log.log_date);
      totals.push(log.total_emissions || 0);
      transport.push(log.travel_emissions || 0);
      energy.push(log.energy_emissions || 0);
      food.push(log.food_emissions || 0);
    });

    return new Response(
      JSON.stringify({
        labels,
        totals,
        breakdowns: { transport, energy, food },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carbon-aggregates function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
