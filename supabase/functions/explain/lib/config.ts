// API Keys

export const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
export const GOOGLE_GENERATIVE_AI_API_KEY = Deno.env.get(
  "GOOGLE_GENERATIVE_AI_API_KEY",
)!;

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

// Derive types from the arrays
export type SUPPORTED_GPT_MODELS = (typeof GPT_MODELS)[number];
export type SUPPORTED_GEMINI_MODELS = (typeof GEMINI_MODELS)[number];
export type SUPPORTED_MODELS = SUPPORTED_GPT_MODELS | SUPPORTED_GEMINI_MODELS;

// Default model
export const DEFAULT_MODEL: SUPPORTED_MODELS = "gemini-2.5-flash-lite";
