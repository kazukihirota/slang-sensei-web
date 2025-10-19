import { Mail, Sparkles } from 'lucide-react';

interface SuccessMessageProps {
  email: string;
  onUseDifferentEmail: () => void;
  onBackToApp: () => void;
}

export default function SuccessMessage({
  email,
  onUseDifferentEmail,
  onBackToApp,
}: SuccessMessageProps) {
  return (
    <div className='text-center py-8'>
      <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
        <Mail className='w-8 h-8 text-green-600' />
      </div>
      <h3 className='text-2xl font-bold text-gray-900 mb-2'>
        Check your email!
      </h3>
      <p className='text-gray-600 mb-6'>
        We've sent a magic link to{' '}
        <span className='text-gray-900 font-medium'>{email}</span>
      </p>
      <div className='bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6'>
        <div className='flex items-start gap-3'>
          <Sparkles className='w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5' />
          <div className='text-left'>
            <p className='text-gray-700 text-sm mb-2'>
              Click the link in your email to sign in. No password required!
            </p>
            <p className='text-gray-500 text-xs'>
              The link will expire in 1 hour.
            </p>
          </div>
        </div>
      </div>
      <div className='flex gap-3'>
        <button
          onClick={onUseDifferentEmail}
          className='flex-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors py-2'
        >
          Use a different email
        </button>
        <button
          onClick={onBackToApp}
          className='flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors'
        >
          Back to app
        </button>
      </div>
    </div>
  );
}
