import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, notAuthenticated, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "join_campaign",
  title: "Join a campaign",
  description: "Register the signed-in user as a participant of a go-green campaign.",
  inputSchema: {
    campaign_id: z.string().uuid().describe("ID of the campaign to join (from list_campaigns)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ campaign_id }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const { data: existing } = await supabase
      .from("campaign_participants")
      .select("id, status")
      .eq("campaign_id", campaign_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) return textResult({ alreadyJoined: true, participant: existing });

    const { data, error } = await supabase
      .from("campaign_participants")
      .insert({ campaign_id, user_id: userId, status: "joined" })
      .select()
      .maybeSingle();
    if (error) return errorResult(error.message);
    return { ...textResult(data), structuredContent: { participant: data } };
  },
});
