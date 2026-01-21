import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { imageBase64, ocrText, location } = await req.json();

    if (!imageBase64 && !ocrText) {
      return new Response(JSON.stringify({ error: 'Image or OCR text required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result;

    if (openaiKey && imageBase64) {
      // Use OpenAI vision for image classification
      const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Classify plastic packaging. Return only JSON: {"type":"single-use|multi-layer|PET|HDPE|PVC|film|unknown","recyclable":true|false,"confidence":0-100,"details":"brief description"}',
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Classify this plastic packaging:' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'low' } },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 150,
        }),
      });

      if (openaiResp.ok) {
        const openaiData = await openaiResp.json();
        const content = openaiData.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      }
    }

    // Fallback: keyword-based classification
    if (!result) {
      const text = (ocrText || '').toLowerCase();
      let type = 'unknown';
      let recyclable = false;
      let confidence = 50;

      if (text.includes('pet') || text.includes('♳') || text.includes('1')) {
        type = 'PET';
        recyclable = true;
        confidence = 75;
      } else if (text.includes('hdpe') || text.includes('♴') || text.includes('2')) {
        type = 'HDPE';
        recyclable = true;
        confidence = 75;
      } else if (text.includes('pvc') || text.includes('♵') || text.includes('3')) {
        type = 'PVC';
        recyclable = false;
        confidence = 70;
      } else if (text.includes('sachet') || text.includes('multi') || text.includes('layer') || text.includes('foil')) {
        type = 'multi-layer';
        recyclable = false;
        confidence = 72;
      } else if (text.includes('film') || text.includes('wrap') || text.includes('bag')) {
        type = 'film';
        recyclable = false;
        confidence = 68;
      } else if (text.includes('bottle') || text.includes('container')) {
        type = 'single-use';
        recyclable = true;
        confidence = 65;
      }

      result = {
        type,
        recyclable,
        confidence,
        details: `Classified based on ${ocrText ? 'text analysis' : 'image analysis'}`,
      };
    }

    // Calculate recyclability score
    const recyclabilityScore = result.recyclable 
      ? Math.min(85, 50 + result.confidence * 0.35)
      : Math.max(15, 50 - result.confidence * 0.35);

    // Save upload record
    const { data: upload } = await supabase.from('plastic_uploads').insert({
      user_id: user.id,
      type: 'image',
      text_extracted: ocrText || null,
      location_lat: location?.lat || null,
      location_lng: location?.lng || null,
    }).select().single();

    // Save classification
    if (upload) {
      await supabase.from('plastic_classifications').insert({
        upload_id: upload.id,
        user_id: user.id,
        plastic_category: result.type,
        recyclability_score: Math.round(recyclabilityScore),
        model_confidence: result.confidence,
        metadata: { details: result.details },
      });
    }

    return new Response(JSON.stringify({
      type: result.type,
      recyclable: result.recyclable,
      recyclability_score: Math.round(recyclabilityScore),
      confidence: result.confidence,
      details: result.details,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Plastic classify error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
