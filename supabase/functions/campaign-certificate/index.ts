import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateCertificateHtml(data: {
  userName: string;
  campaignTitle: string;
  campaignDate: string;
  issuerName: string;
  verificationCode: string;
  qrCodeUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Georgia', serif;
      margin: 0;
      padding: 40px;
      background: linear-gradient(135deg, #1a472a 0%, #2d5016 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .certificate {
      background: #fff;
      border: 8px double #2d5016;
      padding: 50px;
      max-width: 800px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      border-radius: 8px;
    }
    .header-icon {
      font-size: 60px;
      margin-bottom: 10px;
    }
    .title {
      font-size: 36px;
      color: #1a472a;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .subtitle {
      font-size: 18px;
      color: #666;
      margin-bottom: 30px;
    }
    .text {
      font-size: 16px;
      color: #333;
      margin-bottom: 20px;
    }
    .name {
      font-size: 32px;
      color: #1a472a;
      font-weight: bold;
      border-bottom: 2px solid #2d5016;
      display: inline-block;
      padding-bottom: 5px;
      margin: 20px 0;
    }
    .campaign {
      font-size: 22px;
      color: #2d5016;
      font-style: italic;
      margin: 15px 0;
    }
    .date {
      font-size: 16px;
      color: #666;
      margin: 15px 0;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .issuer {
      text-align: left;
    }
    .issuer-name {
      font-weight: bold;
      color: #1a472a;
    }
    .qr-section {
      text-align: right;
    }
    .qr-code {
      width: 80px;
      height: 80px;
    }
    .verify-code {
      font-size: 10px;
      color: #999;
      margin-top: 5px;
    }
    .eco-badge {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      display: inline-block;
      margin: 15px 0;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header-icon">🌱</div>
    <div class="title">Certificate of Participation</div>
    <div class="subtitle">Go-Green Campaign</div>
    
    <div class="text">This is to certify that</div>
    <div class="name">${data.userName}</div>
    
    <div class="text">has actively participated in the environmental campaign</div>
    <div class="campaign">"${data.campaignTitle}"</div>
    
    <div class="eco-badge">🌍 Eco Warrior</div>
    
    <div class="date">Completed on ${data.campaignDate}</div>
    
    <div class="footer">
      <div class="issuer">
        <div class="text">Issued by</div>
        <div class="issuer-name">${data.issuerName}</div>
        <div class="text">Campaign Organizer</div>
      </div>
      <div class="qr-section">
        <img class="qr-code" src="${data.qrCodeUrl}" alt="QR Code">
        <div class="verify-code">Verify: ${data.verificationCode.substring(0, 8)}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
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
    const { campaign_id, participant_user_id, bulk_generate } = body;

    if (!campaign_id) {
      return new Response(JSON.stringify({ error: 'campaign_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get campaign and verify ownership
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

    if (campaign.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Only campaign owner can generate certificates' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get issuer profile
    const { data: issuerProfile } = await supabase
      .from('user_profiles')
      .select('display_name, username')
      .eq('user_id', user.id)
      .single();

    const issuerName = issuerProfile?.display_name || issuerProfile?.username || 'Campaign Organizer';

    // Determine which participants to generate certificates for
    let participantsQuery = supabase
      .from('campaign_participants')
      .select('user_id, status')
      .eq('campaign_id', campaign_id)
      .in('status', ['checked_in', 'completed']);

    if (!bulk_generate && participant_user_id) {
      participantsQuery = participantsQuery.eq('user_id', participant_user_id);
    }

    const { data: participants, error: partError } = await participantsQuery;

    if (partError || !participants || participants.length === 0) {
      return new Response(JSON.stringify({ error: 'No eligible participants found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const certificates = [];

    for (const participant of participants) {
      // Check if certificate already exists
      const { data: existingCert } = await supabase
        .from('campaign_certificates')
        .select('*')
        .eq('campaign_id', campaign_id)
        .eq('user_id', participant.user_id)
        .single();

      if (existingCert) {
        certificates.push(existingCert);
        continue;
      }

      // Get participant profile
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('display_name, username, email')
        .eq('user_id', participant.user_id)
        .single();

      const userName = userProfile?.display_name || userProfile?.username || 'Participant';
      const verificationCode = crypto.randomUUID();
      
      const verifyUrl = `${supabaseUrl.replace('.supabase.co', '.supabase.co')}/verify/campaign/${verificationCode}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verifyUrl)}`;

      const certificateHtml = generateCertificateHtml({
        userName,
        campaignTitle: campaign.title,
        campaignDate: new Date(campaign.start_time).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        issuerName,
        verificationCode,
        qrCodeUrl
      });

      // Insert certificate record
      const { data: cert, error: certError } = await supabase
        .from('campaign_certificates')
        .insert({
          campaign_id,
          user_id: participant.user_id,
          issued_by: user.id,
          verification_code: verificationCode,
          metadata: {
            html: certificateHtml,
            campaign_title: campaign.title,
            participant_name: userName
          }
        })
        .select()
        .single();

      if (certError) {
        console.error('Certificate insert error:', certError);
        continue;
      }

      // Mark participant as completed
      await supabase
        .from('campaign_participants')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('campaign_id', campaign_id)
        .eq('user_id', participant.user_id);

      certificates.push({
        ...cert,
        html: certificateHtml
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      certificates,
      message: `Generated ${certificates.length} certificate(s)`
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
