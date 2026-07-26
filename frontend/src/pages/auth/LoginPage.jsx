import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api/authService';
import { AlertCircle, ArrowRight } from 'lucide-react';
import SEO from '../../components/seo/SEO';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setLoading(true);

    try {
      const result = await authService.socialLogin({
        provider: 'google',
        access_token: response.credential,
        device_name: 'web-browser',
        device_type: 'web',
      });

      if (result.success) {
        const { access_token, refresh_token, user: userData } = result.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(userData));
        login(userData);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Client ID not configured.');
      return;
    }

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      }
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 px-4 py-8 sm:py-12 overflow-hidden">
      <SEO title="Sign In" noindex />
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-surface-200 dark:border-surface-800">
          <div className="text-center mb-6 sm:mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold mb-4 sm:mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-marsana-500 to-marsana-800 flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="bg-gradient-to-r from-marsana-600 to-violet-600 bg-clip-text text-transparent">
                Marsana
              </span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Welcome back</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm sm:text-base">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <div className="w-5 h-5 border-2 border-surface-300 border-t-marsana-600 rounded-full animate-spin" />
                <span className="text-sm text-surface-500">Signing in with Google...</span>
              </div>
            )}
            <div ref={googleButtonRef} className="w-full" />
          </div>

          <p className="mt-8 text-center text-xs text-surface-400 dark:text-surface-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
