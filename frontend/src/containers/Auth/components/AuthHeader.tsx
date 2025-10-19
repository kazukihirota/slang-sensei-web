import { ArrowLeft, BookOpen } from 'lucide-react';

interface AuthHeaderProps {
  onBack: () => void;
}

export default function AuthHeader({ onBack }: AuthHeaderProps) {
  return (
    <>
      {/* Back Button */}
      <button
        onClick={onBack}
        className='mb-4 flex items-center text-indigo-600 hover:text-indigo-700 transition-colors'
      >
        <ArrowLeft className='w-4 h-4 mr-1' />
        <span className='text-sm'>Back to app</span>
      </button>

      {/* Logo and Brand */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mb-4 shadow-xl'>
          <BookOpen className='w-8 h-8 text-white' />
        </div>
        <h1 className='text-4xl font-bold text-gray-900 mb-2'>スラング先生</h1>
        <p className='text-gray-600 text-sm'>
          Save your search history across devices
        </p>
      </div>
    </>
  );
}
