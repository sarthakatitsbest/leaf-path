import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, notAuthenticated, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_campaigns",
  title: "List go-green campaigns",
  description:
    "List upcoming go-green campaigns (cleanups, plantations, recycling drives) visible to the signed-in user.",
  inputSchema: {
    city: z.string().trim().min(1).optional().describe("Filter campaigns by city name."),
    limit: z.number().int().min(1).max(50).optional().describe("Max campaigns (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ city, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    let query = supabaseForUser(ctx)
      .from("campaigns")
      .select("id, title, description, city, lat, lng, start_time, end_time, capacity")
      .gte("end_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(limit ?? 20);
    if (city) query = query.ilike("city", `%${city}%`);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return { ...textResult(data ?? []), structuredContent: { campaigns: data ?? [] } };
  },
});
