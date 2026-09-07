import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { nvidiaChat, NVIDIA_MODEL, NvidiaError } from "../_shared/nvidia.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const started = Date.now();
  try {
    const reply = await nvidiaChat(
      [
        { role: 'system', content: 'Answer in one short sentence. No reasoning.' },
        { role: 'user', content: 'Give one quick tip to cut home electricity use.' },
      ],
      { maxTokens: 120, temperature: 0.6, timeoutMs: 25000 },
    );
    return new Response(JSON.stringify({ ok: true, model: NVIDIA_MODEL, ms: Date.now() - started, reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const status = error instanceof NvidiaError ? error.status : 500;
    const message = error instanceof NvidiaError ? error.message : 'AI health check failed';
    return new Response(JSON.stringify({ ok: false, model: NVIDIA_MODEL, ms: Date.now() - started, error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
