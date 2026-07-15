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
    <div className="page-container">
      <div className="form-container">
        <div className="card">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          {step === 'verify-password' && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Enable two-factor authentication</h1>
                <p className="text-gray-600 mt-2">
                  Add an extra layer of security to your account.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <div>
                  <label htmlFor="password" className="label">Confirm your password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Verifying...' : 'Continue'}
                </button>
              </form>
            </>
          )}

          {step === 'scan-qr' && setupData && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Set up authenticator</h1>
                <p className="text-gray-600 mt-2">
                  Scan this QR code with your authenticator app.
                </p>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <img
                    // SECURITY NOTE: Using a third-party QR code service sends the TOTP secret
                    // URI to an external server. For production, use a local QR code library
                    // (e.g., qrcode.react or qr-code-styling) to generate QR codes client-side.
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.provisioning_uri)}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>

                <p className="text-sm text-gray-600 mb-2">Or enter this code manually:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                    {setupData.secret}
                  </code>
                  <button
                    onClick={copySecret}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-4">
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
                  {loading ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </form>

              {setupData.backup_codes && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">Backup codes</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Save these codes in a safe place. Each can be used once if you lose access to your authenticator.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {setupData.backup_codes.map((backupCode, i) => (
                      <code key={i} className="text-sm font-mono bg-white px-2 py-1 rounded">
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">2FA enabled!</h2>
              <p className="text-gray-600 mb-6">
                Two-factor authentication is now active on your account.
              </p>
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Go to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
