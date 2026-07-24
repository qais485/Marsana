import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api/authService';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 px-4 py-8 sm:py-12 overflow-hidden">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-surface-200 dark:border-surface-800 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-marsana-100 dark:bg-marsana-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-marsana-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white mb-2">
              Check your email
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mb-6 text-sm sm:text-base">
              If an account exists with <strong className="text-surface-900 dark:text-white">{email}</strong>, we've sent a password reset link.
            </p>
            <Link to="/login" className="btn-marsana inline-block">
              Back to login
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
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-surface-600 dark:text-surface-400 hover:text-marsana-600 dark:hover:text-marsana-400 mb-4 sm:mb-6 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">
              Forgot your password?
            </h1>
            <p className="text-surface-600 dark:text-surface-400 mt-2 text-sm sm:text-base">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium !pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-marsana w-full">
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
            Remember your password?{' '}
            <Link to="/login" className="text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
