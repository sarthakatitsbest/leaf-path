import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { nvidiaChat } from "../_shared/nvidia.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const reply = await nvidiaChat(
      [
        { role: 'system', content: 'You are EcoPulse Pitch Coach. Output ONLY a single valid JSON object. No markdown, no reasoning.' },
        { role: 'user', content: 'Analyse: "Plastic sachets are dumped near our river and nobody collects them". Return JSON: {"category":"plastic_hotspot|plastic_type|brand|management|other","problem":"10-20 words","solution":"15-25 words","metric":"1 metric with source hint","confidence":0-100}' },
      ],
      { maxTokens: 400, temperature: 0.4 },
    );
    return new Response(JSON.stringify({ ok: true, reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : 'error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
