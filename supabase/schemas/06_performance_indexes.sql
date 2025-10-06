-- Performance optimization indexes for text search
-- These indexes significantly improve ILIKE pattern matching performance

-- Enable pg_trgm extension for trigram-based text search
-- Trigrams allow fast similarity searches and pattern matching
create extension if not exists pg_trgm;

-- Trigram indexes for fast ILIKE searches on dictionary entries
-- These indexes support both '%term%' and 'term%' ILIKE patterns
create index if not exists idx_dictionary_entries_headword_trgm 
  on dictionary_entries using gin (headword gin_trgm_ops);

create index if not exists idx_dictionary_entries_reading_trgm 
  on dictionary_entries using gin (reading gin_trgm_ops);

create index if not exists idx_dictionary_entries_definition_ja_trgm 
  on dictionary_entries using gin (definition_ja gin_trgm_ops);

create index if not exists idx_dictionary_entries_definition_en_trgm 
  on dictionary_entries using gin (definition_en gin_trgm_ops);

-- Composite index for filtering by entry_type and popularity
-- This speeds up the ORDER BY in search functions
create index if not exists idx_dictionary_entries_type_popularity 
  on dictionary_entries(entry_type, popularity desc);

-- Composite index for exact headword matches (most common case)
create index if not exists idx_dictionary_entries_headword_type 
  on dictionary_entries(headword, entry_type);

-- Index for search_term lookups (useful for analytics)
create index if not exists idx_search_history_search_term 
  on search_history(search_term);

-- Composite index for user search history queries
create index if not exists idx_search_history_user_created 
  on search_history(user_id, created_at desc);

