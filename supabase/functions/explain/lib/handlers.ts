import { corsHeaders } from "../../_shared/cors.ts";
import { analyzeNewSlangTerm, generateExplanation } from "./ai.ts";
import {
  cacheExplanation,
  createSlangEntry,
  createSlangExamples,
  recordUserSearch,
} from "./database.ts";
import { generateFallbackExplanation, generateHash } from "./utils.ts";
import type { SlangContext, SlangData } from "./types.ts";
import { SERVICE_ROLE, SUPABASE_URL, SUPPORTED_MODELS } from "./config.ts";

/**
 * Handle creation of a new slang entry when not found in database
 */
export async function handleNewSlangTerm(
  term: string,
  userId: string | null,
  model: SUPPORTED_MODELS,
  apiKey: string,
): Promise<Response> {
  console.log(`Creating new slang entry for "${term}"`);

  try {
    const data: SlangData = await analyzeNewSlangTerm(
      apiKey,
      model,
      term,
    );

    if (!data.headword || data.headword === null) {
      return new Response(
        `"${term}" is not recognized as a Japanese slang term. Please try another term.`,
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    const entryId = await createSlangEntry(SUPABASE_URL, SERVICE_ROLE, data);
    console.log("New dictionary entry created with ID:", entryId);
    if (
      data.examples && Array.isArray(data.examples) && data.examples.length > 0
    ) {
      await createSlangExamples(
        SUPABASE_URL,
        SERVICE_ROLE,
        entryId,
        data.examples,
      );
    }

    // Use the explanation from the first OpenAI call (no need for a second call)
    const explanation = data.explanation;
    console.log(
      "Using explanation from analysis (single API call):",
      explanation.substring(0, 50) + "...",
    );

    // Cache the explanation (fire-and-forget)
    const hash = await generateHash(term, [entryId]);
    cacheExplanation(
      SUPABASE_URL,
      SERVICE_ROLE,
      entryId,
      hash,
      explanation,
    ).catch((error) => console.error("Failed to cache explanation:", error));

    // Record user search (fire-and-forget)
    if (userId) {
      recordUserSearch(
        SUPABASE_URL,
        SERVICE_ROLE,
        userId,
        term,
        entryId,
      ).catch((error) => console.error("Failed to record search:", error));
    }

    return new Response(explanation, {
      headers: { ...corsHeaders, "Content-Type": "text/markdown" },
    });
  } catch (error) {
    console.error("Failed to create new slang entry:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    return new Response(
      `Unable to process "${term}". Please try again or search for an existing term.`,
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      },
    );
  }
}

/**
 * Generate explanation for existing slang entries
 */
export async function handleExistingSlang(
  ctx: SlangContext,
  model: SUPPORTED_MODELS,
  apiKey: string,
): Promise<string> {
  try {
    return await generateExplanation(
      apiKey,
      model,
      ctx,
    );
  } catch (error) {
    console.error("Error message:", error);
    return generateFallbackExplanation(ctx);
  }
}
