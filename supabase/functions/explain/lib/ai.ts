import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import type { SlangContext, SlangData } from "./types.ts";
import {
  buildAnalysisPrompt,
  buildExplanationPrompt,
  buildGrammarAnalysisPrompt,
  GRAMMAR_SYSTEM_PROMPT,
  SYSTEM_PROMPT,
} from "./prompts.ts";
import {
  ANTHROPIC_MODELS,
  GEMINI_MODELS,
  GPT_MODELS,
  OPENROUTER_MODELS,
  type SUPPORTED_ANTHROPIC_MODELS,
  type SUPPORTED_GEMINI_MODELS,
  type SUPPORTED_GPT_MODELS,
  type SUPPORTED_MODELS,
  type SUPPORTED_OPENROUTER_MODELS,
} from "./config.ts";

// Type guard functions
const isGPTModel = (model: SUPPORTED_MODELS): model is SUPPORTED_GPT_MODELS => {
  return GPT_MODELS.includes(model as SUPPORTED_GPT_MODELS);
};

const isGeminiModel = (
  model: SUPPORTED_MODELS,
): model is SUPPORTED_GEMINI_MODELS => {
  return GEMINI_MODELS.includes(model as SUPPORTED_GEMINI_MODELS);
};

const isAnthropicModel = (
  model: SUPPORTED_MODELS,
): model is SUPPORTED_ANTHROPIC_MODELS => {
  return ANTHROPIC_MODELS.includes(model as SUPPORTED_ANTHROPIC_MODELS);
};

const isOpenRouterModel = (
  model: SUPPORTED_MODELS,
): model is SUPPORTED_OPENROUTER_MODELS => {
  return OPENROUTER_MODELS.includes(model as SUPPORTED_OPENROUTER_MODELS);
};

// Initialize providers
const getModel = (modelName: SUPPORTED_MODELS, apiKey: string) => {
  // Check if it's a GPT model
  if (isGPTModel(modelName)) {
    const openai = createOpenAI({
      apiKey,
    });
    return openai(modelName);
  }

  // Check if it's a Gemini model
  if (isGeminiModel(modelName)) {
    const google = createGoogleGenerativeAI({
      apiKey,
    });
    return google(modelName);
  }

  // Check if it's an Anthropic model
  if (isAnthropicModel(modelName)) {
    const anthropic = createAnthropic({
      apiKey,
    });
    return anthropic(modelName);
  }

  // Check if it's an OpenRouter model (runs on Cerebras hardware)
  if (isOpenRouterModel(modelName)) {
    const openrouter = createOpenRouter({
      apiKey,
      extraBody: {
        provider: {
          only: ["Cerebras"],
        },
      },
    });
    return openrouter(modelName);
  }

  // If no match, throw an error
  throw new Error(
    `Unsupported model: ${modelName}. Supported models are: ${
      [
        ...GPT_MODELS,
        ...GEMINI_MODELS,
        ...ANTHROPIC_MODELS,
        ...OPENROUTER_MODELS,
      ].join(", ")
    }`,
  );
};

const slangSchema = z.object({
  headword: z.string().nullable(),
  reading: z.string().nullish(),
  pos: z.string().nullish(),
  register: z.enum(["polite", "neutral", "casual", "vulgar"]).nullish(),
  dialect: z.array(z.string()).nullish(),
  tags: z.array(z.string()).nullish(),
  definition_ja: z.string(),
  definition_en: z.string(),
  polite_equiv: z.string().nullish(),
  notes: z.string().nullish(),
  examples: z.array(
    z.object({
      jp: z.string(),
      en: z.string(),
    }),
  ).nullish(),
  explanation: z.string(),
});

/**
 * Generate an explanation for existing slang entries
 */
