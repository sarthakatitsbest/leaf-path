import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.pathname.split('/').pop();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Verification code required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: badge, error } = await supabase
      .from('badges')
      .select(`
        *,
        user_profiles!badges_user_id_fkey(display_name, email),
        challenges(title, description)
      `)
      .eq('verification_code', code)
      .single();

    if (error || !badge) {
      console.error('Badge not found:', error);
      return new Response(
        JSON.stringify({ error: 'Badge not found', verified: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        verified: true,
        badge: {
          title: badge.title,
          issued_at: badge.issued_at,
          points: badge.points,
          user_name: badge.user_profiles?.display_name || badge.user_profiles?.email,
          challenge_title: badge.challenges?.title || badge.title,
          verification_code: badge.verification_code
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
