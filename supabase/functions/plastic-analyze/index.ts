import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple cache for repeated queries
const cache = new Map<string, { result: any; expires: number }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { transcript, location } = await req.json();

    if (!transcript || transcript.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Transcript is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache
    const cacheKey = `pitch:${user.id}:${transcript.toLowerCase().trim().slice(0, 100)}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return new Response(JSON.stringify(cached.result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // LLM prompt - minimal tokens for cost efficiency
    const systemPrompt = `You are EcoPulse Pitch Coach. Output only JSON in exact schema. Be concise.`;
    
    const userPrompt = `Classify and rewrite.

Text: "${transcript}"
${location ? `Location: ${location.lat},${location.lng}` : ''}

Return JSON:
{
 "category":"plastic_hotspot|plastic_type|brand|management|other",
 "problem":"10-20 words investor-ready problem",
 "solution":"15-25 words investor-ready solution",
 "metric":"1 suggested metric with source hint",
 "confidence":0-100
}`;

    let result;

    if (openaiKey) {
      // Call OpenAI
      const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 200,
        }),
      });

      if (!openaiResp.ok) {
        console.error('OpenAI error:', await openaiResp.text());
        throw new Error('AI service error');
      }

      const openaiData = await openaiResp.json();
      const content = openaiData.choices?.[0]?.message?.content || '';
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid AI response format');
      }
    } else {
      // Fallback: deterministic classification without AI
      const lowerText = transcript.toLowerCase();
      let category = 'other';
      let problem = 'Plastic waste accumulation impacts urban health and environment.';
      let solution = 'Map hotspots using citizen data and prioritize high-impact cleanup zones.';
      let metric = 'kg plastic waste per month (city sanitation reports)';
      let confidence = 65;

      if (lowerText.includes('hotspot') || lowerText.includes('river') || lowerText.includes('accumulate') || lowerText.includes('area')) {
        category = 'plastic_hotspot';
        problem = 'Urban plastic waste accumulates in key areas, harming health and waterways.';
        solution = 'Analyze public data to identify plastic hotspots and prioritize high-impact cleanup actions.';
        confidence = 75;
      } else if (lowerText.includes('sachet') || lowerText.includes('multi-layer') || lowerText.includes('bottle') || lowerText.includes('pet')) {
        category = 'plastic_type';
        problem = 'Single-use and multi-layer packaging clogs municipal systems and resists recycling.';
        solution = 'Classify packaging types and route high-volume items to targeted collection and producer takeback.';
        metric = '% multi-layer packaging by count (waste audit)';
        confidence = 78;
      } else if (lowerText.includes('brand') || lowerText.includes('company') || lowerText.includes('wrapper')) {
        category = 'brand';
        problem = 'Major brands contribute disproportionately to local plastic pollution.';
        solution = 'Track brand packaging in waste streams to enable accountability and producer responsibility.';
        metric = 'Brand mentions per cleanup drive (NGO data)';
        confidence = 70;
      } else if (lowerText.includes('waste') || lowerText.includes('plastic') || lowerText.includes('problem')) {
        category = 'plastic_hotspot';
        problem = 'Plastic waste threatens urban health, blocks drainage, and pollutes waterways.';
        solution = 'Deploy citizen data collection and AI analysis to map waste patterns and prioritize interventions.';
        confidence = 72;
      }

      result = { category, problem, solution, metric, confidence };
    }

    // Save to database
    await supabase.from('plastic_pitch_analyses').insert({
      user_id: user.id,
      transcript,
      category: result.category,
      problem_statement: result.problem,
      solution_statement: result.solution,
      suggested_metrics: [{ metric: result.metric }],
      confidence: result.confidence,
    });

    // Cache result (1 hour)
    cache.set(cacheKey, { result, expires: Date.now() + 3600000 });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Plastic analyze error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
