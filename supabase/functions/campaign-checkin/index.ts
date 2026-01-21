import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Haversine distance in meters
function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { campaign_id, lat, lng } = body;

    if (!campaign_id || lat === undefined || lng === undefined) {
      return new Response(JSON.stringify({ error: 'campaign_id, lat, lng required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get campaign
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();

    if (campError || !campaign) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check time window (allow 1 hour before to 1 hour after)
    const now = new Date();
    const startTime = new Date(campaign.start_time);
    const endTime = new Date(campaign.end_time);
    startTime.setHours(startTime.getHours() - 1);
    endTime.setHours(endTime.getHours() + 1);

    if (now < startTime || now > endTime) {
      return new Response(JSON.stringify({ 
        error: 'Check-in only allowed within event time window',
        start_time: campaign.start_time,
        end_time: campaign.end_time
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check distance (max 500 meters)
    const distance = haversineDistanceMeters(lat, lng, campaign.lat, campaign.lng);
    const MAX_DISTANCE = 500; // meters

    if (distance > MAX_DISTANCE) {
      return new Response(JSON.stringify({ 
        error: `You are ${Math.round(distance)}m away. Please be within ${MAX_DISTANCE}m of the campaign location.`,
        distance_meters: Math.round(distance),
        max_allowed: MAX_DISTANCE
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get participant record
    const { data: participant, error: partError } = await supabase
      .from('campaign_participants')
      .select('*')
      .eq('campaign_id', campaign_id)
      .eq('user_id', user.id)
      .single();

    if (partError || !participant) {
      return new Response(JSON.stringify({ error: 'You have not joined this campaign' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (participant.status !== 'approved') {
      if (participant.status === 'checked_in' || participant.status === 'completed') {
        return new Response(JSON.stringify({ error: 'Already checked in' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: 'Your join request is not yet approved' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update to checked_in
    const { error: updateError } = await supabase
      .from('campaign_participants')
      .update({
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        checked_in_lat: lat,
        checked_in_lng: lng
      })
      .eq('id', participant.id);

    if (updateError) {
      console.error('Check-in update error:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully checked in!',
      distance_meters: Math.round(distance),
      checked_in_at: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
