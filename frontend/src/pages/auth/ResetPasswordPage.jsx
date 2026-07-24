import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/api/authService';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
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
              Password reset successful
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mb-6 text-sm sm:text-base">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Link to="/login" className="btn-marsana inline-block">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 px-4 py-8 sm:py-12 overflow-hidden">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-surface-200 dark:border-surface-800 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white mb-2">
              Invalid reset link
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mb-6 text-sm sm:text-base">
              This password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password" className="btn-marsana inline-block">
              Request new link
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
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">
              Reset your password
            </h1>
            <p className="text-surface-600 dark:text-surface-400 mt-2 text-sm sm:text-base">
              Enter your new password below
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pl-10 pr-10"
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-premium pl-10"
                  placeholder="Repeat your password"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-marsana w-full">
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
