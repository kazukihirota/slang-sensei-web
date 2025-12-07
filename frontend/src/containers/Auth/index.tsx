import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AuthHeader from './components/AuthHeader';
import AuthForm from './components/AuthForm';
import OtpVerification from './components/OtpVerification';
import DevNotice from './components/DevNotice';

export default function AuthContainer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated and redirect
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      // Success! User is now authenticated, redirect to home
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
      throw err; // Re-throw to let OtpVerification component handle it
    } finally {
      setLoading(false);
    }
  };

  const handleBackToApp = () => {
    navigate('/');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <AuthHeader onBack={handleBackToApp} />

        {/* Auth Card */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
          {otpSent ? (
            <OtpVerification
              email={email}
              loading={loading}
              error={error}
              onVerify={handleVerifyOtp}
              onUseDifferentEmail={() => {
                setOtpSent(false);
                setError(null);
              }}
              onResend={handleSubmit}
            />
          ) : (
            <AuthForm
              email={email}
              setEmail={setEmail}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
            />
          )}

          <DevNotice />
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

