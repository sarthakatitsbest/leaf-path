import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Emission factors - explainable and deterministic
const FACTORS = {
  transport: { 
    car: 0.21, 
    bus: 0.089, 
    bicycle: 0, 
    walking: 0, 
    motorbike: 0.11,
    metro: 0.041,
    train: 0.035,
    auto: 0.12
  }, // kgCO2 per km
  energy_per_kwh: 0.82, // kgCO2 per kWh (India grid average)
  food: { 
    veg: { co2_per_kg: 2.0, water_per_kg: 1500 }, 
    nonveg: { co2_per_kg: 25.0, water_per_kg: 15000 },
    mixed: { co2_per_kg: 10.0, water_per_kg: 6000 }
  },
  water: {
    shower: 65, // liters per 10 min
    bucket_bath: 20,
    washing_machine: 50,
    dishwashing: 15,
    toilet_flush: 6
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST only' }), { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get auth token
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Auth required' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Validate user token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    const user = userData.user;

    const body = await req.json();
    const { type, data, location } = body || {};
    
    if (!type || !data) {
      return new Response(JSON.stringify({ error: 'type & data required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    let footprint = { co2Kg: 0, waterLiters: 0, cost: 0, breakdown: {} as Record<string, unknown> };

    if (type === 'transport') {
      const km = Number(data.km || 0);
      const mode = (data.mode || 'car').toLowerCase();
      const factor = FACTORS.transport[mode as keyof typeof FACTORS.transport] ?? FACTORS.transport.car;
      const co2 = factor * km;
      footprint.co2Kg = +co2.toFixed(3);
      footprint.breakdown = { mode, km, factor, source: 'IPCC 2021' };
    } else if (type === 'energy') {
      const watts = Number(data.watts || 0);
      const hours = Number(data.hours || 0);
      const kwh = (watts * hours) / 1000;
      const co2 = kwh * FACTORS.energy_per_kwh;
      footprint.co2Kg = +co2.toFixed(3);
      footprint.breakdown = { watts, hours, kwh, gridFactor: FACTORS.energy_per_kwh };
    } else if (type === 'water') {
      const activity = (data.activity || 'bucket_bath').toLowerCase();
      const count = Number(data.count || 1);
      const baseLiters = FACTORS.water[activity as keyof typeof FACTORS.water] || 20;
      const liters = baseLiters * count;
      footprint.waterLiters = liters;
      footprint.breakdown = { activity, count, baseLiters };
    } else if (type === 'food') {
      const weightKg = Number(data.weightGram || 0) / 1000;
      const foodType = (data.foodType || 'veg').toLowerCase();
      const f = FACTORS.food[foodType as keyof typeof FACTORS.food] || FACTORS.food.veg;
      const wastedKg = Number(data.wastedKg || 0);
      const co2 = f.co2_per_kg * (weightKg + wastedKg);
      const water = f.water_per_kg * (weightKg + wastedKg);
      footprint.co2Kg = +co2.toFixed(3);
      footprint.waterLiters = +water;
      footprint.breakdown = { foodType, weightKg, wastedKg, factors: f };
    } else if (type === 'waste') {
      const kg = Number(data.estimatedKg || 0);
      const materialType = data.materialType || 'mixed';
      // Waste emission factors (kg CO2 per kg waste)
      const wasteFactor = materialType === 'plastic' ? 2.5 : materialType === 'organic' ? 0.5 : 1.0;
      const co2 = wasteFactor * kg;
      footprint.co2Kg = +co2.toFixed(3);
      footprint.breakdown = { materialType, kg, wasteFactor };
    } else {
      return new Response(JSON.stringify({ error: 'Invalid type' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Add explanation for transparency
    const explanation = { 
      usedAt: new Date().toISOString(), 
      factorsUsed: footprint.breakdown,
      methodology: 'Based on IPCC 2021 guidelines and Indian grid emission factors'
    };

    const { data: entry, error: insertError } = await supabase
      .from('entries')
      .insert([{
        user_id: user.id,
        type,
        data,
        footprint,
        explanation,
        location: location || null
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'DB insert failed', details: insertError }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('Entry added:', entry.id, 'Type:', type, 'User:', user.id);

    return new Response(JSON.stringify({ ok: true, entry }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    console.error('add-entry error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
