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
    const { campaign_id, action } = body;

    if (!campaign_id) {
      return new Response(JSON.stringify({ error: 'campaign_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get campaign details
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

    // Check capacity
    const { count } = await supabase
      .from('campaign_participants')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaign_id)
      .in('status', ['approved', 'checked_in', 'completed']);

    if (count && campaign.capacity && count >= campaign.capacity) {
      return new Response(JSON.stringify({ error: 'Campaign is full' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if already joined
    const { data: existing } = await supabase
      .from('campaign_participants')
      .select('*')
      .eq('campaign_id', campaign_id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Handle leave action
      if (action === 'leave') {
        await supabase
          .from('campaign_participants')
          .delete()
          .eq('campaign_id', campaign_id)
          .eq('user_id', user.id);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Left campaign successfully' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        error: 'Already joined this campaign',
        status: existing.status 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Auto-approve for public campaigns, request for private
    const status = campaign.visibility === 'public' ? 'approved' : 'requested';

    const { data: participant, error: joinError } = await supabase
      .from('campaign_participants')
      .insert({
        campaign_id,
        user_id: user.id,
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (joinError) {
      console.error('Join error:', joinError);
      return new Response(JSON.stringify({ error: joinError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      participant,
      message: status === 'approved' 
        ? 'Successfully joined the campaign!' 
        : 'Join request sent. Waiting for approval.'
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
