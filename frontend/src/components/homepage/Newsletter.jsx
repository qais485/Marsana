import { useState, useEffect } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { homeService } from '../../services/api/homeService';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const response = await homeService.subscribeNewsletter(email);
      setStatus('success');
      setMessage(response.message || 'Successfully subscribed!');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-12 bg-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500 rounded-full mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-primary-100 mb-6">
            Get the latest updates on new products and upcoming sales
          </p>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-2 text-white">
              <CheckCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-red-200 text-sm mt-3">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
