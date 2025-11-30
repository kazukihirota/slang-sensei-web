import { FileText } from 'lucide-react';

// GrammarHistory interface will be added to supabase.ts
interface GrammarHistory {
  id: string;
  user_id: string;
  search_term: string;
  created_at: string;
}

interface GrammarHistoryProps {
  history: GrammarHistory[];
  onSearchClick: (sentence: string) => void;
}

export default function GrammarHistoryComponent({
  history,
  onSearchClick,
}: GrammarHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className='bg-white rounded-xl shadow-sm border border-indigo-100 p-6'>
      <h3 className='text-lg font-semibold mb-4 flex items-center'>
        <FileText className='h-5 w-5 mr-2 text-indigo-600' />
        Recent Analysis
      </h3>
      <div className='space-y-2'>
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSearchClick(item.search_term)}
            className='block w-full text-left px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-gray-700 hover:text-indigo-900 rounded-lg transition-colors'
          >
            <div className='flex justify-between items-center'>
              <span className='truncate'>{item.search_term}</span>
              <span className='text-xs text-gray-500 ml-2 flex-shrink-0'>
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
