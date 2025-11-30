// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";

// Import modules
import {
  cacheExplanation,
  getCachedExplanation,
  recordUserSearch,
  searchSlang,
} from "./lib/database.ts";
import { generateHash, resolveApiKey } from "./lib/utils.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { DEFAULT_MODEL, SERVICE_ROLE, SUPABASE_URL } from "./lib/config.ts";
import { getAuthenticatedUser } from "./lib/auth.ts";
import { handleExistingSlang, handleGrammarAnalysis, handleNewSlangTerm } from "./lib/handlers.ts";

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
    const body = await req.json();
    const { term, sentence, type = 'slang' } = body;

    // Determine input text based on type
    const inputText = type === 'grammar' ? sentence : term;

    if (!inputText || typeof inputText !== "string") {
      return new Response(
        JSON.stringify({ error: 'Missing required input' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Always use the default model
    const model = DEFAULT_MODEL;
    const apiKey = resolveApiKey(model);

    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    const userId = user?.id || null;

    // Route to grammar analysis if type is 'grammar'
    if (type === 'grammar') {
      return await handleGrammarAnalysis(sentence, userId, model, apiKey);
    }

    // 1) Search for slang entries
    try {
      const ctx = await searchSlang(SUPABASE_URL, SERVICE_ROLE, term, 1);

      console.log(`Search results for "${term}":`, ctx.length, "entries found");

      if (!ctx || ctx.length === 0) {
        console.log("No results found, creating new slang term");
        return await handleNewSlangTerm(term, userId, model, apiKey);
      }

      // 2) Check cache
      const hash = await generateHash(
        term,
        [ctx[0].id],
      );

      const cachedAnswer = await getCachedExplanation(
        SUPABASE_URL,
        SERVICE_ROLE,
        hash,
      );

      if (cachedAnswer) {
        console.log("Returning cached answer");

        // Record user search even for cached results (fire-and-forget)
        if (userId) {
          const entryId = ctx.length > 0 ? ctx[0].id : null;
          recordUserSearch(
            SUPABASE_URL,
            SERVICE_ROLE,
            userId,
            term,
            entryId,
          ).catch((error) => console.error("Failed to record search:", error));
        }

        return new Response(cachedAnswer, {
          headers: { ...corsHeaders, "Content-Type": "text/markdown" },
        });
      }

      // 3) Generate explanation
      const entryId = ctx[0].id;
      const answer = await handleExistingSlang(ctx[0], model, apiKey);

      // Cache and record (fire-and-forget)
      cacheExplanation(
        SUPABASE_URL,
        SERVICE_ROLE,
        entryId,
        hash,
        answer,
      ).catch((error: unknown) =>
        console.error("Failed to cache explanation:", error)
      );

      if (userId) {
        recordUserSearch(
          SUPABASE_URL,
          SERVICE_ROLE,
          userId,
          term,
          entryId,
        ).catch((error) => console.error("Failed to record search:", error));
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
