import { Mail, Sparkles } from 'lucide-react';

interface AuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AuthForm({
  email,
  setEmail,
  loading,
  error,
  onSubmit,
}: AuthFormProps) {
  return (
    <>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Create your account
        </h2>
        <p className='text-gray-600 text-sm'>
          Sign up or sign in to save your search history
        </p>
      </div>

      <form onSubmit={onSubmit} className='space-y-4'>
        {/* Email Input */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Email
          </label>
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='your@email.com'
              required
              className='w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-500/10 border border-red-500/50 rounded-lg p-3'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type='submit'
          disabled={loading}
          className='w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
        >
          {loading ? (
            <span className='flex items-center justify-center'>
              <div className='animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
              Sending magic link...
            </span>
          ) : (
            <span className='flex items-center justify-center'>
              <Sparkles className='w-5 h-5 mr-2' />
              Send Magic Link
            </span>
          )}
        </button>
      </form>

      {/* Helper Text */}
      <div className='mt-6 text-center'>
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
          <p className='text-gray-600 text-xs mb-2'>
            🔐 <span className='font-medium'>Passwordless authentication</span>
          </p>
          <p className='text-gray-500 text-xs'>
            We'll email you a secure link to sign in
          </p>
        </div>
      </div>
    </>
  );
}
