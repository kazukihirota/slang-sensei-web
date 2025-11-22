// Type definitions for the explain function

export interface SlangContext {
  id: string;
  headword: string;
  reading?: string;
  pos?: string;
  register: string;
  dialect?: string[];
  tags?: string[];
  definition_ja: string;
  definition_en: string;
  polite_equiv?: string;
  notes?: string;
  popularity: number;
  entry_type: string;
  created_at: string;
  examples?: string[];
}

export interface SlangData {
  headword: string | null;
  reading?: string | null;
  pos?: string | null;
  register?: "polite" | "neutral" | "casual" | "vulgar" | null;
  dialect?: string[] | null;
  tags?: string[] | null;
  definition_ja: string;
  definition_en: string;
  polite_equiv?: string | null;
  notes?: string | null;
  examples?: Array<{ jp: string; en: string }> | null;
  explanation: string;
}

export interface CreateSlangRequest {
  term: string;
  data: SlangData;
}

export type Language = "Japanese" | "English";
