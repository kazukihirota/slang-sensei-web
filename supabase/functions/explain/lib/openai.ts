// OpenAI operations

import { OpenAI } from "npm:openai@4.8.0";
import type { SlangContext, SlangData } from "./types.ts";
import { stripMarkdownFences } from "./utils.ts";
import {
  buildAnalysisPrompt,
  buildExplanationPrompt,
  SYSTEM_PROMPT,
} from "./prompts.ts";

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
      content: SYSTEM_PROMPT,
    },
    {
      role: "user" as const,
      content: buildExplanationPrompt(context),
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
      content: SYSTEM_PROMPT,
    },
    {
      role: "user" as const,
      content: buildAnalysisPrompt(term),
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
