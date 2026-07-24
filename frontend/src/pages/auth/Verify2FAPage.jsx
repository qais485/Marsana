import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api/client';
import { Shield } from 'lucide-react';

export default function Verify2FAPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const tempToken = location.state?.tempToken;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-2fa', { temp_token: tempToken, code });
      if (response.data?.success) {
        navigate('/dashboard');
      } else {
        setError(response.data?.detail || 'Invalid verification code');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 px-4 py-8 sm:py-12 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-surface-200 dark:border-surface-800">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-marsana-100 dark:bg-marsana-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-marsana-500" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">
              Two-Factor Authentication
            </h1>
            <p className="text-surface-600 dark:text-surface-400 mt-2 text-sm sm:text-base">
              Enter the code from your authenticator app
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
