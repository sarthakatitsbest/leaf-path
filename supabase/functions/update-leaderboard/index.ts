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

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));

    // Get all users with their carbon data
    const { data: users } = await supabaseClient
      .from("user_profiles")
      .select("user_id, username, total_points");

    if (!users) {
      throw new Error("No users found");
    }

    const leaderboardEntries = [];

    for (const user of users) {
      // Get this week's carbon logs
      const weekEndStr = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weeklyLogs } = await supabaseClient
        .from("carbon_logs")
        .select("total_emissions")
        .eq("user_id", user.user_id)
        .gte("log_date", weekStartStr)
        .lte("log_date", weekEndStr);

      // Get monthly logs (last 30 days)
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const { data: monthlyLogs } = await supabaseClient
        .from("carbon_logs")
        .select("total_emissions")
        .eq("user_id", user.user_id)
        .gte("log_date", monthAgo.toISOString().split('T')[0]);

      // Calculate weekly and monthly points
      const weeklyEmissions = weeklyLogs?.reduce((sum, log) => sum + (log.total_emissions || 0), 0) || 0;
      const monthlyEmissions = monthlyLogs?.reduce((sum, log) => sum + (log.total_emissions || 0), 0) || 0;
      
      const weeklyPoints = Math.max(0, Math.round(100 - weeklyEmissions * 2));
      const monthlyPoints = Math.max(0, Math.round(300 - monthlyEmissions * 2));

      // Calculate average daily emissions (last 7 days)
      const avgDailyEmissions = weeklyEmissions / 7;

      leaderboardEntries.push({
        user_id: user.user_id,
        username: user.username || 'Anonymous',
        total_points: user.total_points || 0,
        weekly_points: weeklyPoints,
        monthly_points: monthlyPoints,
        avg_daily_emissions: avgDailyEmissions,
        week_start: weekStartStr,
      });
    }

    // Sort by total points (descending) and assign ranks
    leaderboardEntries.sort((a, b) => b.total_points - a.total_points);
    leaderboardEntries.forEach((entry, index) => {
      entry.rank_position = index + 1;
    });

    // Clear existing leaderboard for this week
    await supabaseClient
      .from("leaderboard")
      .delete()
      .eq("week_start", weekStartStr);

    // Insert new leaderboard data
    const { error } = await supabaseClient
      .from("leaderboard")
      .insert(leaderboardEntries);

    if (error) {
      throw new Error(error.message);
    }

    console.log(`Leaderboard updated for ${leaderboardEntries.length} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Leaderboard updated", 
        entries: leaderboardEntries.length 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});