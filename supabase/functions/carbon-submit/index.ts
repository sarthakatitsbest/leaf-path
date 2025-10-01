import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

// Carbon emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  transport: {
    car: 0.21,
    bus: 0.089,
    train: 0.041,
    bike: 0.0,
    motorbike: 0.095,
    flight: 0.25,
  },
  energy: {
    electricity: 0.475,
    gas: 2.0,
  },
  food: {
    meat_meal: 2.5,
    vegetarian_meal: 0.5,
  },
  waste: {
    general: 0.2,
  },
};

function estimateFromEntry(entry: CarbonEntry): number {
  let total = 0;

  // Transport emissions
  if (entry.transport) {
    for (const t of entry.transport) {
      const factor = EMISSION_FACTORS.transport[t.mode as keyof typeof EMISSION_FACTORS.transport] ?? 0.2;
      total += factor * (t.km || 0);
    }
  }

  // Energy emissions
  if (entry.energy) {
    total += (entry.energy.electricity_kwh || 0) * EMISSION_FACTORS.energy.electricity;
    total += (entry.energy.gas_units || 0) * EMISSION_FACTORS.energy.gas;
  }

  // Food emissions
  if (entry.food) {
    total += (entry.food.meat_meals || 0) * EMISSION_FACTORS.food.meat_meal;
    total += (entry.food.vegetarian_meals || 0) * EMISSION_FACTORS.food.vegetarian_meal;
  }

  // Waste emissions
  if (entry.waste) {
    total += (entry.waste.kg || 0) * EMISSION_FACTORS.waste.general;
  }

  return Number(total.toFixed(3));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Parse JSON body
    const { entry }: { entry: CarbonEntry } = await req.json();
    if (!entry || typeof entry !== 'object') {
      throw new Error("Missing or invalid entry data");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found");
    }

    // Calculate CO2 emissions
    const co2 = estimateFromEntry(entry);

    // Insert carbon log
    const { data: carbonLog, error: insertError } = await supabaseClient
      .from("carbon_logs")
      .insert([{
        user_id: user.id,
        log_date: new Date().toISOString().split('T')[0],
        travel_emissions: entry.transport ? entry.transport.reduce((sum, t) => {
          const factor = EMISSION_FACTORS.transport[t.mode as keyof typeof EMISSION_FACTORS.transport] ?? 0.2;
          return sum + (factor * (t.km || 0));
        }, 0) : 0,
        energy_emissions: (entry.energy?.electricity_kwh || 0) * EMISSION_FACTORS.energy.electricity + 
                         (entry.energy?.gas_units || 0) * EMISSION_FACTORS.energy.gas,
        food_emissions: (entry.food?.meat_meals || 0) * EMISSION_FACTORS.food.meat_meal + 
                       (entry.food?.vegetarian_meals || 0) * EMISSION_FACTORS.food.vegetarian_meal,
        total_emissions: co2,
      }])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Calculate points (inverse relationship with emissions - lower emissions = more points)
    const points = Math.max(1, Math.round(50 - co2));

    // Update leaderboard and user points
    const { error: rpcError } = await supabaseClient.rpc("upsert_leaderboard", {
      p_user_id: user.id,
      p_points: points,
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      // Don't throw - points update failure shouldn't break the main flow
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          co2_emissions: co2,
          points_awarded: points,
          carbon_log: carbonLog,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in carbon-submit function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});