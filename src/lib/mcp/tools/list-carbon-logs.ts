import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, notAuthenticated, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_carbon_logs",
  title: "List carbon logs",
  description:
    "List the signed-in user's most recent daily carbon footprint logs, newest first.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("How many logs to return (default 14, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const { data, error } = await supabaseForUser(ctx)
      .from("carbon_logs")
      .select(
        "log_date, total_emissions, travel_emissions, energy_emissions, food_emissions",
      )
      .eq("user_id", ctx.getUserId())
      .order("log_date", { ascending: false })
      .limit(limit ?? 14);
    if (error) return errorResult(error.message);
    return { ...textResult(data ?? []), structuredContent: { logs: data ?? [] } };
  },
});
