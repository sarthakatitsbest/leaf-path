import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, notAuthenticated, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "get_eco_profile",
  title: "Get eco profile",
  description:
    "Get the signed-in user's EcoPulse profile: display name, eco points and current streak.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const { data, error } = await supabaseForUser(ctx)
      .from("user_profiles")
      .select("display_name, username, points, total_points, current_streak")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("No profile found for this user yet.");
    return { ...textResult(data), structuredContent: { profile: data } };
  },
});
