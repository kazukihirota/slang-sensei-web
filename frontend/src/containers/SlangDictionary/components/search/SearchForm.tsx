import { useState, useEffect } from 'react';
import { Search, Sparkles, FileText, Mic, X } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  const [isDictating, setIsDictating] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  // Log speech recognition state changes for debugging
  useEffect(() => {
    console.log('[SpeechRecognition] State:', {
      listening,
      browserSupportsSpeechRecognition,
      isMicrophoneAvailable,
      transcript
    });
  }, [listening, browserSupportsSpeechRecognition, isMicrophoneAvailable, transcript]);

  // Update search term when transcript changes
  useEffect(() => {
    if (transcript) {
      onSearchTermChange(transcript);
    }
  }, [transcript, onSearchTermChange]);

  // Sync isDictating with listening state
  useEffect(() => {
    setIsDictating(listening);
  }, [listening]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleMicClick = async () => {
    setMicError(null);
    
    if (!browserSupportsSpeechRecognition) {
      const error = 'Your browser does not support speech recognition. Please use Chrome or Edge.';
      setMicError(error);
      alert(error);
      return;
    }

    if (!isMicrophoneAvailable) {
      const error = 'Microphone access denied. Please allow microphone access in your browser settings.';
      setMicError(error);
      console.error('[SpeechRecognition] Microphone not available');
      alert(error);
      return;
    }

    if (listening) {
      // Stop dictation
      SpeechRecognition.stopListening();
      console.log('[SpeechRecognition] Stopping dictation...');
    } else {
      // Start dictation with Japanese language
      try {
        resetTranscript();
        console.log('[SpeechRecognition] Starting dictation...');
        await SpeechRecognition.startListening({ 
          language: 'ja-JP',
          continuous: false 
        });
        console.log('[SpeechRecognition] startListening called successfully');
      } catch (error) {
        console.error('[SpeechRecognition] Error starting:', error);
        setMicError(error instanceof Error ? error.message : 'Failed to start speech recognition');
        alert(`Speech recognition error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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

      {micError && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
          {micError}
        </div>
      )}

      <div className='space-y-4'>
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative flex-1'>
            <Input
              type='text'
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isDictating ? 'Listening...' : config.placeholder}
              className={`w-full pl-4 pr-10 py-2.5 border rounded-lg transition-all ${
                isDictating 
                  ? 'border-red-400 ring-2 ring-red-200 animate-pulse' 
                  : 'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              }`}
              disabled={isDictating}
            />
            {isDictating ? (
              <X 
                className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 cursor-pointer hover:text-red-700 transition-colors' 
                onClick={handleMicClick}
              />
            ) : (
              <Mic 
                className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors' 
                onClick={handleMicClick}
              />
            )}
          </div>
          <Button
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
          </Button>
        </div>
      </div>
    </div>
  );
}
