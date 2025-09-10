import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CarbonData {
  transport?: {
    car_km?: number;
    bus_km?: number;
    train_km?: number;
    flight_km?: number;
  };
  energy?: {
    electricity_kwh?: number;
    gas_units?: number;
  };
  food?: {
    meat_meals?: number;
    vegetarian_meals?: number;
    local_food_percent?: number;
  };
}

// Carbon emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  transport: {
    car: 0.21,      // kg CO2 per km
    bus: 0.08,      // kg CO2 per km
    train: 0.04,    // kg CO2 per km
    flight: 0.25,   // kg CO2 per km
  },
  energy: {
    electricity: 0.5, // kg CO2 per kWh
    gas: 2.0,        // kg CO2 per unit
  },
  food: {
    meat_meal: 7.0,      // kg CO2 per meal
    vegetarian_meal: 2.0, // kg CO2 per meal
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const carbonData: CarbonData & { date: string } = await req.json();

    // Calculate emissions
    let travelEmissions = 0;
    let energyEmissions = 0;
    let foodEmissions = 0;

    // Transport emissions
    if (carbonData.transport) {
      const t = carbonData.transport;
      travelEmissions = 
        (t.car_km || 0) * EMISSION_FACTORS.transport.car +
        (t.bus_km || 0) * EMISSION_FACTORS.transport.bus +
        (t.train_km || 0) * EMISSION_FACTORS.transport.train +
        (t.flight_km || 0) * EMISSION_FACTORS.transport.flight;
    }

    // Energy emissions
    if (carbonData.energy) {
      const e = carbonData.energy;
      energyEmissions =
        (e.electricity_kwh || 0) * EMISSION_FACTORS.energy.electricity +
        (e.gas_units || 0) * EMISSION_FACTORS.energy.gas;
    }

    // Food emissions
    if (carbonData.food) {
      const f = carbonData.food;
      const totalMeals = (f.meat_meals || 0) + (f.vegetarian_meals || 0);
      foodEmissions = 
        (f.meat_meals || 0) * EMISSION_FACTORS.food.meat_meal +
        (f.vegetarian_meals || 0) * EMISSION_FACTORS.food.vegetarian_meal;
      
      // Adjust for local food (reduce by percentage)
      if (f.local_food_percent) {
        foodEmissions *= (1 - f.local_food_percent / 100 * 0.2); // 20% reduction for local food
      }
    }

    // Save to database
    const { data: existingLog } = await supabaseClient
      .from("carbon_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", carbonData.date)
      .single();

    const logData = {
      user_id: user.id,
      log_date: carbonData.date,
      travel_emissions: travelEmissions,
      energy_emissions: energyEmissions,
      food_emissions: foodEmissions,
    };

    let result;
    if (existingLog) {
      result = await supabaseClient
        .from("carbon_logs")
        .update(logData)
        .eq("id", existingLog.id)
        .select()
        .single();
    } else {
      result = await supabaseClient
        .from("carbon_logs")
        .insert(logData)
        .select()
        .single();
    }

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Calculate points (inverse of emissions - lower emissions = more points)
    const totalEmissions = travelEmissions + energyEmissions + foodEmissions;
    const points = Math.max(0, Math.round(100 - totalEmissions * 2));

    // Update user points
    await supabaseClient.rpc('increment_user_points', { 
      user_id: user.id, 
      points_to_add: points 
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: result.data,
        emissions: {
          travel: travelEmissions,
          energy: energyEmissions,
          food: foodEmissions,
          total: totalEmissions,
        },
        points_earned: points,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error calculating carbon:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});