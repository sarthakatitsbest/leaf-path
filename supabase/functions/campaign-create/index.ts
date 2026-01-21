import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Haversine distance in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { title, description, city, lat, lng, start_time, end_time, capacity, visibility, image_url, team_emails } = body;

    // Validate required fields
    if (!title || !lat || !lng || !start_time || !end_time) {
      return new Response(JSON.stringify({ error: 'Missing required fields: title, lat, lng, start_time, end_time' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        owner_id: user.id,
        title,
        description: description || null,
        city: city || null,
        lat,
        lng,
        start_time,
        end_time,
        capacity: capacity || 50,
        visibility: visibility || 'public',
        image_url: image_url || null
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Campaign creation error:', campaignError);
      return new Response(JSON.stringify({ error: campaignError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Add owner to team as organizer
    await supabase.from('campaign_team').insert({
      campaign_id: campaign.id,
      user_id: user.id,
      role: 'organizer'
    });

    // Add team members if provided
    if (team_emails && Array.isArray(team_emails) && team_emails.length > 0) {
      const { data: teamUsers } = await supabase
        .from('user_profiles')
        .select('user_id, email')
        .in('email', team_emails);

      if (teamUsers && teamUsers.length > 0) {
        const teamInserts = teamUsers.map(tu => ({
          campaign_id: campaign.id,
          user_id: tu.user_id,
          role: 'volunteer'
        }));
        await supabase.from('campaign_team').insert(teamInserts);
      }
    }

    // Find and notify nearby users (within 30km)
    console.log('Finding nearby users for campaign at:', lat, lng);
    
    const { data: nearbyUsers } = await supabase
      .from('user_profiles')
      .select('user_id, email, display_name, lat, lng, notification_opt_in')
      .eq('notification_opt_in', true)
      .not('lat', 'is', null)
      .not('lng', 'is', null);

    if (nearbyUsers && nearbyUsers.length > 0) {
      const usersWithin30km = nearbyUsers.filter(u => {
        if (!u.lat || !u.lng) return false;
        const distance = haversineDistance(lat, lng, u.lat, u.lng);
        return distance <= 30;
      });

      console.log(`Found ${usersWithin30km.length} users within 30km`);

      // Create notifications for nearby users (excluding owner)
      const notifications = usersWithin30km
        .filter(u => u.user_id !== user.id)
        .map(u => ({
          user_id: u.user_id,
          campaign_id: campaign.id,
          notification_type: 'nearby_campaign',
          payload: {
            title: campaign.title,
            city: campaign.city,
            start_time: campaign.start_time,
            distance_km: haversineDistance(lat, lng, u.lat!, u.lng!).toFixed(1)
          }
        }));

      if (notifications.length > 0) {
        await supabase.from('campaign_notifications').insert(notifications);
        console.log(`Created ${notifications.length} notifications`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      campaign,
      message: `Campaign created! Notified ${nearbyUsers?.length || 0} nearby users.`
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
