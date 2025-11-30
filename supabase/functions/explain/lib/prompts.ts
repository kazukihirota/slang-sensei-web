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
  "You are a concise Japanese slang tutor. Always provide exactly 2 example sentences. Keep total under 120 words.";

/**
 * Builds the user prompt for explaining existing slang entries
 */
export function buildExplanationPrompt(
  context: {
    headword: string;
    definition_en: string;
    definition_ja: string;
    examples?: string[];
  },
): string {
  const contextStr = `${context.headword}: ${context.definition_en}\nExamples: ${
    context.examples?.slice(0, 2).join(" | ") || "none"
  }`;

  return `Context: ${contextStr}\n\nYou MUST follow this exact format with all sections. Always include exactly 2 complete example sentences:\n\n${EXPLANATION_FORMAT}\n\nIMPORTANT:
- Provide 2 full example sentences (both Japanese and English)
- Include the "Polite Alternative" section if the term is casual or vulgar
- If the term is neutral/polite, you can omit the "Polite Alternative" section`;
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
