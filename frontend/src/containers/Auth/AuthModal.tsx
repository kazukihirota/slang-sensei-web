import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BookOpen } from 'lucide-react';
import AuthForm from './components/AuthForm';
import OtpVerification from './components/OtpVerification';
import DevNotice from './components/DevNotice';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

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
      // Success! User is now authenticated
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
      throw err; // Re-throw to let OtpVerification component handle it
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-8'>
      {/* Logo and Brand */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mb-4 shadow-xl'>
          <BookOpen className='w-8 h-8 text-white' />
        </div>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>スラング先生</h1>
        <p className='text-gray-600 text-sm'>
          Save your search history across devices
        </p>
      </div>

      {/* Auth Content */}
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
  );
}
