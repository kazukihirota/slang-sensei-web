// Utility functions

import type { Language } from "./types.ts";
import {
  ANTHROPIC_API_KEY,
  GOOGLE_GENERATIVE_AI_API_KEY,
  OPENAI_API_KEY,
  OPENROUTER_API_KEY,
  type SUPPORTED_MODELS,
} from "./config.ts";

/**
 * Generate a hash from search parameters for caching
 */
export async function generateHash(
  term: string,
  ids: string[],
): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(
      JSON.stringify({ term, ids }),
    ),
  );
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Resolve the appropriate API key based on the model
 */
export function resolveApiKey(model: SUPPORTED_MODELS): string {
  const modelLower = model.toLowerCase();

  if (modelLower.startsWith("gemini")) {
    return GOOGLE_GENERATIVE_AI_API_KEY;
  } else if (modelLower.startsWith("gpt")) {
    return OPENAI_API_KEY;
  } else if (modelLower.startsWith("claude")) {
    return ANTHROPIC_API_KEY;
  }

  return OPENROUTER_API_KEY;
}

export function detectLanguage(text: string): Language {
  const japaneseRegex = /[\u3040-\u30FF\u4E00-\u9FFF\uFF66-\uFF9D]/;
  if (japaneseRegex.test(text)) return "Japanese";
  return "English";
}

/**
 * Strip markdown code fences from text
 */
export function stripMarkdownFences(text: string): string {
  if (text.startsWith("```")) {
    return text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  }
  return text;
}

/**
 * Generate a fallback explanation from slang context
 */
export function generateFallbackExplanation(slang: {
  headword: string;
  reading?: string;
  definition_en: string;
  definition_ja: string;
  register: string;
  polite_equiv?: string;
  examples?: string[];
  notes?: string;
}): string {
  return `## ${slang.headword}${slang.reading ? ` (${slang.reading})` : ""}

**Definition:** ${slang.definition_en}

**Japanese:** ${slang.definition_ja}

**Register:** ${slang.register}${
    slang.polite_equiv ? ` (polite form: ${slang.polite_equiv})` : ""
  }

${
    slang.examples && slang.examples.length > 0
      ? `**Examples:**\n${slang.examples.slice(0, 2).join("\n")}`
      : ""
  }

${slang.notes ? `**Notes:** ${slang.notes}` : ""}`;
}
