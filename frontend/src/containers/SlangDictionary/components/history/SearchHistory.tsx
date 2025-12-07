import { Clock, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Union type for both local and remote history items
export interface HistoryItem {
  id?: string;
  term: string;
  // For local storage items
  timestamp?: number;
  // For Supabase items
  createdAt?: string;
}

interface SearchHistoryProps {
  history: HistoryItem[];
  onSearchClick: (term: string) => void;
  mode: 'slang' | 'grammar';
  isLocal: boolean;
}

const titles: Record<'slang' | 'grammar', string> = {
  slang: 'Recent Searches',
  grammar: 'Recent Analysis',
};

export default function SearchHistory({
  history,
  onSearchClick,
  mode,
  isLocal,
}: SearchHistoryProps) {
  if (history.length === 0) return null;

  const title = titles[mode];

  const formatTime = (item: HistoryItem): string => {
    let date: Date;
    
    if (item.timestamp) {
      date = new Date(item.timestamp);
    } else if (item.createdAt) {
      date = new Date(item.createdAt);
    } else {
      return '';
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getItemKey = (item: HistoryItem, index: number): string => {
    return item.id || `${item.term}-${index}`;
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-indigo-100 p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold flex items-center'>
          <Clock className='h-5 w-5 mr-2 text-indigo-600' />
          {title}
        </h3>
      </div>

      {/* Info Banner for local storage */}
      {isLocal && (
        <div className='mb-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3'>
          <div className='flex items-start gap-2'>
            <Info className='h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5' />
            <p className='text-xs text-indigo-900'>
              Stored locally. Sign up to save your history across devices.
            </p>
          </div>
        </div>
      )}

      {/* History List */}
      <div className='space-y-2'>
        {history.map((item, index) => (
          <button
            key={getItemKey(item, index)}
            onClick={() => onSearchClick(item.term)}
            className='block w-full text-left px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-gray-700 hover:text-indigo-900 rounded-lg transition-colors'
          >
            <div className='flex justify-between items-center'>
              <span className='font-medium truncate'>{item.term}</span>
              <span className='text-xs text-gray-500 ml-2 flex-shrink-0'>
                {formatTime(item)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
