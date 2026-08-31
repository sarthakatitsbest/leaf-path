import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getEcoProfile from "./tools/get-eco-profile";
import listCarbonLogs from "./tools/list-carbon-logs";
import logCarbonEntry from "./tools/log-carbon-entry";
import listCampaigns from "./tools/list-campaigns";
import joinCampaign from "./tools/join-campaign";

// Issuer must be the direct Supabase host, built from the project ref.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "ecopulse-mcp",
  title: "EcoPulse",
  version: "0.1.0",
  instructions:
    "Tools for EcoPulse, a personal sustainability tracker. Use `get_eco_profile` for the user's points and streak, `list_carbon_logs` to read their recent daily carbon footprint, `log_carbon_entry` to record a day's emissions, and `list_campaigns` / `join_campaign` for local go-green events. All tools act as the signed-in EcoPulse user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getEcoProfile, listCarbonLogs, logCarbonEntry, listCampaigns, joinCampaign],
});
