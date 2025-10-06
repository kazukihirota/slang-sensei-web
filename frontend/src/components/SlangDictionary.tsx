import { useState, useEffect } from 'react';
import {
  supabase,
  getSlangExplanation,
  getSearchHistory,
  type SearchHistory,
} from '../lib/supabase';
import { Search, LogOut, Book, Sparkles } from 'lucide-react';

export default function SlangDictionary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentTerms, setRecentTerms] = useState<SearchHistory[]>([]);

  useEffect(() => {
    // Load recent search history from database
    const loadRecentSearches = async () => {
      const history = await getSearchHistory(5);
      setRecentTerms(history);
    };
    loadRecentSearches();
  }, []);

  const handleSearch = async (term: string = searchTerm) => {
    if (!term.trim()) return;

    try {
      setLoading(true);
      const result = await getSlangExplanation(term);
      setExplanation(result);

      // Reload recent searches from database
      const history = await getSearchHistory(5);
      setRecentTerms(history);
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
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'>
      {/* Header */}
      <header className='bg-white/80 backdrop-blur-sm shadow-sm border-b border-purple-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg'>
                <Book className='h-5 w-5 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900'>スラング先生</h1>
              <span className='text-sm text-gray-500'>Slang Sensei</span>
            </div>

            <div className='flex items-center space-x-4'>
              <button
                onClick={handleLogout}
                className='flex items-center space-x-1 px-3 py-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors'
              >
                <LogOut className='h-4 w-4' />
                <span className='hidden sm:inline'>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Search Section */}
          <div className='lg:col-span-2 space-y-6'>
            <div className='bg-white rounded-xl shadow-sm border border-purple-100 p-6'>
              <h2 className='hidden sm:flex text-xl font-semibold mb-4 items-center'>
                <Search className='h-5 w-5 mr-2 text-purple-600' />
                Search Japanese Slang
              </h2>

              <div className='space-y-4'>
                <div className='flex flex-col sm:flex-row gap-2'>
                  <input
                    type='text'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder='Enter slang term (e.g., 草, エモい, しか勝たん)'
                    className='flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
                  />
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className='px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2 transition-all font-semibold'
                  >
                    {loading ? (
                      <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
                    ) : (
                      <Sparkles className='h-4 w-4' />
                    )}
                    <span>{loading ? 'Explaining...' : 'Explain'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Explanation Result */}
            {explanation && (
              <div className='bg-white rounded-xl shadow-sm border border-purple-100 p-6'>
                <h3 className='text-lg font-semibold mb-4 flex items-center'>
                  <Sparkles className='h-5 w-5 mr-2 text-purple-600' />
                  Explanation
                </h3>
                <div
                  className='prose prose-sm max-w-none text-gray-700'
                  dangerouslySetInnerHTML={{
                    __html: explanation
                      .replace(/\n/g, '<br>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Recent Searches */}
            {recentTerms.length > 0 && (
              <div className='bg-white rounded-xl shadow-sm border border-purple-100 p-6'>
                <h3 className='text-lg font-semibold mb-4'>Recent Searches</h3>
                <div className='space-y-2'>
                  {recentTerms.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => {
                        setSearchTerm(search.search_term);
                        handleSearch(search.search_term);
                      }}
                      className='block w-full text-left px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-gray-700 hover:text-purple-900 rounded-lg transition-colors'
                    >
                      <div className='flex justify-between items-center'>
                        <span>{search.search_term}</span>
                        <span className='text-xs text-gray-500'>
                          {new Date(search.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
