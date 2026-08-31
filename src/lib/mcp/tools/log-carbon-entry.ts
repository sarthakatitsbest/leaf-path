import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, notAuthenticated, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "log_carbon_entry",
  title: "Log carbon entry",
  description:
    "Create or update the signed-in user's carbon footprint log for a given date (kg CO2e per category).",
  inputSchema: {
    log_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe("Date of the log in YYYY-MM-DD format."),
    travel_emissions: z.number().min(0).optional().describe("Travel emissions in kg CO2e."),
    energy_emissions: z.number().min(0).optional().describe("Energy emissions in kg CO2e."),
    food_emissions: z.number().min(0).optional().describe("Food emissions in kg CO2e."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const travel = input.travel_emissions ?? 0;
    const energy = input.energy_emissions ?? 0;
    const food = input.food_emissions ?? 0;
    const row = {
      user_id: ctx.getUserId(),
      log_date: input.log_date,
      travel_emissions: travel,
      energy_emissions: energy,
      food_emissions: food,
      total_emissions: travel + energy + food,
    };
    const { data, error } = await supabaseForUser(ctx)
      .from("carbon_logs")
      .upsert(row, { onConflict: "user_id,log_date" })
      .select()
      .maybeSingle();
    if (error) return errorResult(error.message);
    return { ...textResult(data), structuredContent: { log: data } };
  },
});
