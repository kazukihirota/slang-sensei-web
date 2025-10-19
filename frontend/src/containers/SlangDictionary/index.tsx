import { useState, useEffect } from 'react';
import {
  supabase,
  getSlangExplanationStream,
  getSearchHistory,
  getCachedExplanation,
  setCachedExplanation,
  clearExpiredCache,
  type SearchHistory,
} from '../../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AuthModal from '../Auth/AuthModal';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ExplanationResult from './components/ExplanationResult';
import SignupBanner from './components/SignupBanner';
import RecentSearches from './components/RecentSearches';
import SignupPrompt from './components/SignupPrompt';

export default function SlangDictionaryContainer() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [recentTerms, setRecentTerms] = useState<SearchHistory[]>([]);
  const [showSignupBanner, setShowSignupBanner] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check authentication status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);

      // Load recent search history from database if authenticated
      if (user) {
        getSearchHistory(5).then(setRecentTerms);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getSearchHistory(5).then(setRecentTerms);
      } else {
        setRecentTerms([]);
      }
    });

    // Clear expired cache on mount
    clearExpiredCache();

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = async (term: string = searchTerm) => {
    if (!term.trim()) return;

    // Show signup banner after first search if not authenticated
    if (!user && !showSignupBanner) {
      setShowSignupBanner(true);
    }

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

      // Use streaming for real-time updates
      let fullExplanation = '';
      await getSlangExplanationStream(term, (chunk) => {
        fullExplanation += chunk;
        setExplanation(fullExplanation);
      });

      // Cache the result for next time
      setCachedExplanation(term, fullExplanation);

      // Reload recent searches from database after completion (only if authenticated)
      if (user) {
        const history = await getSearchHistory(5);
        setRecentTerms(history);
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

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
    handleSearch(term);
  };

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100'>
        <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Signup Banner for non-authenticated users */}
          {!user && showSignupBanner && (
            <SignupBanner
              onSignup={handleLogin}
              onDismiss={() => setShowSignupBanner(false)}
            />
          )}

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
                isFromCache={isFromCache}
              />
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Recent Searches - Only for authenticated users */}
              {user && (
                <RecentSearches
                  recentTerms={recentTerms}
                  onSearchClick={handleRecentSearchClick}
                />
              )}

              {/* Unauthenticated sidebar info */}
              {!user && <SignupPrompt onSignup={handleLogin} />}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className='max-w-md p-0 border-0 rounded-2xl'>
          <AuthModal onClose={handleCloseAuthModal} />
        </DialogContent>
      </Dialog>
    </>
  );
}
