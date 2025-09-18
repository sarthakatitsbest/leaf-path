import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache implementation with 12-24h TTL
const cache = new Map<string, { data: any; expires: number }>();

const cleanCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.expires) {
      cache.delete(key);
    }
  }
};

const getCacheKey = (userId: string, prompt: string): string => {
  // Create deterministic hash-like key
  const combined = userId + ':' + prompt.toLowerCase().trim();
  return btoa(combined).slice(0, 32);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    cleanCache(); // Clean expired entries

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, userProfile, recentData } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache first
    const cacheKey = getCacheKey(user.id, message);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      console.log('Cache hit for AI chat request');
      return new Response(JSON.stringify({ reply: cached.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build comprehensive prompt for one OpenAI call
    const systemPrompt = `You are EcoPulse, an AI eco-advisor helping users reduce their carbon footprint. 
Be concise, actionable, and encouraging. Provide specific recommendations.`;

    const contextPrompt = `User Profile: ${userProfile?.display_name || 'User'} has ${userProfile?.total_points || 0} eco points.
Recent Activity: ${recentData ? JSON.stringify(recentData).slice(0, 200) : 'No recent activity'}
User Question: ${message}

Provide a helpful, specific response about carbon reduction, eco-tips, or sustainable living in under 140 characters.`;

    // Single OpenAI call with specified parameters
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contextPrompt }
        ],
        max_tokens: 160,
        temperature: 0.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('AI service temporarily unavailable');
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'I apologize, but I cannot provide a response right now.';

    // Cache the result for 12-24 hours (randomized to prevent cache stampede)
    const cacheHours = 12 + Math.random() * 12; // 12-24 hours
    const expires = Date.now() + (cacheHours * 60 * 60 * 1000);
    cache.set(cacheKey, { data: reply, expires });

    console.log(`AI chat response cached for ${cacheHours.toFixed(1)} hours`);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your request',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});