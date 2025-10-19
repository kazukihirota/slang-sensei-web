import { User } from 'lucide-react';

interface SignupPromptProps {
  onSignup: () => void;
}

export default function SignupPrompt({ onSignup }: SignupPromptProps) {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-indigo-100 p-6'>
      <h3 className='text-lg font-semibold mb-3 flex items-center'>
        <User className='h-5 w-5 mr-2 text-indigo-600' />
        Sign up for more
      </h3>
      <p className='text-sm text-gray-600 mb-4'>
        Create a free account to unlock:
      </p>
      <ul className='space-y-2 text-sm text-gray-600 mb-4'>
        <li className='flex items-start'>
          <span className='text-indigo-600 mr-2'>✓</span>
          <span>Search history across devices</span>
        </li>
        <li className='flex items-start'>
          <span className='text-indigo-600 mr-2'>✓</span>
          <span>Never lose your progress</span>
        </li>
        <li className='flex items-start'>
          <span className='text-indigo-600 mr-2'>✓</span>
          <span>No password required</span>
        </li>
      </ul>
      <button
        onClick={onSignup}
        className='w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium'
      >
        Get Started
      </button>
    </div>
  );
}
