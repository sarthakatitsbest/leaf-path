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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const city = url.searchParams.get('city') || '';
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');

    // Fetch existing hotspots
    let query = supabase.from('plastic_hotspots').select('*');
    
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const { data: hotspots, error } = await query.order('score', { ascending: false }).limit(50);

    if (error) {
      throw error;
    }

    // If no hotspots and we have location, generate sample data
    if ((!hotspots || hotspots.length === 0) && (lat !== 0 || lng !== 0)) {
      // Generate realistic sample hotspots around the user's location
      const sampleHotspots = [
        {
          city: city || 'Local Area',
          area_name: 'River Bank Zone',
          location_lat: lat + 0.01,
          location_lng: lng + 0.008,
          severity: 'critical',
          score: 85,
          sources: ['citizen_reports', 'ngo_cleanup_data'],
        },
        {
          city: city || 'Local Area',
          area_name: 'Market District',
          location_lat: lat - 0.005,
          location_lng: lng + 0.012,
          severity: 'high',
          score: 72,
          sources: ['waste_audit', 'municipal_data'],
        },
        {
          city: city || 'Local Area',
          area_name: 'Residential Block A',
          location_lat: lat + 0.015,
          location_lng: lng - 0.007,
          severity: 'medium',
          score: 55,
          sources: ['citizen_reports'],
        },
        {
          city: city || 'Local Area',
          area_name: 'Industrial Edge',
          location_lat: lat - 0.012,
          location_lng: lng - 0.015,
          severity: 'high',
          score: 68,
          sources: ['ngo_cleanup_data', 'satellite_analysis'],
        },
        {
          city: city || 'Local Area',
          area_name: 'School Vicinity',
          location_lat: lat + 0.008,
          location_lng: lng + 0.018,
          severity: 'low',
          score: 35,
          sources: ['citizen_reports'],
        },
      ];

      // Insert sample data for demo
      await supabase.from('plastic_hotspots').insert(sampleHotspots);

      return new Response(JSON.stringify({
        hotspots: sampleHotspots,
        total: sampleHotspots.length,
        generated: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate statistics
    const stats = {
      total: hotspots?.length || 0,
      critical: hotspots?.filter(h => h.severity === 'critical').length || 0,
      high: hotspots?.filter(h => h.severity === 'high').length || 0,
      medium: hotspots?.filter(h => h.severity === 'medium').length || 0,
      low: hotspots?.filter(h => h.severity === 'low').length || 0,
      average_score: hotspots && hotspots.length > 0
        ? Math.round(hotspots.reduce((sum, h) => sum + (h.score || 0), 0) / hotspots.length)
        : 0,
    };

    return new Response(JSON.stringify({
      hotspots: hotspots || [],
      stats,
      total: hotspots?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Plastic hotspots error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
