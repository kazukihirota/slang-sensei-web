-- Indexes for performance

-- Core slang lookup indexes
create index if not exists idx_slang_headword on slang(headword);
create index if not exists idx_slang_reading on slang(reading);
create index if not exists idx_slang_pos on slang(pos);
create index if not exists idx_slang_register on slang(register);
create index if not exists idx_slang_popularity on slang(popularity desc);
create index if not exists idx_slang_created_at on slang(created_at desc);

-- Array indexes for filtering
create index if not exists idx_slang_dialect on slang using gin(dialect);
create index if not exists idx_slang_tags on slang using gin(tags);

-- Vector search index (for semantic similarity)
create index if not exists idx_slang_vector_embedding on slang_vector using ivfflat (embedding vector_cosine_ops);

-- Cache table indexes
create index if not exists idx_explanation_cache_slang_id on explanation_cache(slang_id);
create index if not exists idx_explanation_cache_proficiency on explanation_cache(proficiency);
create index if not exists idx_explanation_cache_hash on explanation_cache(hash);
create index if not exists idx_explanation_cache_created_at on explanation_cache(created_at desc);
