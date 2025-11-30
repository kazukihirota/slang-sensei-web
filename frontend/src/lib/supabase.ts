import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our slang data
export interface SlangEntry {
    id: string;
    headword: string;
    reading?: string;
    pos?: string;
    register: "polite" | "neutral" | "casual" | "vulgar";
    dialect?: string[];
    tags?: string[];
    definition_ja: string;
    definition_en: string;
    polite_equiv?: string;
    notes?: string;
    popularity: number;
    created_at: string;
}

export interface SlangExample {
    id: string;
    slang_id: string;
    jp: string;
    en: string;
    source?: string;
    created_at: string;
}

// User profile is now just the auth user data
export type UserProfile = {
    id: string;
    email: string | null;
    full_name?: string | undefined;
    avatar_url?: string | undefined;
    created_at: string;
    updated_at: string;
};

export interface SearchHistory {
    id: string;
    user_id: string;
    entry_id: string | null;
    search_term: string;
    created_at: string;
}

export interface GrammarHistory {
    id: string;
    user_id: string;
    search_term: string;
    created_at: string;
}

export interface LocalGrammarHistory {
    sentence: string;
    timestamp: number;
}

// Cache management for optimistic UI
const CACHE_KEY_PREFIX = "slang_cache_";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedExplanation {
    term: string;
    explanation: string;
    timestamp: number;
}

export function getCachedExplanation(term: string): string | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY_PREFIX + term);
        if (!cached) return null;

        const data: CachedExplanation = JSON.parse(cached);

        // Check if cache is still valid
        if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
            localStorage.removeItem(CACHE_KEY_PREFIX + term);
            return null;
        }

        return data.explanation;
    } catch {
        return null;
    }
}

export function setCachedExplanation(term: string, explanation: string): void {
    try {
        const data: CachedExplanation = {
            term,
            explanation,
            timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY_PREFIX + term, JSON.stringify(data));
    } catch (error) {
        // Silently fail if localStorage is full or unavailable
        console.warn("Failed to cache explanation:", error);
    }
}

export function clearExpiredCache(): void {
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_KEY_PREFIX)) {
                const cached = localStorage.getItem(key);
                if (cached) {
                    const data: CachedExplanation = JSON.parse(cached);
                    if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
                        keysToRemove.push(key);
                    }
                }
            }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
        // Silently fail
    }
}

// Local search history for unauthenticated users
const LOCAL_HISTORY_KEY = "slang_local_history";
const MAX_LOCAL_HISTORY = 10;

// Grammar analysis local storage keys
const LOCAL_GRAMMAR_HISTORY_KEY = 'grammar_local_history';
const GRAMMAR_CACHE_KEY_PREFIX = 'grammar_cache_';
const MAX_LOCAL_GRAMMAR_HISTORY = 10;

export interface LocalSearchHistory {
    term: string;
    timestamp: number;
}

export function getLocalSearchHistory(): LocalSearchHistory[] {
    try {
        const history = localStorage.getItem(LOCAL_HISTORY_KEY);
        if (!history) return [];
        return JSON.parse(history);
    } catch {
        return [];
    }
}

export function addToLocalSearchHistory(term: string): void {
    try {
        const history = getLocalSearchHistory();
        // Remove duplicate if exists
        const filtered = history.filter((item) => item.term !== term);
        // Add new term at the beginning
        const updated = [{ term, timestamp: Date.now() }, ...filtered].slice(
            0,
            MAX_LOCAL_HISTORY,
        );
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
        console.warn("Failed to save to local history:", error);
    }
}

export function clearLocalSearchHistory(): void {
    try {
        localStorage.removeItem(LOCAL_HISTORY_KEY);
    } catch {
        // Silently fail
    }
}

// API function to get explanation from our Edge function
export async function getSlangExplanation(
    term: string,
): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error("Please sign in to get explanations");
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/explain`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ term, stream: false }),
    });

    if (!response.ok) {
        throw new Error(`Failed to get explanation: ${response.statusText}`);
    }

    return await response.text();
}

// API function to get explanation with streaming
export async function getSlangExplanationStream(
    term: string,
    onChunk: (chunk: string) => void,
): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();

    // Build headers - include auth token if available
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/explain`, {
        method: "POST",
        headers,
        body: JSON.stringify({ term, stream: true }),
    });

    if (!response.ok) {
        throw new Error(`Failed to get explanation: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }
    } finally {
        reader.releaseLock();
    }
}

// Get user profile (now just returns auth user data)
export async function getUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return {
        id: user.id,
        email: user.email ?? null,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
    };
}

// Update user profile (updates auth user metadata)
export async function updateUserProfile(
    updates: Partial<Pick<UserProfile, "full_name">>,
): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.auth.updateUser({
        data: {
            full_name: updates.full_name,
        },
    });

    if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
    }
}

// Get user's search history
export async function getSearchHistory(
    limit: number = 20,
): Promise<SearchHistory[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("search_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching search history:", error);
        return [];
    }

    return data || [];
}

// Grammar analysis localStorage functions
export function getLocalGrammarHistory(): LocalGrammarHistory[] {
    try {
        const history = localStorage.getItem(LOCAL_GRAMMAR_HISTORY_KEY);
        if (!history) return [];
        return JSON.parse(history);
    } catch {
        return [];
    }
}

export function addToLocalGrammarHistory(sentence: string): void {
    try {
        const history = getLocalGrammarHistory();
        const filtered = history.filter((item) => item.sentence !== sentence);
        const updated = [
            { sentence, timestamp: Date.now() },
            ...filtered
        ].slice(0, MAX_LOCAL_GRAMMAR_HISTORY);
        localStorage.setItem(LOCAL_GRAMMAR_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
        console.warn('Failed to save to local grammar history:', error);
    }
}

export function getCachedGrammarAnalysis(sentence: string): string | null {
    try {
        const cached = localStorage.getItem(GRAMMAR_CACHE_KEY_PREFIX + sentence);
        if (!cached) return null;

        const data: CachedExplanation = JSON.parse(cached);

        if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
            localStorage.removeItem(GRAMMAR_CACHE_KEY_PREFIX + sentence);
            return null;
        }

        return data.explanation;
    } catch {
        return null;
    }
}

export function setCachedGrammarAnalysis(sentence: string, analysis: string): void {
    try {
        const data: CachedExplanation = {
            term: sentence,
            explanation: analysis,
            timestamp: Date.now(),
        };
        localStorage.setItem(GRAMMAR_CACHE_KEY_PREFIX + sentence, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to cache grammar analysis:', error);
    }
}

// Grammar analysis API function
export async function getGrammarAnalysis(sentence: string): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/explain`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sentence, type: 'grammar' }),
    });

    if (!response.ok) {
        throw new Error(`Failed to analyze grammar: ${response.statusText}`);
    }

    return await response.text();
}

// Get grammar history from database
export async function getGrammarHistory(limit: number = 20): Promise<GrammarHistory[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('search_type', 'grammar')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching grammar history:', error);
        return [];
    }

    return data || [];
}
