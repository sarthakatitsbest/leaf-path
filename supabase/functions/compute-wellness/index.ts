import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Certificate rules - deterministic and explainable
const CERTIFICATE_RULES = {
  carbon: {
    title: 'Carbon Saver Certificate',
    description: 'Reduced weekly CO₂ emissions below safe limit',
    target: 20, // kg per week
    unit: 'kg CO₂'
  },
  water: {
    title: 'Water Conservation Certificate',
    description: 'Kept weekly water usage under sustainable limit',
    target: 3000, // liters per week
    unit: 'liters'
  },
  food: {
    title: 'Food Waste Reduction Certificate',
    description: 'Minimized food waste impact',
    target: 1.0, // kg per week
    unit: 'kg waste'
  },
  energy: {
    title: 'Energy Saver Certificate',
    description: 'Reduced standby energy consumption',
    target: 1.5, // kWh per week
    unit: 'kWh'
  },
  transport: {
    title: 'Green Transport Champion',
    description: 'Used green transport consistently',
    target: 5, // green trips per week
    unit: 'green trips'
  },
  overall: {
    title: 'Sustainability Champion',
    description: 'Achieved excellent sustainability score',
    target: 85, // score out of 100
    unit: 'points'
  },
  health: {
    title: 'Healthy & Sustainable Living',
    description: 'Followed health-based eco recommendations',
    target: 7, // days following tips
    unit: 'days'
  }
};

// City average carbon estimates (kg CO2/day)
const CITY_AVERAGES = {
  mumbai: 4.2,
  delhi: 5.1,
  bangalore: 3.8,
  pune: 3.2,
  hyderabad: 3.5,
  chennai: 3.4,
  kolkata: 3.9,
  default: 4.0
};

// Water estimates by household type (liters/day)
const WATER_ESTIMATES = {
  apartment: 135,
  house: 200,
  hostel: 80,
  default: 135
};

function getWeekBounds(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { weekStart: monday, weekEnd: sunday };
}

function computeWellnessScore(data: {
  aqi: number;
  waterUsage: number;
  carbonEmissions: number;
  dietScore: number;
  activityFollowed: boolean;
}) {
  // AQI score (0-25): lower AQI = better score
  const aqiScore = Math.max(0, 25 - Math.floor(data.aqi / 12));
  
  // Water score (0-25): lower usage = better score
  const waterScore = Math.max(0, 25 - Math.floor(data.waterUsage / 160));
  
  // Carbon score (0-25): lower emissions = better score
  const carbonScore = Math.max(0, 25 - Math.floor(data.carbonEmissions / 1.2));
  
  // Diet score (0-25): direct from diet choices
  const dietScoreNorm = Math.min(25, data.dietScore);
  
  return {
    aqiScore,
    waterScore,
    carbonScore,
    dietScore: dietScoreNorm,
    overallScore: aqiScore + waterScore + carbonScore + dietScoreNorm
  };
}

