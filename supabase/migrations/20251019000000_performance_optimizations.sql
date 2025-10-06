-- Migration: Performance Optimizations for Search
-- Created: 2025-10-19
-- Description: Adds trigram indexes and optimizes search functions for faster query performance

-- Enable pg_trgm extension for trigram-based text search
create extension if not exists pg_trgm;

-- ============================================================================
-- Add Trigram Indexes for Fast ILIKE Searches
-- ============================================================================

-- Trigram indexes for fast pattern matching on dictionary entries
create index if not exists idx_dictionary_entries_headword_trgm 
  on dictionary_entries using gin (headword gin_trgm_ops);

create index if not exists idx_dictionary_entries_reading_trgm 
  on dictionary_entries using gin (reading gin_trgm_ops);

create index if not exists idx_dictionary_entries_definition_ja_trgm 
  on dictionary_entries using gin (definition_ja gin_trgm_ops);

create index if not exists idx_dictionary_entries_definition_en_trgm 
  on dictionary_entries using gin (definition_en gin_trgm_ops);

-- Composite index for filtering by entry_type and popularity
create index if not exists idx_dictionary_entries_type_popularity 
  on dictionary_entries(entry_type, popularity desc);

-- Composite index for exact headword matches (most common case)
create index if not exists idx_dictionary_entries_headword_type 
  on dictionary_entries(headword, entry_type);

-- Index for search_term lookups
create index if not exists idx_search_history_search_term 
  on search_history(search_term);

-- Composite index for user search history queries
create index if not exists idx_search_history_user_created 
  on search_history(user_id, created_at desc);

-- ============================================================================
-- Optimize Search Function
-- ============================================================================

-- Drop and recreate the hybrid search function with optimizations
drop function if exists hybrid_dictionary_search(text, int, text[]);

create or replace function hybrid_dictionary_search(q text, k int default 5, entry_types text[] default array['slang','dictionary','both'])
returns table (
  id uuid,
  headword text,
  reading text,
  pos text,
  register text,
  dialect text[],
  tags text[],
  definition_ja text,
  definition_en text,
  polite_equiv text,
  notes text,
  popularity int,
  entry_type text,
  examples text[]
)
language plpgsql
as $$
begin
  return query
  with matched_entries as (
    select 
      de.id,
      de.headword,
      de.reading,
      de.pos,
      de.register,
      de.dialect,
      de.tags,
      de.definition_ja,
      de.definition_en,
      de.polite_equiv,
      de.notes,
      de.popularity,
      de.entry_type,
      -- Calculate match score for better ranking
      case 
        when de.headword = q then 100
        when de.headword ilike q || '%' then 90
        when de.reading = q then 85
        when de.reading ilike q || '%' then 80
        when de.headword ilike '%' || q || '%' then 70
        when de.reading ilike '%' || q || '%' then 60
        when de.definition_en ilike '%' || q || '%' then 50
        when de.definition_ja ilike '%' || q || '%' then 40
        else 0
      end as match_score
    from dictionary_entries de
    where 
      de.entry_type = any(entry_types)
      and (
        de.headword ilike '%' || q || '%'
        or de.reading ilike '%' || q || '%'
        or de.definition_en ilike '%' || q || '%'
        or de.definition_ja ilike '%' || q || '%'
      )
  )
  select 
    me.id,
    me.headword,
    me.reading,
    me.pos,
    me.register,
    me.dialect,
    me.tags,
    me.definition_ja,
    me.definition_en,
    me.polite_equiv,
    me.notes,
    me.popularity,
    me.entry_type,
    coalesce(
      array_agg(dx.jp || ' | ' || dx.en) filter (where dx.jp is not null),
      array[]::text[]
    ) as examples
  from matched_entries me
  left join dictionary_examples dx on me.id = dx.entry_id
  group by me.id, me.headword, me.reading, me.pos, me.register, me.dialect, me.tags, 
           me.definition_ja, me.definition_en, me.polite_equiv, me.notes, me.popularity,
           me.entry_type, me.match_score
  order by 
    me.match_score desc,
    case when me.entry_type = 'slang' then 1 else 2 end,
    me.popularity desc,
    me.headword
  limit k;
end;
$$;

-- Add comment to document the optimization
comment on function hybrid_dictionary_search(text, int, text[]) is 
  'Optimized hybrid search using trigram indexes for fast ILIKE pattern matching. 
   Includes smart match scoring for better ranking of results.';

