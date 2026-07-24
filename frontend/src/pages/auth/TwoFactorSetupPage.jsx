import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api/authService';
import { Shield, ArrowLeft, Copy, CheckCircle } from 'lucide-react';

export default function TwoFactorSetupPage() {
  const [step, setStep] = useState('verify-password');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [setupData, setSetupData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.enable2FA(password);
      setSetupData(result.data);
      setStep('scan-qr');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid password.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.verify2FA(code);
      setSetupData((prev) => ({ ...prev, verificationResult: result.data }));
      setStep('complete');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 px-4 py-8 sm:py-12 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-surface-200 dark:border-surface-800">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-surface-600 dark:text-surface-400 hover:text-marsana-600 dark:hover:text-marsana-400 mb-4 sm:mb-6 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          {step === 'verify-password' && (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-marsana-100 dark:bg-marsana-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-marsana-500" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">
                  Enable two-factor authentication
                </h1>
                <p className="text-surface-600 dark:text-surface-400 mt-2 text-sm sm:text-base">
                  Add an extra layer of security to your account.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Confirm your password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-premium"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-marsana w-full">
                  {loading ? 'Verifying...' : 'Continue'}
                </button>
              </form>
            </>
          )}

          {step === 'scan-qr' && setupData && (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">
                  Set up authenticator
                </h1>
                <p className="text-surface-600 dark:text-surface-400 mt-2 text-sm sm:text-base">
                  Scan this QR code with your authenticator app.
                </p>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="bg-white dark:bg-surface-800 p-3 sm:p-4 rounded-xl border border-surface-200 dark:border-surface-700 mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.provisioning_uri)}`}
                    alt="QR Code"
                    className="w-40 h-40 sm:w-48 sm:h-48"
                  />
                </div>

                <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                  Or enter this code manually:
                </p>
                <div className="flex items-center gap-2 max-w-full">
                  <code className="bg-surface-100 dark:bg-surface-800 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-mono text-surface-900 dark:text-white truncate">
                    {setupData.secret}
                  </code>
                  <button
                    onClick={copySecret}
                    className="text-surface-500 dark:text-surface-400 hover:text-marsana-600 dark:hover:text-marsana-400 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-4">
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
                  {loading ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </form>

              {setupData.backup_codes && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                    Backup codes
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                    Save these codes in a safe place. Each can be used once if you lose access to your
                    authenticator.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {setupData.backup_codes.map((backupCode, i) => (
                      <code
                        key={i}
                        className="text-xs sm:text-sm font-mono bg-white dark:bg-surface-800 px-2 py-1 rounded-lg text-surface-900 dark:text-white truncate"
                      >
                        {backupCode}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'complete' && (
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white mb-2">2FA enabled!</h2>
              <p className="text-surface-600 dark:text-surface-400 mb-6 text-sm sm:text-base">
                Two-factor authentication is now active on your account.
              </p>
              <button onClick={() => navigate('/dashboard')} className="btn-marsana">
                Go to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
