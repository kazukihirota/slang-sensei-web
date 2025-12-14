// API Keys

export const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
export const GOOGLE_GENERATIVE_AI_API_KEY = Deno.env.get(
  "GOOGLE_GENERATIVE_AI_API_KEY",
)!;
export const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
export const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;

// Supabase
export const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
export const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Model arrays (single source of truth)
export const GPT_MODELS = ["gpt-4o", "gpt-4o-mini"] as const;
export const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
] as const;
export const ANTHROPIC_MODELS = ["claude-haiku-4-5-20251001"] as const;
export const CEREBRAS_MODELS = [
  "cerebras/llama-3.3-70b",
  "cerebras/llama3.1-8b",
] as const;

// Derive types from the arrays
export type SUPPORTED_GPT_MODELS = (typeof GPT_MODELS)[number];
export type SUPPORTED_GEMINI_MODELS = (typeof GEMINI_MODELS)[number];
export type SUPPORTED_ANTHROPIC_MODELS = (typeof ANTHROPIC_MODELS)[number];
export type SUPPORTED_CEREBRAS_MODELS = (typeof CEREBRAS_MODELS)[number];
export type SUPPORTED_MODELS =
  | SUPPORTED_GPT_MODELS
  | SUPPORTED_GEMINI_MODELS
  | SUPPORTED_ANTHROPIC_MODELS
  | SUPPORTED_CEREBRAS_MODELS;

// Default model (Cerebras via OpenRouter for fast inference)
export const DEFAULT_MODEL: SUPPORTED_MODELS = "cerebras/llama-3.3-70b";
