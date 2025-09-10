import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all users
    const { data: users } = await supabaseClient
      .from("user_profiles")
      .select("user_id, email, display_name");

    if (!users) {
      throw new Error("No users found");
    }

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay())); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

    for (const user of users) {
      // Get user's carbon logs for the week
      const { data: logs } = await supabaseClient
        .from("carbon_logs")
        .select("*")
        .eq("user_id", user.user_id)
        .gte("log_date", weekStart.toISOString().split('T')[0])
        .lte("log_date", weekEnd.toISOString().split('T')[0]);

      if (!logs || logs.length === 0) continue;

      // Calculate weekly stats
      const totalEmissions = logs.reduce((sum, log) => sum + (log.total_emissions || 0), 0);
      const avgDailyEmissions = totalEmissions / 7;
      const streakDays = logs.length;

      // Get previous week for comparison
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(weekStart.getDate() - 7);
      const prevWeekEnd = new Date(prevWeekStart);
      prevWeekEnd.setDate(prevWeekStart.getDate() + 6);

      const { data: prevLogs } = await supabaseClient
        .from("carbon_logs")
        .select("total_emissions")
        .eq("user_id", user.user_id)
        .gte("log_date", prevWeekStart.toISOString().split('T')[0])
        .lte("log_date", prevWeekEnd.toISOString().split('T')[0]);

      const prevTotalEmissions = prevLogs?.reduce((sum, log) => sum + (log.total_emissions || 0), 0) || 0;
      const improvementPercentage = prevTotalEmissions > 0 
        ? ((prevTotalEmissions - totalEmissions) / prevTotalEmissions) * 100 
        : 0;

      const pointsEarned = Math.max(0, Math.round(100 - totalEmissions * 2));

      // Save weekly report
      const reportData = {
        user_id: user.user_id,
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        total_emissions: totalEmissions,
        avg_daily_emissions: avgDailyEmissions,
        points_earned: pointsEarned,
        streak_days: streakDays,
        improvement_percentage: improvementPercentage,
        report_data: {
          logs_count: logs.length,
          travel_emissions: logs.reduce((sum, log) => sum + log.travel_emissions, 0),
          energy_emissions: logs.reduce((sum, log) => sum + log.energy_emissions, 0),
          food_emissions: logs.reduce((sum, log) => sum + log.food_emissions, 0),
        },
      };

      await supabaseClient
        .from("weekly_reports")
        .upsert(reportData, { onConflict: "user_id,week_start" });

      // Send weekly digest email via Subspace
      const emailContent = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #22c55e;">Your Weekly Green Mind Report</h2>
          <p>Hi ${user.display_name || 'Green Champion'}!</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #15803d;">This Week's Impact</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Total Emissions:</strong> ${totalEmissions.toFixed(2)} kg CO₂</li>
              <li><strong>Daily Average:</strong> ${avgDailyEmissions.toFixed(2)} kg CO₂</li>
              <li><strong>Active Days:</strong> ${streakDays}/7</li>
              <li><strong>Points Earned:</strong> ${pointsEarned}</li>
              ${improvementPercentage !== 0 ? `<li><strong>Improvement:</strong> ${improvementPercentage > 0 ? '↓' : '↑'} ${Math.abs(improvementPercentage).toFixed(1)}%</li>` : ''}
            </ul>
          </div>
          
          <p>Keep up the great work! Every small action makes a difference for our planet. 🌱</p>
          
          <p><a href="https://greenmind.app" style="background-color: #22c55e; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px;">View Full Report</a></p>
        </div>
      `;

      await fetch("https://api.subspace.com/v1/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUBSPACE_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: user.email,
          from: "reports@greenmind.app",
          subject: "Your Weekly Green Mind Report 🌱",
          html: emailContent,
        }),
      });

      console.log(`Weekly report generated for user: ${user.email}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Weekly reports generated" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating weekly reports:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});