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
// OpenRouter models (run on Cerebras hardware via provider routing)
export const OPENROUTER_MODELS = [
  "meta-llama/llama-3.3-70b-instruct",
  "meta-llama/llama-3.1-8b-instruct",
  "openai/gpt-oss-120b",
  "google/gemini-2.5-flash-lite",
  "qwen/qwen3-235b-a22b-2507",
] as const;

// Derive types from the arrays
export type SUPPORTED_GPT_MODELS = (typeof GPT_MODELS)[number];
export type SUPPORTED_GEMINI_MODELS = (typeof GEMINI_MODELS)[number];
export type SUPPORTED_ANTHROPIC_MODELS = (typeof ANTHROPIC_MODELS)[number];
export type SUPPORTED_OPENROUTER_MODELS = (typeof OPENROUTER_MODELS)[number];
export type SUPPORTED_MODELS =
  | SUPPORTED_GPT_MODELS
  | SUPPORTED_GEMINI_MODELS
  | SUPPORTED_ANTHROPIC_MODELS
  | SUPPORTED_OPENROUTER_MODELS;

// Default model (Llama 3.3 70B via OpenRouter/Cerebras for fast inference)
export const DEFAULT_MODEL: SUPPORTED_MODELS = "qwen/qwen3-235b-a22b-2507";
