-- Dictionary entries (both slang and regular words)
create table if not exists dictionary_entries (
  id uuid primary key default gen_random_uuid(),
  headword text not null,           -- e.g. 草, エモい, しか勝たん, 食べる
  reading text,                     -- くさ, えもい, たべる
  pos text,                         -- interj, adj, verb, phrase, noun, etc.
  register text default 'neutral',
  dialect text[],                   -- {'kansai','kantou','net'}
  tags text[],                      -- {'internet','anime','youth','otaku','jlpt','common'}
  definition_ja text not null,
  definition_en text not null,
  polite_equiv text,                -- e.g. 面白い, 素晴らしい
  notes text,                       -- nuance, do/don'ts, grammar notes
  popularity int default 0,
  entry_type text check (entry_type in ('slang','dictionary','both')) default 'dictionary',
  created_at timestamp default now()
);

-- Examples (multiple per dictionary entry)
create table if not exists dictionary_examples (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references dictionary_entries(id) on delete cascade,
  jp text not null,
  en text not null,
  source text,                      -- optional provenance text
  created_at timestamp default now()
);

-- Cached explanations to cut LLM spend
create table if not exists explanation_cache (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references dictionary_entries(id) on delete cascade,
  answer_md text not null,
  hash text not null,               -- inputs hash (term+prof+options)
  created_at timestamp default now()
);

-- User profiles
-- This extends auth.users with additional profile information
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  proficiency_level text check (proficiency_level in ('A2','B1','B2','C1')) default 'B1',
  total_searches int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Search history
create table if not exists search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entry_id uuid references dictionary_entries(id) on delete set null,
  search_term text not null,
  created_at timestamp with time zone default now()
);
