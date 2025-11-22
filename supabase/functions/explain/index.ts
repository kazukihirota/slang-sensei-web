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
import { generateHash } from "./lib/utils.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  DEFAULT_MODEL,
  GOOGLE_GENERATIVE_AI_API_KEY,
  OPENAI_API_KEY,
  SERVICE_ROLE,
  SUPABASE_URL,
} from "./lib/config.ts";
import { getAuthenticatedUser } from "./lib/auth.ts";
import { handleExistingSlang, handleNewSlangTerm } from "./lib/handlers.ts";

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

    // Always use the default model
    const model = DEFAULT_MODEL;

    // 1) Search for slang entries and get user in parallel
    try {
      const [ctx, user] = await Promise.all([
        searchSlang(SUPABASE_URL, SERVICE_ROLE, term, 3),
        getAuthenticatedUser(req),
      ]);

      const userId = user?.id || null;
      console.log(`Search results for "${term}":`, ctx.length, "entries found");

      const apiKey = model.toLowerCase().startsWith("gemini")
        ? GOOGLE_GENERATIVE_AI_API_KEY
        : OPENAI_API_KEY;

      if (
        !apiKey ||
        apiKey === "sk-test-dummy-key-for-development"
      ) {
        console.log("API key not available, returning 404");
        // If we have context but no API key, we can still return a basic explanation
        // But if no context, we can't do anything
        if (!ctx || ctx.length === 0) {
          return new Response(
            `No slang entry found for "${term}". Try searching for popular terms like "草", "やばい", or "エモい".`,
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "text/plain" },
            },
          );
        }
      }

      // If no results found, try to create a new entry using AI
      if (!ctx || ctx.length === 0) {
        console.log("No results found, creating new slang term");
        return await handleNewSlangTerm(term, userId, model, apiKey);
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
      const entryId = ctx.length > 0 ? ctx[0].id : null;
      const answer = await handleExistingSlang(ctx, model, apiKey);

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
