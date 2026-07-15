import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/api/authService';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
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
      <div className="page-container">
        <div className="form-container">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been verified. You can now access all features.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
            <p className="text-gray-600 mt-2">
              Enter the verification code sent to your email address.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              Verification email sent! Check your inbox.
            </div>
          )}

          {!token && (
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setResendSuccess(false);
                }}
                className="input-field"
                placeholder="Enter your email address"
                required
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="code" className="label">Verification code</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-field text-center text-lg tracking-widest"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Didn&apos;t receive the code?{' '}
            {email ? (
              <button
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending
                  ? 'Sending...'
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend code'}
              </button>
            ) : (
              <span className="text-gray-400">Enter your email above to resend</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
