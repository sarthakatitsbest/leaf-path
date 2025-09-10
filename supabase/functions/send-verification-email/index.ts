import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  verificationCode: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, verificationCode }: VerificationRequest = await req.json();

    // Send email via Subspace API
    const subspaceResponse = await fetch("https://api.subspace.com/v1/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUBSPACE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        from: "noreply@greenmind.app",
        subject: "Green Mind - Email Verification",
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #22c55e;">Welcome to Green Mind!</h2>
            <p>Thank you for joining our carbon tracking community. Please verify your email address using the code below:</p>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #15803d; font-size: 24px; margin: 0;">${verificationCode}</h3>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>Start tracking your carbon footprint and compete with others to make a positive impact!</p>
          </div>
        `,
      }),
    });

    if (!subspaceResponse.ok) {
      throw new Error("Failed to send verification email");
    }

    console.log("Verification email sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});