function getHealthTips(aqi: number, temperature: number): {
  tips: string[];
  dietSuggestions: string[];
  activitySuggestions: string[];
} {
  const tips: string[] = [];
  const dietSuggestions: string[] = [];
  const activitySuggestions: string[] = [];

  // AQI-based tips
  if (aqi > 200) {
    tips.push('⚠️ Air quality is very poor. Stay indoors as much as possible.');
    tips.push('😷 Wear N95 mask if you must go outside.');
    activitySuggestions.push('🏠 Do indoor yoga or exercises');
    activitySuggestions.push('🚫 Avoid outdoor jogging');
  } else if (aqi > 150) {
    tips.push('🌫️ Air quality is poor today. Limit outdoor exposure.');
    tips.push('😷 Consider wearing a mask during commute.');
    activitySuggestions.push('🚶 Short walks only, avoid heavy exercise outdoors');
  } else if (aqi > 100) {
    tips.push('☁️ Moderate air quality. Sensitive groups should be cautious.');
    activitySuggestions.push('🏃 Light outdoor activities are okay');
  } else {
    tips.push('🌿 Good air quality! Great day for outdoor activities.');
    activitySuggestions.push('🚴 Perfect for cycling or jogging');
  }

  // Temperature-based tips
  if (temperature > 35) {
    tips.push('🌡️ High temperature alert! Stay hydrated.');
    dietSuggestions.push('🥤 Drink 3-4 liters of water today');
    dietSuggestions.push('🍉 Eat water-rich fruits like watermelon, cucumber');
    dietSuggestions.push('🥗 Light meals - avoid heavy, spicy food');
  } else if (temperature > 30) {
    dietSuggestions.push('💧 Drink plenty of water and fluids');
    dietSuggestions.push('🥒 Include salads and fresh vegetables');
  } else if (temperature < 15) {
    dietSuggestions.push('🍵 Warm soups and herbal teas recommended');
    dietSuggestions.push('🥜 Include nuts and warm foods');
  }

  // AQI-based diet (antioxidants for pollution)
  if (aqi > 100) {
    dietSuggestions.push('🍊 Eat Vitamin C rich foods (oranges, amla)');
    dietSuggestions.push('🥦 Include leafy greens and broccoli');
    dietSuggestions.push('🫚 Add turmeric and ginger to meals');
  }

  // Default diet suggestions if empty
  if (dietSuggestions.length === 0) {
    dietSuggestions.push('🥗 Balanced diet with seasonal vegetables');
    dietSuggestions.push('🌾 Include whole grains');
  }

  return { tips, dietSuggestions, activitySuggestions };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const { aqi = 100, temperature = 28, city = 'default', householdType = 'apartment' } = body;

    const { weekStart, weekEnd } = getWeekBounds(new Date());
    const today = new Date().toISOString().split('T')[0];

    // Fetch weekly entries for progress calculation
    const { data: entries } = await supabase
      .from('entries')
      .select('type, footprint, data')
      .eq('user_id', user.id)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString());

    // Calculate weekly totals
    let weeklyCarbon = 0;
    let weeklyWater = 0;
    let weeklyWaste = 0;
    let greenTrips = 0;
    let dietScore = 20; // Base diet score

    (entries || []).forEach((entry) => {
      const fp = entry.footprint || {};
      weeklyCarbon += Number(fp.co2Kg || 0);
      weeklyWater += Number(fp.waterLiters || 0);
      
      if (entry.type === 'waste') {
        weeklyWaste += Number(fp.breakdown?.kg || 0);
      }
      if (entry.type === 'transport') {
        const mode = fp.breakdown?.mode || '';
        if (['bicycle', 'walking', 'metro', 'bus', 'train'].includes(mode)) {
          greenTrips++;
        }
      }
      if (entry.type === 'food') {
        const foodType = fp.breakdown?.foodType || 'veg';
        if (foodType === 'veg') dietScore += 2;
        if (fp.breakdown?.wastedKg === 0) dietScore += 3;
      }
    });

    // Get city average
    const cityKey = city.toLowerCase().replace(/\s/g, '');
    const cityAverage = CITY_AVERAGES[cityKey as keyof typeof CITY_AVERAGES] || CITY_AVERAGES.default;
    const dailyCarbon = weeklyCarbon / 7;
    const comparisonPercentage = cityAverage > 0 ? ((cityAverage - dailyCarbon) / cityAverage) * 100 : 0;

    // Auto water estimate
    const waterEstimate = WATER_ESTIMATES[householdType as keyof typeof WATER_ESTIMATES] || WATER_ESTIMATES.default;

    // Compute wellness score
    const wellnessScores = computeWellnessScore({
      aqi,
      waterUsage: weeklyWater / 7,
      carbonEmissions: dailyCarbon,
      dietScore,
      activityFollowed: true
    });

    // Generate health tips
    const healthData = getHealthTips(aqi, temperature);

    // Calculate certificate progress
    const certificateProgress = Object.entries(CERTIFICATE_RULES).map(([type, rule]) => {
      let currentValue = 0;
      let isUnlocked = false;

      switch (type) {
        case 'carbon':
          currentValue = weeklyCarbon;
          isUnlocked = weeklyCarbon <= rule.target;
          break;
        case 'water':
          currentValue = weeklyWater;
          isUnlocked = weeklyWater <= rule.target;
          break;
        case 'food':
          currentValue = weeklyWaste;
          isUnlocked = weeklyWaste <= rule.target;
          break;
        case 'transport':
          currentValue = greenTrips;
          isUnlocked = greenTrips >= rule.target;
          break;
        case 'overall':
          currentValue = wellnessScores.overallScore;
          isUnlocked = wellnessScores.overallScore >= rule.target;
          break;
        default:
          currentValue = 0;
      }

      const progress = type === 'transport' || type === 'overall' 
        ? Math.min(100, (currentValue / rule.target) * 100)
        : Math.min(100, ((rule.target - Math.min(currentValue, rule.target * 2)) / rule.target) * 100);

      return {
        type,
        title: rule.title,
        description: rule.description,
        currentValue: +currentValue.toFixed(2),
        targetValue: rule.target,
        unit: rule.unit,
        progress: Math.max(0, +progress.toFixed(1)),
        isUnlocked
      };
    });

    // Upsert wellness score
    await supabase
      .from('wellness_scores')
      .upsert({
        user_id: user.id,
        score_date: today,
        water_score: wellnessScores.waterScore,
        diet_score: wellnessScores.dietScore,
        aqi_score: wellnessScores.aqiScore,
        activity_score: 0,
        overall_score: wellnessScores.overallScore,
        breakdown: { ...wellnessScores, weeklyTotals: { carbon: weeklyCarbon, water: weeklyWater, waste: weeklyWaste } }
      }, { onConflict: 'user_id,score_date' });

    // Upsert health tips
    await supabase
      .from('health_tips')
      .upsert({
        user_id: user.id,
        tip_date: today,
        aqi_value: aqi,
        temperature,
        tips: healthData.tips,
        diet_suggestions: healthData.dietSuggestions,
        activity_suggestions: healthData.activitySuggestions
      }, { onConflict: 'user_id,tip_date' });

    // Upsert auto estimates
    await supabase
      .from('auto_estimates')
      .upsert({
        user_id: user.id,
        estimate_date: today,
        city,
        water_estimate: waterEstimate,
        carbon_estimate: dailyCarbon,
        city_average_carbon: cityAverage,
        comparison_percentage: comparisonPercentage,
        estimate_data: { householdType, entriesCount: entries?.length || 0 }
      }, { onConflict: 'user_id,estimate_date' });

    // Upsert certificate progress
    for (const cert of certificateProgress) {
      await supabase
        .from('certificate_progress')
        .upsert({
          user_id: user.id,
          certificate_type: cert.type,
          current_value: cert.currentValue,
          target_value: cert.targetValue,
          is_unlocked: cert.isUnlocked,
          unlocked_at: cert.isUnlocked ? new Date().toISOString() : null,
          week_start: weekStart.toISOString().split('T')[0]
        }, { onConflict: 'user_id,certificate_type,week_start' });
    }

    console.log('Wellness computed for user:', user.id, 'Score:', wellnessScores.overallScore);

    return new Response(JSON.stringify({
      ok: true,
      wellness: wellnessScores,
      healthTips: healthData,
      certificateProgress,
      autoEstimates: {
        city,
        waterEstimate,
        dailyCarbon: +dailyCarbon.toFixed(2),
        cityAverage,
        comparisonPercentage: +comparisonPercentage.toFixed(1),
        betterThanAverage: comparisonPercentage > 0
      },
      weeklyTotals: {
        carbon: +weeklyCarbon.toFixed(2),
        water: +weeklyWater.toFixed(0),
        waste: +weeklyWaste.toFixed(2),
        greenTrips
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    console.error('compute-wellness error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
