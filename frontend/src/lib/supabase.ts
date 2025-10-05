import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

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

export interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    proficiency_level: string;
    total_searches: number;
    created_at: string;
    updated_at: string;
}

export interface SearchHistory {
    id: string;
    user_id: string;
    entry_id: string | null;
    search_term: string;
    created_at: string;
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
        body: JSON.stringify({ term }),
    });

    if (!response.ok) {
        throw new Error(`Failed to get explanation: ${response.statusText}`);
    }

    return await response.text();
}

// Get user profile
export async function getUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }

    return data;
}

// Update user profile
export async function updateUserProfile(
    updates: Partial<Pick<UserProfile, "full_name" | "proficiency_level">>,
): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", user.id);

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

// Save search to history
export async function saveSearchHistory(
    searchTerm: string,
    entryId?: string,
): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from("search_history")
        .insert({
            user_id: user.id,
            search_term: searchTerm,
            entry_id: entryId || null,
        });

    if (error) {
        console.error("Error saving search history:", error);
    }
}
