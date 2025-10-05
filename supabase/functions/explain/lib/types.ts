// Type definitions for the explain function

export interface SlangContext {
  id: string;
  headword: string;
  reading?: string;
  pos: string;
  register: string;
  dialect?: string[];
  tags?: string[];
  definition_ja: string;
  definition_en: string;
  polite_equiv?: string;
  notes?: string;
  popularity: number;
  examples?: string[];
}

export interface SlangData {
  headword: string | null;
  reading?: string;
  pos?: string;
  register?: "polite" | "neutral" | "casual" | "vulgar";
  definition_ja: string;
  definition_en: string;
  polite_equiv?: string;
  notes?: string;
  examples?: Array<{ jp: string; en: string }>;
  explanation: string;
}

export interface CreateSlangRequest {
  term: string;
  data: SlangData;
}
