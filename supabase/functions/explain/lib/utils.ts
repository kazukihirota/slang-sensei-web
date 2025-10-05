// Utility functions

/**
 * Generate a hash from search parameters for caching
 */
export async function generateHash(
  term: string,
  ids: string[],
): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(
      JSON.stringify({ term, ids }),
    ),
  );
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Strip markdown code fences from text
 */
export function stripMarkdownFences(text: string): string {
  if (text.startsWith("```")) {
    return text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  }
  return text;
}

/**
 * Generate a fallback explanation from slang context
 */
export function generateFallbackExplanation(slang: {
  headword: string;
  reading?: string;
  definition_en: string;
  definition_ja: string;
  register: string;
  polite_equiv?: string;
  examples?: string[];
  notes?: string;
}): string {
  return `## ${slang.headword}${slang.reading ? ` (${slang.reading})` : ""}

**Definition:** ${slang.definition_en}

**Japanese:** ${slang.definition_ja}

**Register:** ${slang.register}${
    slang.polite_equiv ? ` (polite form: ${slang.polite_equiv})` : ""
  }

${
    slang.examples && slang.examples.length > 0
      ? `**Examples:**\n${slang.examples.slice(0, 2).join("\n")}`
      : ""
  }

${slang.notes ? `**Notes:** ${slang.notes}` : ""}`;
}
