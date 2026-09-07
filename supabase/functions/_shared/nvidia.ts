// Shared NVIDIA NIM (OpenAI-compatible) chat helper.
// The API key lives ONLY in the Edge Function environment. Never returned to clients.

const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
export const NVIDIA_MODEL = "nvidia/nemotron-3-ultra-550b-a55b";

export class NvidiaError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Strip any reasoning / chain-of-thought blocks so only the final answer reaches the UI. */
export function stripReasoning(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "")
    .trim();
}

export async function nvidiaChat(
  messages: ChatMessage[],
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const nvidiaApiKey = Deno.env.get("NVIDIA_API_KEY");
  if (!nvidiaApiKey) {
    throw new NvidiaError("AI service is not configured.", 500);
  }

  let response: Response;
  try {
    response = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${nvidiaApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.maxTokens ?? 600,
        stream: false,
      }),
    });
  } catch (e) {
    console.error("NVIDIA API network error:", e);
    throw new NvidiaError("AI service is temporarily unavailable. Please try again.", 503);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("NVIDIA API Error:", response.status, errorText);
    if (response.status === 429) {
      throw new NvidiaError("AI is busy right now. Please try again in a moment.", 429);
    }
    if (response.status === 401 || response.status === 403) {
      throw new NvidiaError("AI service authorization failed.", 500);
    }
    throw new NvidiaError("AI service is temporarily unavailable. Please try again.", 503);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content ?? "";
  const content = stripReasoning(typeof raw === "string" ? raw : String(raw));
  if (!content) {
    throw new NvidiaError("AI returned an empty response. Please try again.", 502);
  }
  return content;
}

/** Extract the first JSON object from a model reply. */
export function extractJson<T = any>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}
