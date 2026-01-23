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

    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radiusKm = parseFloat(url.searchParams.get('radius') || '30');
    const filter = url.searchParams.get('filter') || 'all'; // 'all', 'upcoming', 'my', 'nearby'
    const userId = url.searchParams.get('user_id');

    let query = supabase
      .from('campaigns')
      .select('*')
      .eq('visibility', 'public')
      .order('start_time', { ascending: true });

    // Apply filters
    if (filter === 'upcoming') {
      query = query.gte('start_time', new Date().toISOString());
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('Query error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch owner profiles separately (no FK relationship exists)
    const ownerIds = [...new Set((campaigns || []).map(c => c.owner_id).filter(Boolean))];
    let ownerMap: Record<string, any> = {};
    
    if (ownerIds.length > 0) {
      const { data: owners } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', ownerIds);
      
      owners?.forEach(o => {
        ownerMap[o.user_id] = { display_name: o.display_name, username: o.username, avatar_url: o.avatar_url };
      });
    }

    // Add owner info to campaigns
    let result = (campaigns || []).map(c => ({
      ...c,
      owner: ownerMap[c.owner_id] || null
    }));

    // Filter by distance if coordinates provided
    if (lat !== 0 && lng !== 0 && filter === 'nearby') {
      result = result.filter(c => {
        const distance = haversineDistance(lat, lng, c.lat, c.lng);
        return distance <= radiusKm;
      }).map(c => ({
        ...c,
        distance_km: parseFloat(haversineDistance(lat, lng, c.lat, c.lng).toFixed(1))
      })).sort((a, b) => a.distance_km - b.distance_km);
    }

    // Get participant counts for each campaign
    const campaignIds = result.map(c => c.id);
    if (campaignIds.length > 0) {
      const { data: participantCounts } = await supabase
        .from('campaign_participants')
        .select('campaign_id, status')
        .in('campaign_id', campaignIds)
        .in('status', ['approved', 'checked_in', 'completed']);

      const countMap: Record<string, number> = {};
      participantCounts?.forEach(p => {
        countMap[p.campaign_id] = (countMap[p.campaign_id] || 0) + 1;
      });

      result = result.map(c => ({
        ...c,
        participant_count: countMap[c.id] || 0
      }));
    }

    // If user_id provided, check participation status
    if (userId) {
      const { data: participations } = await supabase
        .from('campaign_participants')
        .select('campaign_id, status')
        .eq('user_id', userId)
        .in('campaign_id', campaignIds);

      const participationMap: Record<string, string> = {};
      participations?.forEach(p => {
        participationMap[p.campaign_id] = p.status;
      });

      result = result.map(c => ({
        ...c,
        user_status: participationMap[c.id] || null,
        is_owner: c.owner_id === userId
      }));
    }

    return new Response(JSON.stringify({ 
      campaigns: result,
      total: result.length
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
