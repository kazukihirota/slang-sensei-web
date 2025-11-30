import { Search, Sparkles, FileText } from 'lucide-react';

interface SearchFormProps {
  searchTerm: string;
  loading: boolean;
  mode: 'slang' | 'grammar';
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
}

export default function SearchForm({
  searchTerm,
  loading,
  mode,
  onSearchTermChange,
  onSearch,
}: SearchFormProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  // Dynamic content based on mode
  const config = mode === 'grammar' ? {
    title: 'Grammar Analysis',
    placeholder: 'Enter Japanese sentence',
    buttonText: 'Analyze',
    loadingText: 'Analyzing...',
    icon: <FileText className='h-4 w-4' />,
  } : {
    title: 'Search Japanese Slang',
    placeholder: 'Enter slang term',
    buttonText: 'Explain',
    loadingText: 'Explaining...',
    icon: <Sparkles className='h-4 w-4' />,
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-indigo-100 p-6'>
      <h2 className='hidden sm:flex text-xl font-semibold mb-4 items-center'>
        <Search className='h-5 w-5 mr-2 text-indigo-600' />
        {config.title}
      </h2>

      <div className='space-y-4'>
        <div className='flex flex-col sm:flex-row gap-2'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={config.placeholder}
            className='flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
          />
          <button
            onClick={onSearch}
            disabled={loading}
            className='px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2 transition-all font-semibold'
          >
            {loading ? (
              <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
            ) : (
              config.icon
            )}
            <span>{loading ? config.loadingText : config.buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
