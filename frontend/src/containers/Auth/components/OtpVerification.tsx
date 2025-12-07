import { useState, useRef, useEffect } from 'react';
import { Mail, Sparkles, RefreshCw } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  loading: boolean;
  error: string | null;
  onVerify: (otp: string) => Promise<void>;
  onUseDifferentEmail: () => void;
  onResend: (e: React.FormEvent) => Promise<void>;
}

export default function OtpVerification({
  email,
  loading,
  error,
  onVerify,
  onUseDifferentEmail,
  onResend,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (index === 5 && value) {
      const fullOtp = [...newOtp.slice(0, 5), value].join('');
      handleVerify(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if 6 digits pasted
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code: string) => {
    try {
      await onVerify(code);
    } catch {
      // Error is handled by parent component
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResending(true);
    try {
      await onResend(e);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  return (
    <div className='text-center'>
      <div className='inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4'>
        <Mail className='w-8 h-8 text-indigo-600' />
      </div>
      <h3 className='text-2xl font-bold text-gray-900 mb-2'>
        Enter verification code
      </h3>
      <p className='text-gray-600 mb-6'>
        We've sent a 6-digit code to{' '}
        <span className='text-gray-900 font-medium'>{email}</span>
      </p>

      {/* OTP Input */}
      <div className='flex justify-center gap-2 mb-4'>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type='text'
            inputMode='numeric'
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={loading}
            className='w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4'>
          <p className='text-red-600 text-sm'>{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className='bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6'>
        <div className='flex items-start gap-3'>
          <Sparkles className='w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5' />
          <div className='text-left'>
            <p className='text-gray-700 text-sm mb-2'>
              Enter the code from your email to sign in.
            </p>
            <p className='text-gray-500 text-xs'>
              The code will expire in 60 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex flex-col gap-3'>
        <button
          onClick={handleResend}
          disabled={resending || loading}
          className='flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors py-2 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Resending...' : 'Resend code'}
        </button>
        <button
          onClick={onUseDifferentEmail}
          disabled={loading}
          className='text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors py-2 disabled:opacity-50'
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}
