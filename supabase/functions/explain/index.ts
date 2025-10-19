// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";

// Import modules
import { analyzeNewSlangTerm, generateExplanation } from "./lib/openai.ts";
import {
  cacheExplanation,
  createSlangEntry,
  createSlangExamples,
  getCachedExplanation,
  recordUserSearch,
  searchSlang,
} from "./lib/database.ts";
import { generateFallbackExplanation, generateHash } from "./lib/utils.ts";
import type { SlangContext, SlangData } from "./lib/types.ts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

// Environment variables
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Handle creation of a new slang entry when not found in database
 */
async function handleNewSlangTerm(
  term: string,
  userId: string | null,
): Promise<Response> {
  console.log(`Creating new slang entry for "${term}"`);

  try {
    // Get structured data from OpenAI
    const data: SlangData = await analyzeNewSlangTerm(
      OPENAI_API_KEY,
      OPENAI_MODEL,
      term,
    );

    // Check if it's a valid term
    if (!data.headword || data.headword === null) {
      return new Response(
        `"${term}" is not recognized as a Japanese slang term. Please try another term.`,
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Create the dictionary entry
    const entryId = await createSlangEntry(SUPABASE_URL, SERVICE_ROLE, data);
    console.log("New dictionary entry created with ID:", entryId);
    console.log("Created entry data:", JSON.stringify(data, null, 2));

    // Create examples if provided
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

    // Cache the explanation
    const hash = await generateHash(term, [entryId]);
    await cacheExplanation(
      SUPABASE_URL,
      SERVICE_ROLE,
      entryId,
      hash,
      explanation,
    );

    // Record user search (search count is automatically incremented by database trigger)
    if (userId) {
      await recordUserSearch(
        SUPABASE_URL,
        SERVICE_ROLE,
        userId,
        term,
        entryId,
      );
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
async function handleExistingSlang(
  term: string,
  ctx: SlangContext[],
): Promise<string> {
  let answer = "No answer.";
  let usedOpenAI = false;

  // Try OpenAI if API key is available
  if (
    OPENAI_API_KEY && OPENAI_API_KEY !== "sk-test-dummy-key-for-development"
  ) {
    console.log("Calling OpenAI API with model:", OPENAI_MODEL);

    try {
      answer = await generateExplanation(
        OPENAI_API_KEY,
        OPENAI_MODEL,
        term,
        ctx,
      );
      usedOpenAI = true;
      console.log("OpenAI response received successfully");
    } catch (error) {
      console.error("OpenAI request failed:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      // Fall through to basic explanation
    }
  } else {
    console.log("OpenAI API key not available, using fallback");
  }

  // Generate basic explanation from context if OpenAI unavailable or failed
  if (!usedOpenAI && ctx.length > 0) {
    console.log("Using fallback explanation");
    answer = generateFallbackExplanation(ctx[0]);
  }

  return answer;
}

/**
 * Get authenticated user from Supabase
 */
async function getAuthenticatedUser(
  req: Request,
): Promise<{ id: string; email?: string } | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with the user's JWT token
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get the authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Failed to get authenticated user:", error);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error("Failed to authenticate user:", error);
    return null;
  }
}

/**
 * Main request handler
 */
export const handler = async (req: Request): Promise<Response> => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request
    const { term } = await req.json();
    if (!term || typeof term !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'term'" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    const userId = user?.id || null;

    // 1) Search for slang entries
    try {
      const ctx = await searchSlang(SUPABASE_URL, SERVICE_ROLE, term, 3);
      console.log(`Search results for "${term}":`, ctx.length, "entries found");

      // If no results found, try to create a new entry using OpenAI
      if (!ctx || ctx.length === 0) {
        console.log("No results found, checking OpenAI API key...");
        console.log("OPENAI_API_KEY exists:", !!OPENAI_API_KEY);
        console.log(
          "OPENAI_API_KEY starts with sk-proj:",
          OPENAI_API_KEY?.startsWith("sk-proj-"),
        );

        if (
          !OPENAI_API_KEY ||
          OPENAI_API_KEY === "sk-test-dummy-key-for-development"
        ) {
          console.log("OpenAI API key not available, returning 404");
          return new Response(
            `No slang entry found for "${term}". Try searching for popular terms like "草", "やばい", or "エモい".`,
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "text/plain" },
            },
          );
        }

        console.log("OpenAI API key available, creating new slang term");
        return await handleNewSlangTerm(term, userId);
      }

      // 2) Check cache
      const hash = await generateHash(
        term,
        ctx.map((c) => c.id),
      );

      const cachedAnswer = await getCachedExplanation(
        SUPABASE_URL,
        SERVICE_ROLE,
        hash,
      );

      if (cachedAnswer) {
        console.log("Returning cached answer");

        // Record user search even for cached results
        if (userId) {
          const entryId = ctx.length > 0 ? ctx[0].id : null;
          await recordUserSearch(
            SUPABASE_URL,
            SERVICE_ROLE,
            userId,
            term,
            entryId,
          );
        }

        return new Response(cachedAnswer, {
          headers: { ...corsHeaders, "Content-Type": "text/markdown" },
        });
      }

      // 3) Generate explanation
      const answer = await handleExistingSlang(term, ctx);

      // 4) Cache the explanation
      const entryId = ctx.length > 0 ? ctx[0].id : null;
      await cacheExplanation(
        SUPABASE_URL,
        SERVICE_ROLE,
        entryId,
        hash,
        answer,
      );

      // 5) Record user search (search count is automatically incremented by database trigger)
      if (userId) {
        await recordUserSearch(
          SUPABASE_URL,
          SERVICE_ROLE,
          userId,
          term,
          entryId,
        );
      }

      return new Response(answer, {
        headers: { ...corsHeaders, "Content-Type": "text/markdown" },
      });
    } catch (error) {
      console.error("Request failed:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error) {
    console.error("Request failed:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

Deno.serve(handler);
