import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/api/authService';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const codeFromUrl = searchParams.get('code') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState(codeFromUrl);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) return;
    const fetchStatus = async () => {
      try {
        const response = await authService.getEmailVerificationStatus(email);
        if (response.data.cooldown_seconds > 0) {
          setCooldown(response.data.cooldown_seconds);
        }
      } catch {
        // Ignore status check errors
      }
    };
    fetchStatus();
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid verification link');
      return;
    }

    setLoading(true);

    try {
      await authService.verifyEmail(token, code);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setResending(true);
    setError('');
    setResendSuccess(false);

    try {
      await authService.sendEmailVerification(email);
      setResendSuccess(true);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail && detail.includes('wait')) {
        const match = detail.match(/(\d+)\s*seconds/);
        if (match) {
          setCooldown(parseInt(match[1], 10));
        }
        setError('');
      } else {
        setError(detail || 'Failed to resend verification email. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 px-4 py-8 sm:py-12 overflow-hidden">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-surface-200 dark:border-surface-800 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white mb-2">
              Email verified!
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mb-6 text-sm sm:text-base">
              Your email has been verified. You can now access all features.
            </p>
            <Link to="/login" className="btn-marsana inline-block">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 px-4 py-8 sm:py-12 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-surface-200 dark:border-surface-800">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-marsana-100 dark:bg-marsana-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-marsana-500" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Verify your email</h1>
            <p className="text-surface-600 dark:text-surface-400 mt-2 text-sm sm:text-base">
              Enter the verification code sent to your email address.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl mb-4">
              Verification email sent! Check your inbox.
            </div>
          )}

          {!token && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setResendSuccess(false);
                }}
                className="input-premium"
                placeholder="Enter your email address"
                required
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Verification code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-premium text-center text-lg tracking-widest"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-marsana w-full">
              {loading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
            Didn't receive the code?{' '}
            {email ? (
              <button
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {resending
                  ? 'Sending...'
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend code'}
              </button>
            ) : (
              <span className="text-surface-400 dark:text-surface-500">Enter your email above to resend</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
