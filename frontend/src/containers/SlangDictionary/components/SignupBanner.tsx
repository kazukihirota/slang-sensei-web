import { Sparkles, User } from 'lucide-react';

interface SignupBannerProps {
  onSignup: () => void;
  onDismiss: () => void;
}

export default function SignupBanner({
  onSignup,
  onDismiss,
}: SignupBannerProps) {
  return (
    <div className='mb-6 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl shadow-lg border border-indigo-400 p-6 text-white'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold mb-2 flex items-center'>
            <Sparkles className='h-5 w-5 mr-2' />
            Save your search history!
          </h3>
          <p className='text-indigo-100 text-sm mb-4'>
            Create a free account to save your search history across devices and
            never lose your progress.
          </p>
          <button
            onClick={onSignup}
            className='inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-sm'
          >
            <User className='h-4 w-4 mr-2' />
            Create Free Account
          </button>
        </div>
        <button
          onClick={onDismiss}
          className='text-indigo-200 hover:text-white transition-colors ml-4'
          aria-label='Dismiss'
        >
          <svg
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
