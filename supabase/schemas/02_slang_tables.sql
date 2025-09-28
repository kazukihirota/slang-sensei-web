-- Slang entries
create table if not exists slang (
  id uuid primary key default gen_random_uuid(),
  headword text not null,           -- e.g. 草, エモい, しか勝たん
  reading text,                     -- くさ, えもい
  pos text,                         -- interj, adj, verb, phrase
  register text check (register in ('polite','neutral','casual','vulgar')) default 'casual',
  dialect text[],                   -- {'kansai','kantou','net'}
  tags text[],                      -- {'internet','anime','youth','otaku'}
  definition_ja text not null,
  definition_en text not null,
  polite_equiv text,                -- e.g. 面白い, 素晴らしい
  notes text,                       -- nuance, do/don'ts
  popularity int default 0,
  created_at timestamp default now()
);

-- Examples (multiple per slang)
create table if not exists slang_example (
  id uuid primary key default gen_random_uuid(),
  slang_id uuid references slang(id) on delete cascade,
  jp text not null,
  en text not null,
  source text,                      -- optional provenance text
  created_at timestamp default now()
);

-- Vectors (separate table keeps base rows clean)
create table if not exists slang_vector (
  slang_id uuid primary key references slang(id) on delete cascade,
  embedding vector(768)             -- whatever dimension your embed uses
);

-- Cached explanations to cut LLM spend
create table if not exists explanation_cache (
  id uuid primary key default gen_random_uuid(),
  slang_id uuid references slang(id) on delete cascade,
  proficiency text check (proficiency in ('A2','B1','B2','C1')) default 'B1',
  answer_md text not null,
  hash text not null,               -- inputs hash (term+prof+options)
  created_at timestamp default now()
);
