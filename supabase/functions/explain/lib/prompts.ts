// Shared prompts and templates for OpenAI interactions

/**
 * Format template for explanation responses
 */
export const EXPLANATION_FORMAT = `**Meaning + Nuance**:
[Explain the meaning and nuance of the term]

**Examples**:
   - [Japanese example 1] | [English translation]
   - [Japanese example 2] | [English translation]

**Polite Alternative**:
[If casual/vulgar, provide a polite alternative with example. Otherwise omit this section]`;

/**
 * System prompt for Japanese slang tutor
 */
export const SYSTEM_PROMPT =
  "You are a concise Japanese slang tutor. Keep total under 120 words. JP+EN, register notes.";

/**
 * Builds the user prompt for explaining existing slang entries
 */
export function buildExplanationPrompt(
  context: Array<{
    headword: string;
    definition_en: string;
    definition_ja: string;
    examples?: string[];
  }>,
): string {
  const contextStr = context.map((c) =>
    `- ${c.headword}: ${c.definition_en} / ${c.definition_ja}\nExamples: ${
      c.examples?.slice(0, 2).join(" | ")
    }`
  ).join("\n");

  return `Context:\n${contextStr}\n\nFormat your response EXACTLY like this:\n\n${EXPLANATION_FORMAT}`;
}

/**
 * Builds the user prompt for analyzing new slang terms
 */
export function buildAnalysisPrompt(term: string): string {
  return `Analyze this Japanese slang term: "${term}"

Respond ONLY with valid JSON (no markdown, no explanation) with these fields:
{
  "headword": "the term in Japanese",
  "reading": "hiragana reading",
  "pos": "part of speech (interj/adj/verb/phrase/noun)",
  "register": "formality (polite/neutral/casual/vulgar)",
  "definition_ja": "Japanese definition",
  "definition_en": "English definition",
  "polite_equiv": "polite alternative if applicable",
  "notes": "usage notes",
  "examples": [{"jp": "example in Japanese", "en": "example in English"}],
  "explanation": "Format EXACTLY like this:\\n\\n${
    EXPLANATION_FORMAT.replace(/\n/g, "\\n")
  }"
}

If this is not a real Japanese slang term, set all fields to null and explanation to "Not a recognized Japanese slang term."`;
}
