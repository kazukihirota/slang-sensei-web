import { useState, useEffect } from 'react';
import {
  supabase,
  getSlangExplanation,
  getSearchHistory,
  getCachedExplanation,
  setCachedExplanation,
  clearExpiredCache,
  getLocalSearchHistory,
  addToLocalSearchHistory,
  type SearchHistory,
  type LocalSearchHistory,
} from '../../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ExplanationResult from './components/ExplanationResult';
import RecentSearches from './components/RecentSearches';
import LocalSearchHistoryComponent from './components/LocalSearchHistory';

export default function SlangDictionaryContainer() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [recentTerms, setRecentTerms] = useState<SearchHistory[]>([]);
  const [localHistory, setLocalHistory] = useState<LocalSearchHistory[]>([]);

  useEffect(() => {
    // Check authentication status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);

      // Load recent search history from database if authenticated
      if (user) {
        getSearchHistory(5).then(setRecentTerms);
      } else {
        // Load local search history for unauthenticated users
        setLocalHistory(getLocalSearchHistory());
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getSearchHistory(5).then(setRecentTerms);
        setLocalHistory([]); // Clear local history when user logs in
      } else {
        setRecentTerms([]);
        setLocalHistory(getLocalSearchHistory());
      }
    });

    // Clear expired cache on mount
    clearExpiredCache();

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = async (term: string = searchTerm) => {
    if (!term.trim()) return;

    try {
      setLoading(true);
      setIsFromCache(false);

      // Check local cache first for instant results
      const cached = getCachedExplanation(term);
      if (cached) {
        setExplanation(cached);
        setIsFromCache(true);
        setLoading(false);

        // Still reload recent searches in background if authenticated
        if (user) {
          getSearchHistory(5).then(setRecentTerms);
        }
        return;
      }

      setExplanation(''); // Clear previous explanation

      // Get explanation from API
      const result = await getSlangExplanation(term);
      setExplanation(result);

      // Cache the result for next time
      setCachedExplanation(term, result);

      // Reload recent searches from database after completion (only if authenticated)
      if (user) {
        const history = await getSearchHistory(5);
        setRecentTerms(history);
      } else {
        // Add to local history for unauthenticated users
        addToLocalSearchHistory(term);
        setLocalHistory(getLocalSearchHistory());
      }
    } catch (error) {
      console.error('Error:', error);
      setExplanation(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRecentTerms([]);
  };

  const handleSignup = () => {
    // Navigate to signup page or open modal - for now just navigate to /signup
    window.location.href = '/signup';
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
    handleSearch(term);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100'>
      <Header user={user} onSignup={handleSignup} onLogout={handleLogout} />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Search Section */}
          <div className='lg:col-span-2 space-y-6'>
            <SearchForm
              searchTerm={searchTerm}
              loading={loading}
              onSearchTermChange={setSearchTerm}
              onSearch={() => handleSearch()}
            />

            <ExplanationResult
              explanation={explanation}
            />
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Recent Searches - For authenticated users */}
            {user && recentTerms.length > 0 && (
              <RecentSearches
                recentTerms={recentTerms}
                onSearchClick={handleRecentSearchClick}
              />
            )}

            {/* Local Search History - For unauthenticated users */}
            {!user && localHistory.length > 0 && (
              <LocalSearchHistoryComponent
                history={localHistory}
                onSearchClick={handleRecentSearchClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
