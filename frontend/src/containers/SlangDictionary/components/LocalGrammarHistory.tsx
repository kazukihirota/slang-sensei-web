import { Info, FileText } from 'lucide-react';

// LocalGrammarHistory interface will be added to supabase.ts
interface LocalGrammarHistory {
  sentence: string;
  timestamp: number;
}

interface LocalGrammarHistoryProps {
  history: LocalGrammarHistory[];
  onSearchClick: (sentence: string) => void;
}

export default function LocalGrammarHistoryComponent({
  history,
  onSearchClick,
}: LocalGrammarHistoryProps) {
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-indigo-100 p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold flex items-center'>
          <FileText className='h-5 w-5 mr-2 text-indigo-600' />
          Recent Analysis
        </h3>
      </div>

      {/* Info Banner */}
      <div className='mb-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3'>
        <div className='flex items-start gap-2'>
          <Info className='h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5' />
          <p className='text-xs text-indigo-900'>
            Stored locally. Sign up to save your history across devices.
          </p>
        </div>
      </div>

      {/* History List */}
      <div className='space-y-2'>
        {history.map((item, index) => (
          <button
            key={`${item.sentence}-${index}`}
            onClick={() => onSearchClick(item.sentence)}
            className='block w-full text-left px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-gray-700 hover:text-indigo-900 rounded-lg transition-colors'
          >
            <div className='flex justify-between items-center'>
              <span className='font-medium truncate'>{item.sentence}</span>
              <span className='text-xs text-gray-500 ml-2 flex-shrink-0'>
                {formatTimeAgo(item.timestamp)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
