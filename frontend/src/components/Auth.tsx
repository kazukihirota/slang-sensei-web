import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Mail, Sparkles } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo and Brand */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-xl'>
            <BookOpen className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            スラング先生
          </h1>
          <p className='text-gray-600 text-sm'>
            Master Japanese slang, one word at a time
          </p>
        </div>

        {/* Auth Card */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
          {success ? (
            // Success State
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
              <div className='bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6'>
                <div className='flex items-start gap-3'>
                  <Sparkles className='w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5' />
                  <div className='text-left'>
                    <p className='text-gray-700 text-sm mb-2'>
                      Click the link in your email to sign in. No password
                      required!
                    </p>
                    <p className='text-gray-500 text-xs'>
                      The link will expire in 1 hour.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className='text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors'
              >
                Use a different email
              </button>
            </div>
          ) : (
            // Form State
            <>
              <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                  Welcome back
                </h2>
                <p className='text-gray-600 text-sm'>
                  Sign in with your email to continue
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
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
                      className='w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
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
                  className='w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
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
                    🔐{' '}
                    <span className='font-medium'>
                      Passwordless authentication
                    </span>
                  </p>
                  <p className='text-gray-500 text-xs'>
                    We'll email you a secure link to sign in
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Development Mode Notice */}
          {import.meta.env.DEV && (
            <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-blue-700 text-xs text-center'>
                <span className='font-medium'>Dev Mode:</span> Check emails at{' '}
                <a
                  href='http://127.0.0.1:54324'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='underline hover:text-blue-900'
                >
                  localhost:54324
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='text-center mt-8'>
          <p className='text-gray-500 text-xs'>
            Learn Japanese slang the modern way
          </p>
        </div>
      </div>
    </div>
  );
}
