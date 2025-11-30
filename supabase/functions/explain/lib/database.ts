// Database operations

import type { AnalysisType, SlangContext, SlangData } from "./types.ts";

/**
 * Search for dictionary entries in the database
 */
export async function searchSlang(
  supabaseUrl: string,
  serviceRole: string,
  term: string,
  limit: number = 3,
): Promise<SlangContext[]> {
  console.log(`Searching for term: "${term}" with limit: ${limit}`);
  console.log(`Supabase URL: ${supabaseUrl}`);

  const res = await fetch(
    `${supabaseUrl}/rest/v1/rpc/hybrid_dictionary_search`,
    {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: term,
        k: limit,
        entry_types: ["slang", "both"],
      }),
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Search failed with status ${res.status}:`, errorText);
    throw new Error(
      `Failed to fetch dictionary context: ${res.status} ${errorText}`,
    );
  }

  const result = await res.json();
  console.log(`Search returned ${result.length} results`);
  return result;
}

/**
 * Check if an explanation is cached
 */
export async function getCachedExplanation(
  supabaseUrl: string,
  serviceRole: string,
  hash: string,
  analysisType: AnalysisType = "slang",
): Promise<string | null> {
  const cacheRes = await fetch(
    `${supabaseUrl}/rest/v1/explanation_cache?hash=eq.${hash}&analysis_type=eq.${analysisType}&select=answer_md`,
    {
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
      },
    },
  );

  if (cacheRes.ok) {
    const cached = await cacheRes.json();
    if (cached[0]?.answer_md) {
      return cached[0].answer_md;
    }
  }

  return null;
}

/**
 * Create a new dictionary entry in the database
 */
export async function createSlangEntry(
  supabaseUrl: string,
  serviceRole: string,
  data: SlangData,
): Promise<string> {
  const newEntryRes = await fetch(`${supabaseUrl}/rest/v1/dictionary_entries`, {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      headword: data.headword,
      reading: data.reading,
      pos: data.pos,
      register: data.register || "casual",
      definition_ja: data.definition_ja,
      definition_en: data.definition_en,
      polite_equiv: data.polite_equiv,
      notes: data.notes,
      popularity: 1,
      entry_type: "slang",
      tags: ["user-submitted"],
    }),
  });

  if (!newEntryRes.ok) {
    const errorText = await newEntryRes.text();
    console.error("Failed to create dictionary entry:", errorText);
    throw new Error("Failed to create dictionary entry");
  }

  const [newEntry] = await newEntryRes.json();
  return newEntry.id;
}

/**
 * Create example sentences for a dictionary entry
 */
export async function createSlangExamples(
  supabaseUrl: string,
  serviceRole: string,
  entryId: string,
  examples: Array<{ jp: string; en: string }>,
): Promise<void> {
  for (const example of examples) {
    if (example.jp && example.en) {
      await fetch(`${supabaseUrl}/rest/v1/dictionary_examples`, {
        method: "POST",
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entry_id: entryId,
          jp: example.jp,
          en: example.en,
          source: "ai_generated",
        }),
      });
    }
  }
}

/**
 * Cache an explanation
 */
export async function cacheExplanation(
  supabaseUrl: string,
  serviceRole: string,
  entryId: string | null,
  hash: string,
  explanation: string,
  analysisType: AnalysisType = "slang",
): Promise<void> {
  await fetch(`${supabaseUrl}/rest/v1/explanation_cache`, {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      entry_id: entryId,
      hash,
      answer_md: explanation,
      analysis_type: analysisType,
    }),
  });
}

/**
 * Record a user's search in search_history
 */
export async function recordUserSearch(
  supabaseUrl: string,
  serviceRole: string,
  userId: string,
  searchTerm: string,
  entryId: string | null,
  searchType: AnalysisType = "slang",
): Promise<void> {
  try {
    await fetch(`${supabaseUrl}/rest/v1/search_history`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        search_term: searchTerm,
        entry_id: entryId,
        search_type: searchType,
      }),
    });
  } catch (error) {
    // Log but don't fail the request if search recording fails
    console.error("Failed to record search:", error);
  }
}

/**
 * Increment the popularity count for a dictionary entry
 */
export async function incrementSlangPopularity(
  supabaseUrl: string,
  serviceRole: string,
  entryId: string,
): Promise<void> {
  try {
    // Use RPC to increment atomically
    await fetch(`${supabaseUrl}/rest/v1/rpc/increment_entry_popularity`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entry_id_param: entryId,
      }),
    });
  } catch (error) {
    // Log but don't fail the request if popularity update fails
    console.error("Failed to increment popularity:", error);
  }
}
