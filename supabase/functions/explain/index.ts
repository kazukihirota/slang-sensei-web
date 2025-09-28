// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { OpenAI } from "npm:openai@4.8.0";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type ChatCompletionsClient = Pick<OpenAI, "chat">;

let openAIClient: ChatCompletionsClient | undefined;
const getOpenAIClient = () => {
  if (!openAIClient) {
    openAIClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return openAIClient;
};

export const __test = {
  setOpenAIClient(client: ChatCompletionsClient) {
    openAIClient = client;
  },
  resetOpenAIClient() {
    openAIClient = undefined;
  },
};

export const handler = async (req: Request) => {
  const { term, proficiency = "B1" } = await req.json();
  if (!term || typeof term !== "string") {
    return new Response("Missing 'term'", { status: 400 });
  }

  // 1) lookup slang + neighbors (SQL RPC: hybrid search)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/hybrid_slang_search`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: term, k: 3 }),
  });

  if (!res.ok) {
    return new Response("Failed to fetch slang context", { status: 502 });
  }

  const ctx = await res.json();

  // 2) cache check
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(
      JSON.stringify({ term, proficiency, ids: ctx.map((c: any) => c.id) }),
    ),
  );
  const hashHex = Array.from(new Uint8Array(hash)).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");

  const cacheRes = await fetch(
    `${SUPABASE_URL}/rest/v1/explanation_cache?hash=eq.${hashHex}&select=answer_md`,
    {
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
      },
    },
  );

  if (cacheRes.ok) {
    const cached = await cacheRes.json();
    if (cached[0]?.answer_md) {
      return new Response(cached[0].answer_md, {
        headers: { "Content-Type": "text/markdown" },
      });
    }
  }

  // 3) Generate explanation from context (fallback when OpenAI is unavailable)
  let answer = "No answer.";

  if (
    OPENAI_API_KEY && OPENAI_API_KEY !== "sk-test-dummy-key-for-development"
  ) {
    // Use OpenAI if valid key is available
    const prompt = [
      {
        role: "system" as const,
        content:
          "You are a concise Japanese slang tutor. Keep total under 120 words. JP+EN, register notes.",
      },
      {
        role: "user" as const,
        content: `Proficiency: ${proficiency}\nContext:\n${
          ctx.map((c: any) =>
            `- ${c.headword}: ${c.definition_en} / ${c.definition_ja}\nExamples: ${
              c.examples?.slice(0, 2).join(" | ")
            }`
          ).join("\n")
        }\nTask: 1) meaning+nuance, 2) 2 JP examples + EN gloss, 3) polite alt if casual/vulgar.`,
      },
    ];

    try {
      const completion = await getOpenAIClient().chat.completions.create({
        model: OPENAI_MODEL,
        messages: prompt,
        max_tokens: 220,
        temperature: 0.5,
      });
      answer = completion.choices?.[0]?.message?.content?.trim() ?? answer;
    } catch (error) {
      console.error("OpenAI request failed", error);
      // Fall through to basic explanation
    }
  }

  // Generate basic explanation from context if OpenAI unavailable
  if (answer === "No answer." && ctx.length > 0) {
    const first = ctx[0];
    answer = `## ${first.headword}${first.reading ? ` (${first.reading})` : ""}

**Definition:** ${first.definition_en}

**Japanese:** ${first.definition_ja}

**Register:** ${first.register}${
      first.polite_equiv ? ` (polite form: ${first.polite_equiv})` : ""
    }

${
      first.examples && first.examples.length > 0
        ? `**Examples:**\n${first.examples.slice(0, 2).join("\n")}`
        : ""
    }

${first.notes ? `**Notes:** ${first.notes}` : ""}`;
  }

  // 4) write cache
  await fetch(`${SUPABASE_URL}/rest/v1/explanation_cache`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ hash: hashHex, answer_md: answer }),
  });

  return new Response(answer, { headers: { "Content-Type": "text/markdown" } });
};

Deno.serve(handler);
