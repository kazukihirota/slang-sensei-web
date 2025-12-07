import { useState, useEffect, useMemo } from 'react';
import {
  supabase,
  getSlangExplanation,
  getSearchHistory,
  getCachedExplanation,
  setCachedExplanation,
  clearExpiredCache,
  getLocalSearchHistory,
  addToLocalSearchHistory,
  getGrammarAnalysis,
  getGrammarHistory,
  getCachedGrammarAnalysis,
  setCachedGrammarAnalysis,
  getLocalGrammarHistory,
  addToLocalGrammarHistory,
  type SearchHistory as SearchHistoryType,
  type LocalSearchHistory,
  type GrammarHistory,
  type LocalGrammarHistory as LocalGrammarHistoryType,
} from '../../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import Header from './components/layout/Header';
import ModeToggle from './components/search/ModeToggle';
import SearchForm from './components/search/SearchForm';
import ExplanationResult from './components/search/ExplanationResult';
import SearchHistory, { type HistoryItem } from './components/history/SearchHistory';
import type { InputMode } from './type';


export default function SlangDictionaryContainer() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [mode, setMode] = useState<InputMode>('slang');
  const [searchTerm, setSearchTerm] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentTerms, setRecentTerms] = useState<SearchHistoryType[]>([]);
  const [localHistory, setLocalHistory] = useState<LocalSearchHistory[]>([]);
  const [grammarHistory, setGrammarHistory] = useState<GrammarHistory[]>([]);
  const [localGrammarHistory, setLocalGrammarHistory] = useState<LocalGrammarHistoryType[]>([]);

  // Transform history data to unified HistoryItem format
  const historyItems: HistoryItem[] = useMemo(() => {
    if (mode === 'slang') {
      if (user) {
        return recentTerms.map(item => ({
          id: item.id,
          term: item.search_term,
          createdAt: item.created_at,
        }));
      } else {
        return localHistory.map(item => ({
          term: item.term,
          timestamp: item.timestamp,
        }));
      }
    } else {
      if (user) {
        return grammarHistory.map(item => ({
          id: item.id,
          term: item.search_term,
          createdAt: item.created_at,
        }));
      } else {
        return localGrammarHistory.map(item => ({
          term: item.sentence,
          timestamp: item.timestamp,
        }));
      }
    }
  }, [mode, user, recentTerms, localHistory, grammarHistory, localGrammarHistory]);

  useEffect(() => {
    // Check authentication status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);

      // Load recent search history from database if authenticated
      if (user) {
        getSearchHistory(5).then(setRecentTerms);
        getGrammarHistory(5).then(setGrammarHistory);
      } else {
        // Load local search history for unauthenticated users
        setLocalHistory(getLocalSearchHistory());
        setLocalGrammarHistory(getLocalGrammarHistory());
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getSearchHistory(5).then(setRecentTerms);
        getGrammarHistory(5).then(setGrammarHistory);
        setLocalHistory([]);
        setLocalGrammarHistory([]);
      } else {
        setRecentTerms([]);
        setGrammarHistory([]);
        setLocalHistory(getLocalSearchHistory());
        setLocalGrammarHistory(getLocalGrammarHistory());
      }
    });

    // Clear expired cache on mount
    clearExpiredCache();

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = async (term: string = searchTerm) => {
    if (!term.trim() || loading) return;

    try {
      setLoading(true);

      // Check local cache first for instant results
      const cached = getCachedExplanation(term);
      if (cached) {
        setExplanation(cached);
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

  // Handle mode change
  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    setSearchTerm('');
    setExplanation('');
  };

  // Grammar analysis handler
  const handleGrammarAnalysis = async (sentence: string = searchTerm) => {
    if (!sentence.trim()) return;

    try {
      setLoading(true);

      // Check local cache first for instant results
      const cached = getCachedGrammarAnalysis(sentence);
      if (cached) {
        setExplanation(cached);
        setLoading(false);

        // Still reload recent searches in background if authenticated
        if (user) {
          getGrammarHistory(5).then(setGrammarHistory);
        }
        return;
      }

      setExplanation('');

      // Get analysis from API
      const result = await getGrammarAnalysis(sentence);
      setExplanation(result);

      // Cache the result for next time
      setCachedGrammarAnalysis(sentence, result);

      // Reload recent searches from database after completion (only if authenticated)
      if (user) {
        const history = await getGrammarHistory(5);
        setGrammarHistory(history);
      } else {
        // Add to local history for unauthenticated users
        addToLocalGrammarHistory(sentence);
        setLocalGrammarHistory(getLocalGrammarHistory());
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

  // Unified submit handler based on mode
  const handleSubmit = () => {
    if (mode === 'grammar') {
      handleGrammarAnalysis();
    } else {
      handleSearch();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRecentTerms([]);
    setGrammarHistory([]);
  };

  const handleSignup = () => {
    // Navigate to signup page or open modal - for now just navigate to /signup
    window.location.href = '/signup';
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
    handleSearch(term);
  };

  const handleGrammarHistoryClick = (sentence: string) => {
    setSearchTerm(sentence);
    handleGrammarAnalysis(sentence);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100'>
      <Header user={user} onSignup={handleSignup} onLogout={handleLogout} />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Search Section */}
          <div className='lg:col-span-2 space-y-6'>
            <ModeToggle mode={mode} onModeChange={handleModeChange} />

            <SearchForm
              searchTerm={searchTerm}
              loading={loading}
              mode={mode}
              onSearchTermChange={setSearchTerm}
              onSearch={handleSubmit}
            />

            <ExplanationResult
              explanation={explanation}
              mode={mode}
            />
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <SearchHistory
              history={historyItems}
              onSearchClick={mode === 'grammar' ? handleGrammarHistoryClick : handleRecentSearchClick}
              mode={mode}
              isLocal={!user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
