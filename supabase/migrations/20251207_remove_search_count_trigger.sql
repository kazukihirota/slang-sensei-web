-- Drop the trigger that tries to update the non-existent user_profiles table
DROP TRIGGER IF EXISTS on_search_recorded ON public.search_history;

-- The increment_user_search_count function is already dropped in 20251005073524_remove_user_profile.sql
-- but we'll ensure it's gone
DROP FUNCTION IF EXISTS public.increment_user_search_count();
