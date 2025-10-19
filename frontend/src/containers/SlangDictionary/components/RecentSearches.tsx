import type { SearchHistory } from '../../../lib/supabase';

interface RecentSearchesProps {
  recentTerms: SearchHistory[];
  onSearchClick: (term: string) => void;
}

export default function RecentSearches({
  recentTerms,
  onSearchClick,
}: RecentSearchesProps) {
  if (recentTerms.length === 0) return null;

  return (
    <div className='bg-white rounded-xl shadow-sm border border-indigo-100 p-6'>
      <h3 className='text-lg font-semibold mb-4'>Recent Searches</h3>
      <div className='space-y-2'>
        {recentTerms.map((search) => (
          <button
            key={search.id}
            onClick={() => onSearchClick(search.search_term)}
            className='block w-full text-left px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-gray-700 hover:text-indigo-900 rounded-lg transition-colors'
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
  );
}
