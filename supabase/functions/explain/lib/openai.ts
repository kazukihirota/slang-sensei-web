// OpenAI operations

import { OpenAI } from "npm:openai@4.8.0";
import type { SlangContext, SlangData } from "./types.ts";
import { stripMarkdownFences } from "./utils.ts";

type ChatCompletionsClient = Pick<OpenAI, "chat">;

let openAIClient: ChatCompletionsClient | undefined;

/**
 * Get or create OpenAI client instance
 */
export function getOpenAIClient(apiKey: string): ChatCompletionsClient {
  if (!openAIClient) {
    openAIClient = new OpenAI({ apiKey });
  }
  return openAIClient;
}

/**
 * Reset the OpenAI client (mainly for testing)
 */
export function resetOpenAIClient(): void {
  openAIClient = undefined;
}

/**
 * Generate an explanation for existing slang entries
 */
export async function generateExplanation(
  apiKey: string,
  model: string,
  _term: string,
  context: SlangContext[],
): Promise<string> {
  const prompt = [
    {
      role: "system" as const,
      content:
        "You are a concise Japanese slang tutor. Keep total under 120 words. JP+EN, register notes.",
    },
    {
      role: "user" as const,
      content: `Context:\n${
        context.map((c) =>
          `- ${c.headword}: ${c.definition_en} / ${c.definition_ja}\nExamples: ${
            c.examples?.slice(0, 2).join(" | ")
          }`
        ).join("\n")
      }\nTask: 1) meaning+nuance, 2) 2 JP examples + EN gloss, 3) polite alt if casual/vulgar.`,
    },
  ];

  const completion = await getOpenAIClient(apiKey).chat.completions.create({
    model,
    messages: prompt,
    max_tokens: 220,
    temperature: 0.5,
  });

  const content = completion.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  return content;
}

/**
 * Analyze a new slang term and extract structured data
 */
export async function analyzeNewSlangTerm(
  apiKey: string,
  model: string,
  term: string,
): Promise<SlangData> {
  const structuredPrompt = [
    {
      role: "system" as const,
      content:
        "You are a concise Japanese slang tutor. Provide structured information and explanations. Keep explanations under 120 words with JP+EN examples and register notes.",
    },
    {
      role: "user" as const,
      content: `Analyze this Japanese slang term: "${term}"

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
  "explanation": "Concise explanation under 120 words. Format: Start with meaning and nuance. Then provide 2 Japanese example sentences with English translations. If casual/vulgar, mention polite alternative. Use natural conversational style with both Japanese and English mixed."
}

If this is not a real Japanese slang term, set all fields to null and explanation to "Not a recognized Japanese slang term."`,
    },
  ];

  const completion = await getOpenAIClient(apiKey).chat.completions.create({
    model,
    messages: structuredPrompt,
    max_tokens: 500,
    temperature: 0.3,
  });

  let responseText = completion.choices?.[0]?.message?.content?.trim();
  if (!responseText) {
    throw new Error("Empty response from OpenAI");
  }

  // Strip markdown code fences if present
  responseText = stripMarkdownFences(responseText);

  return JSON.parse(responseText);
}
