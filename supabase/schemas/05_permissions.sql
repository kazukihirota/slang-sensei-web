-- Grants and Permissions

-- Grant usage on schema
grant usage on schema public to anon, authenticated;

-- ============================================================================
-- Dictionary entries table grants
-- ============================================================================

grant select on table dictionary_entries to anon, authenticated, service_role;
grant insert on table dictionary_entries to authenticated, service_role;
grant update on table dictionary_entries to authenticated, service_role;
grant delete on table dictionary_entries to service_role;

-- ============================================================================
-- Dictionary examples table grants
-- ============================================================================

grant select on table dictionary_examples to anon, authenticated, service_role;
grant insert on table dictionary_examples to authenticated, service_role;
grant update on table dictionary_examples to authenticated, service_role;
grant delete on table dictionary_examples to service_role;

-- ============================================================================
-- Explanation cache table grants
-- ============================================================================

grant select on table explanation_cache to anon, authenticated, service_role;
grant insert on table explanation_cache to authenticated, service_role;
grant update on table explanation_cache to authenticated, service_role;
grant delete on table explanation_cache to service_role;

-- ============================================================================
-- Search history table grants
-- ============================================================================

grant all on search_history to anon, authenticated, service_role;

-- ============================================================================
-- Function grants
-- ============================================================================

grant execute on function hybrid_dictionary_search(text, int, text[]) to anon, authenticated, service_role;
grant execute on function search_slang_only(text, int) to anon, authenticated, service_role;
grant execute on function search_dictionary_only(text, int) to anon, authenticated, service_role;
grant execute on function increment_entry_popularity(uuid) to anon, authenticated, service_role;