export async function generateExplanation(
  apiKey: string,
  model: SUPPORTED_MODELS,
  context: SlangContext,
): Promise<string> {
  const modelInstance = getModel(model, apiKey);

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

  try {
    const startTime = performance.now();
    const { text, usage, response } = await generateText({
      model: modelInstance,
      system: SYSTEM_PROMPT,
      prompt: buildExplanationPrompt(context),
      temperature: 0.3, // Changed from 0.1 (better format compliance)
      topP: 0.95, // Slightly higher for better instruction following
      abortSignal: controller.signal, // Added (timeout protection)
    });
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log performance metrics
    console.log(`[Performance] Model: ${model}`);
    // Log provider info from OpenRouter response headers
    const headers = response?.headers as Record<string, string> | undefined;
    if (headers) {
      const provider = headers["x-provider"] || headers["x-served-by"];
      if (provider) {
        console.log(`[Performance] Provider: ${provider}`);
      }
    }
    console.log(
      `[Performance] Duration: ${duration.toFixed(2)}ms (${
        (duration / 1000).toFixed(2)
      }s)`,
    );
    if (usage) {
      // Type assertion needed as AI SDK's usage type doesn't expose these properties
      // but they exist at runtime
      const usageData = usage as unknown as {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
      };
      const promptTokens = usageData.promptTokens ?? 0;
      const completionTokens = usageData.completionTokens ?? 0;
      const totalTokens = usageData.totalTokens ?? 0;
      console.log(`[Performance] Prompt tokens: ${promptTokens}`);
      console.log(`[Performance] Completion tokens: ${completionTokens}`);
      console.log(`[Performance] Total tokens: ${totalTokens}`);
      if (completionTokens > 0) {
        const tokensPerSecond = (completionTokens / (duration / 1000)).toFixed(
          2,
        );
        console.log(`[Performance] Speed: ${tokensPerSecond} tokens/sec`);
      }
    }

    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Analyze a new slang term and extract structured data
 */
export async function analyzeNewSlangTerm(
  apiKey: string,
  model: SUPPORTED_MODELS,
  term: string,
): Promise<SlangData> {
  const modelInstance = getModel(model, apiKey);
  const startTime = performance.now();

  // Define the schema for the slang data

  const { object, usage } = await generateObject({
    model: modelInstance,
    schema: slangSchema,
    system: SYSTEM_PROMPT,
    prompt: buildAnalysisPrompt(term),
    temperature: 0.3,
  });
  const endTime = performance.now();
  const duration = endTime - startTime;

  // Log performance metrics
  console.log(`[Performance] Analysis Model: ${model}`);
  console.log(
    `[Performance] Duration: ${duration.toFixed(2)}ms (${
      (duration / 1000).toFixed(2)
    }s)`,
  );
  if (usage) {
    // Type assertion needed as AI SDK's usage type doesn't expose these properties
    // but they exist at runtime
    const usageData = usage as unknown as {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
    const promptTokens = usageData.promptTokens ?? 0;
    const completionTokens = usageData.completionTokens ?? 0;
    const totalTokens = usageData.totalTokens ?? 0;
    console.log(`[Performance] Prompt tokens: ${promptTokens}`);
    console.log(`[Performance] Completion tokens: ${completionTokens}`);
    console.log(`[Performance] Total tokens: ${totalTokens}`);
    if (completionTokens > 0) {
      const tokensPerSecond = (completionTokens / (duration / 1000)).toFixed(2);
      console.log(`[Performance] Speed: ${tokensPerSecond} tokens/sec`);
    }
  }

  return object;
}

/**
 * Generate grammar analysis for a Japanese sentence
 */
export async function generateGrammarAnalysis(
  apiKey: string,
  model: SUPPORTED_MODELS,
  sentence: string,
): Promise<string> {
  const modelInstance = getModel(model, apiKey);

  // Create abort controller for timeout (8s for grammar analysis)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const startTime = performance.now();
    const { text, usage, response } = await generateText({
      model: modelInstance,
      system: GRAMMAR_SYSTEM_PROMPT,
      prompt: buildGrammarAnalysisPrompt(sentence),
      temperature: 0.2, // Lower temperature for consistent markdown formatting
      topP: 0.95,
      abortSignal: controller.signal,
    });
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log performance metrics
    console.log(`[Grammar Analysis] Model: ${model}`);
    // Log provider info from OpenRouter response headers
    const headers = response?.headers as Record<string, string> | undefined;
    if (headers) {
      const provider = headers["x-provider"] || headers["x-served-by"];
      if (provider) {
        console.log(`[Grammar Analysis] Provider: ${provider}`);
      }
    }
    console.log(
      `[Grammar Analysis] Duration: ${duration.toFixed(2)}ms (${
        (duration / 1000).toFixed(2)
      }s)`,
    );
    if (usage) {
      const usageData = usage as unknown as {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
      };
      const promptTokens = usageData.promptTokens ?? 0;
      const completionTokens = usageData.completionTokens ?? 0;
      const totalTokens = usageData.totalTokens ?? 0;
      console.log(`[Grammar Analysis] Prompt tokens: ${promptTokens}`);
      console.log(`[Grammar Analysis] Completion tokens: ${completionTokens}`);
      console.log(`[Grammar Analysis] Total tokens: ${totalTokens}`);
      if (completionTokens > 0) {
        const tokensPerSecond = (completionTokens / (duration / 1000)).toFixed(
          2,
        );
        console.log(`[Grammar Analysis] Speed: ${tokensPerSecond} tokens/sec`);
      }
    }

    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}
