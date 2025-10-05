-- Functions, Triggers, and RLS Policies

-- ============================================================================
-- Functions
-- ============================================================================

-- Create hybrid search RPC function for dictionary lookup (slang + regular words)
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
    coalesce(
      array_agg(dx.jp || ' | ' || dx.en) filter (where dx.jp is not null),
      array[]::text[]
    ) as examples
  from dictionary_entries de
  left join dictionary_examples dx on de.id = dx.entry_id
  where 
    de.entry_type = any(entry_types)
    and (
      de.headword ilike '%' || q || '%'
      or de.reading ilike '%' || q || '%'
      or de.definition_en ilike '%' || q || '%'
      or de.definition_ja ilike '%' || q || '%'
    )
  group by de.id, de.headword, de.reading, de.pos, de.register, de.dialect, de.tags, 
           de.definition_ja, de.definition_en, de.polite_equiv, de.notes, de.popularity,
           de.entry_type
  order by 
    case when de.headword = q then 1 else 2 end,
    case when de.entry_type = 'slang' then 1 else 2 end,
    de.popularity desc,
    de.headword
  limit k;
end;
$$;

-- Create function to search only slang terms
create or replace function search_slang_only(q text, k int default 5)
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
  examples text[]
)
language plpgsql
as $$
begin
  return query
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
    coalesce(
      array_agg(dx.jp || ' | ' || dx.en) filter (where dx.jp is not null),
      array[]::text[]
    ) as examples
  from dictionary_entries de
  left join dictionary_examples dx on de.id = dx.entry_id
  where 
    de.entry_type in ('slang', 'both')
    and (
      de.headword ilike '%' || q || '%'
      or de.reading ilike '%' || q || '%'
      or de.definition_en ilike '%' || q || '%'
      or de.definition_ja ilike '%' || q || '%'
    )
  group by de.id, de.headword, de.reading, de.pos, de.register, de.dialect, de.tags, 
           de.definition_ja, de.definition_en, de.polite_equiv, de.notes, de.popularity
  order by 
    case when de.headword = q then 1 else 2 end,
    de.popularity desc,
    de.headword
  limit k;
end;
$$;

-- Create function to search only dictionary terms
create or replace function search_dictionary_only(q text, k int default 5)
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
  examples text[]
)
language plpgsql
as $$
begin
  return query
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
    coalesce(
      array_agg(dx.jp || ' | ' || dx.en) filter (where dx.jp is not null),
      array[]::text[]
    ) as examples
  from dictionary_entries de
  left join dictionary_examples dx on de.id = dx.entry_id
  where 
    de.entry_type in ('dictionary', 'both')
    and (
      de.headword ilike '%' || q || '%'
      or de.reading ilike '%' || q || '%'
      or de.definition_en ilike '%' || q || '%'
      or de.definition_ja ilike '%' || q || '%'
    )
  group by de.id, de.headword, de.reading, de.pos, de.register, de.dialect, de.tags, 
           de.definition_ja, de.definition_en, de.polite_equiv, de.notes, de.popularity
  order by 
    case when de.headword = q then 1 else 2 end,
    de.popularity desc,
    de.headword
  limit k;
end;
$$;

-- Function to increment dictionary entry popularity
-- This uses atomic increment to handle concurrent searches safely
create or replace function increment_entry_popularity(entry_id_param uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update dictionary_entries
  set popularity = popularity + 1
  where id = entry_id_param;
end;
$$;

-- Function to update updated_at timestamp
create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
alter table search_history enable row level security;

-- Search history: Users can view their own search history
create policy "Users can view own search history"
  on search_history for select
  using (auth.uid() = user_id);

-- Search history: Users can insert their own searches
create policy "Users can insert own searches"
  on search_history for insert
  with check (auth.uid() = user_id);

create policy "Service role has full access to search history"
  on search_history for all
  using (auth.role() = 'service_role');

