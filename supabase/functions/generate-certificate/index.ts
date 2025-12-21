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
    const { userId, badgeId, userName, awardTitle, projectName } = await req.json();

    if (!userId || !badgeId) {
      return new Response(
        JSON.stringify({ error: 'userId and badgeId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get badge details
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*, challenges(title, description)')
      .eq('id', badgeId)
      .single();

    if (badgeError || !badge) {
      console.error('Badge not found:', badgeError);
      return new Response(
        JSON.stringify({ error: 'Badge not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if certificate already exists for this badge
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('id, verification_code, pdf_url, qr_data_url')
      .eq('badge_id', badgeId)
      .maybeSingle();

    if (existingCert) {
      // Generate verify URL for existing cert
      const baseUrl = 'https://leaf-path.lovable.app';
      const verifyUrl = `${baseUrl}/verify?code=${existingCert.verification_code}`;
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Certificate already exists',
          certificate: {
            ...existingCert,
            verifyUrl,
            certificateHtml: generateCertificateHtml({
              userName: userName || 'Eco Champion',
              awardTitle: awardTitle || badge.title,
              projectName: projectName || 'Eco Pulse AI',
              issuedAt: new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              verificationCode: existingCert.verification_code
            })
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate verification code
    const verificationCode = crypto.randomUUID();
    
    // Build verification URL
    const baseUrl = 'https://leaf-path.lovable.app';
    const verifyUrl = `${baseUrl}/verify?code=${verificationCode}`;

    // Use QuickChart API for QR code generation (works in Deno)
    const qrDataUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=200&margin=2`;

    // Create certificate HTML for PDF-like display
    const certificateHtml = generateCertificateHtml({
      userName: userName || 'Eco Champion',
      awardTitle: awardTitle || badge.title,
      projectName: projectName || 'Eco Pulse AI',
      issuedAt: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      verificationCode,
      qrUrl: qrDataUrl
    });

    // Store certificate record
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        verification_code: verificationCode,
        user_name: userName || 'Eco Champion',
        award_title: awardTitle || badge.title,
        project_name: projectName || 'Eco Pulse AI',
        qr_data_url: qrDataUrl,
        valid: true
      })
      .select()
      .single();

    if (certError) {
      console.error('Certificate creation error:', certError);
      return new Response(
        JSON.stringify({ error: 'Failed to create certificate' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update badge with certificate reference
    await supabase
      .from('badges')
      .update({ certificate_url: `/verify?code=${verificationCode}` })
      .eq('id', badgeId);

    console.log('Certificate generated successfully:', certificate.id);

    return new Response(
      JSON.stringify({
        success: true,
        certificate: {
          id: certificate.id,
          verificationCode: certificate.verification_code,
          qrDataUrl: qrDataUrl,
          verifyUrl,
          certificateHtml
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate certificate error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateCertificateHtml(data: {
  userName: string;
  awardTitle: string;
  projectName: string;
  issuedAt: string;
  verificationCode: string;
  qrUrl?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    .certificate {
      width: 800px;
      height: 600px;
      background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
      border: 3px solid #c9a227;
      position: relative;
      font-family: 'Inter', sans-serif;
      padding: 40px;
    }
    
    .border-inner {
      width: 100%;
      height: 100%;
      border: 1px solid #c9a227;
      padding: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    
    .header {
      text-align: center;
    }
    
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      color: #0b243b;
      letter-spacing: 4px;
    }
    
    .subtitle {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }
    
    .content {
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .awarded-to {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .recipient {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      color: #0b243b;
      margin: 15px 0;
      font-weight: 700;
    }
    
    .award-title {
      font-size: 16px;
      color: #4b2f10;
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    .project-name {
      font-size: 14px;
      color: #0b243b;
      margin-top: 20px;
      font-weight: 600;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
    }
    
    .qr-section {
      text-align: center;
    }
    
    .qr-section img {
      width: 80px;
      height: 80px;
    }
    
    .qr-label {
      font-size: 8px;
      color: #666;
      margin-top: 5px;
    }
    
    .signature-section {
      text-align: right;
    }
    
    .issued-date {
      font-size: 11px;
      color: #666;
    }
    
    .signature-name {
      font-size: 14px;
      font-weight: 600;
      color: #0b243b;
      margin-top: 5px;
    }
    
    .signature-title {
      font-size: 10px;
      color: #666;
    }
    
    .decorative-corner {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 2px solid #c9a227;
    }
    
    .corner-tl { top: 15px; left: 15px; border-right: none; border-bottom: none; }
    .corner-tr { top: 15px; right: 15px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 15px; left: 15px; border-right: none; border-top: none; }
    .corner-br { bottom: 15px; right: 15px; border-left: none; border-top: none; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="decorative-corner corner-tl"></div>
    <div class="decorative-corner corner-tr"></div>
    <div class="decorative-corner corner-bl"></div>
    <div class="decorative-corner corner-br"></div>
    
    <div class="border-inner">
      <div class="header">
        <div class="title">CERTIFICATE OF RECOGNITION</div>
        <div class="subtitle">Sustainable Living Achievement</div>
      </div>
      
      <div class="content">
        <div class="awarded-to">This certificate is awarded to</div>
        <div class="recipient">${data.userName}</div>
        <div class="award-title">${data.awardTitle}</div>
        <div class="project-name">${data.projectName}</div>
      </div>
      
      <div class="footer">
        <div class="qr-section">
          ${data.qrUrl ? `<img src="${data.qrUrl}" alt="Verification QR">` : ''}
          <div class="qr-label">Scan to verify<br>Code: ${data.verificationCode.slice(0, 8)}...</div>
        </div>
        
        <div class="signature-section">
          <div class="issued-date">Issued: ${data.issuedAt}</div>
          <div class="signature-name">Eco Pulse AI</div>
          <div class="signature-title">Sustainability Platform</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
