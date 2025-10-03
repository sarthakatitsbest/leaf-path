import { createClient } from 'jsr:@supabase/supabase-js@2';
import QRCode from 'https://esm.sh/qrcode@1.5.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, challengeId, userName } = await req.json();

    if (!userId || !challengeId) {
      return new Response(
        JSON.stringify({ error: 'userId and challengeId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      return new Response(
        JSON.stringify({ error: 'Challenge not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if badge already exists
    const { data: existing } = await supabase
      .from('badges')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ message: 'Badge already awarded', badgeId: existing.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate verification code
    const verificationCode = crypto.randomUUID();

    // Create badge record
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        title: challenge.title,
        points: challenge.points_award || 10,
        verification_code: verificationCode,
        metadata: { awarded_by: 'system' }
      })
      .select()
      .single();

    if (badgeError) {
      console.error('Badge creation error:', badgeError);
      return new Response(
        JSON.stringify({ error: 'Failed to create badge' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user points
    await supabase.rpc('increment_user_points', {
      user_id: userId,
      points_to_add: challenge.points_award || 10
    });

    console.log('Badge awarded successfully:', badge.id);

    return new Response(
      JSON.stringify({
        success: true,
        badge: {
          id: badge.id,
          title: badge.title,
          points: badge.points,
          verification_code: badge.verification_code
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Award badge error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
