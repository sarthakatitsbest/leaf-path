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
    const t1 = Date.now();
    const reply = await nvidiaChat(
      [
        { role: 'system', content: 'You are EcoPulse, an AI eco-advisor. Be concise. Never show internal reasoning.' },
        { role: 'user', content: 'Give one quick tip to cut home electricity use.' },
      ],
      { maxTokens: 600, temperature: 0.6, timeoutMs: 25000 },
    );
    const chatMs = Date.now() - t1;

    const t2 = Date.now();
    const pitch = await nvidiaChat(
      [
        { role: 'system', content: 'You are EcoPulse Pitch Coach. Output ONLY a single valid JSON object. No markdown, no reasoning.' },
        { role: 'user', content: 'Analyse this pitch: "We map plastic hotspots near rivers using citizen photos." Return JSON {"category":"","problem":"","solution":"","metric":"","confidence":0}' },
      ],
      { maxTokens: 800, temperature: 0.6, timeoutMs: 30000 },
    );
    const pitchMs = Date.now() - t2;

    return new Response(JSON.stringify({ ok: true, model: NVIDIA_MODEL, ms: Date.now() - started, chatMs, pitchMs, reply, pitch }), {
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
