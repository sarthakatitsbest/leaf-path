import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { nvidiaChat, NvidiaError } from '../_shared/nvidia.ts';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;


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

    const systemPrompt = `You are EcoPulse, an AI eco-advisor helping users reduce their carbon footprint.
Be concise, actionable, and encouraging. Provide specific, practical recommendations about carbon reduction, eco-tips and sustainable living.
Answer directly in plain text. Never show your internal reasoning.`;

    const contextPrompt = `User Profile: ${userProfile?.display_name || 'User'} has ${userProfile?.total_points || 0} eco points.
Recent Activity: ${recentData ? JSON.stringify(recentData).slice(0, 200) : 'No recent activity'}
User Question: ${message}

Provide a helpful, specific response about carbon reduction, eco-tips, or sustainable living.`;

    // Optional conversation history from the frontend (kept backward compatible)
    const priorTurns = Array.isArray(history)
      ? history
          .filter((m: any) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
          .slice(-8)
          .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 1500) }))
      : [];

    const reply = await nvidiaChat(
      [
        { role: 'system', content: systemPrompt },
        ...priorTurns,
        { role: 'user', content: contextPrompt },
      ],
      { maxTokens: 400, temperature: 0.4 },
    );

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    const status = error instanceof NvidiaError ? error.status : 500;
    const msg = error instanceof NvidiaError
      ? error.message
      : 'An error occurred while processing your request';
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

});
