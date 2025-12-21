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
    // Support both URL path and query param for code
    const url = new URL(req.url);
    let code = url.searchParams.get('code');
    
    // Also check path for backwards compatibility
    if (!code) {
      code = url.pathname.split('/').pop();
    }

    // Also check POST body
    if (!code && req.method === 'POST') {
      try {
        const body = await req.json();
        code = body.code;
      } catch {
        // Ignore JSON parse errors
      }
    }

    if (!code || code === 'verify-badge') {
      return new Response(
        JSON.stringify({ error: 'Verification code required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // First check certificates table
    const { data: certificate } = await supabase
      .from('certificates')
      .select('*')
      .eq('verification_code', code)
      .maybeSingle();

    if (certificate) {
      // Get associated badge info
      const { data: badge } = await supabase
        .from('badges')
        .select('*, challenges(title, description)')
        .eq('id', certificate.badge_id)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          verified: true,
          type: 'certificate',
          certificate: {
            id: certificate.id,
            user_name: certificate.user_name,
            award_title: certificate.award_title,
            project_name: certificate.project_name,
            issued_at: certificate.issued_at,
            valid: certificate.valid,
            qr_data_url: certificate.qr_data_url,
            verification_code: certificate.verification_code
          },
          badge: badge ? {
            title: badge.title,
            points: badge.points,
            challenge_title: badge.challenges?.title
          } : null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback to badges table for older verifications
    const { data: badge, error } = await supabase
      .from('badges')
      .select('*, challenges(title, description)')
      .eq('verification_code', code)
      .maybeSingle();

    if (error || !badge) {
      console.error('Badge/Certificate not found:', error);
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Certificate or badge not found with this verification code' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user info
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('display_name, email')
      .eq('user_id', badge.user_id)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        verified: true,
        type: 'badge',
        badge: {
          title: badge.title,
          issued_at: badge.issued_at,
          points: badge.points,
          user_name: userProfile?.display_name || userProfile?.email || 'Eco Champion',
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
