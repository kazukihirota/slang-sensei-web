-- Indexes for performance

-- Core dictionary entries lookup indexes
create index if not exists idx_dictionary_entries_headword on dictionary_entries(headword);
create index if not exists idx_dictionary_entries_reading on dictionary_entries(reading);
create index if not exists idx_dictionary_entries_pos on dictionary_entries(pos);
create index if not exists idx_dictionary_entries_register on dictionary_entries(register);
create index if not exists idx_dictionary_entries_popularity on dictionary_entries(popularity desc);
create index if not exists idx_dictionary_entries_created_at on dictionary_entries(created_at desc);

-- Array indexes for filtering
create index if not exists idx_dictionary_entries_dialect on dictionary_entries using gin(dialect);
create index if not exists idx_dictionary_entries_tags on dictionary_entries using gin(tags);

-- Dictionary examples indexes
create index if not exists idx_dictionary_examples_entry_id on dictionary_examples(entry_id);

-- Cache table indexes
create index if not exists idx_explanation_cache_entry_id on explanation_cache(entry_id);
create index if not exists idx_explanation_cache_hash on explanation_cache(hash);
create index if not exists idx_explanation_cache_created_at on explanation_cache(created_at desc);

-- Search history indexes
create index if not exists idx_search_history_user_id on search_history(user_id);
create index if not exists idx_search_history_entry_id on search_history(entry_id);
create index if not exists idx_search_history_created_at on search_history(created_at desc);

-- Additional dictionary indexes
create index if not exists idx_dictionary_entries_entry_type on dictionary_entries(entry_type);
