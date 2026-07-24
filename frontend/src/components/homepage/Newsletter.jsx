import { useState, useEffect } from 'react';
import { Mail, CheckCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
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
    <section className="py-20 sm:py-28">
      <div className="section-premium">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-marsana-600 via-marsana-700 to-accent-violet p-8 sm:p-12 lg:p-16">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-accent-violet/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent-cyan/20 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-morph" />
            <div className="absolute inset-0 noise-overlay" />
          </div>

          <div className="relative max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-xl rounded-3xl mb-8 border border-white/20">
              <Mail className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Stay in the Loop
            </h2>
            <p className="text-white/70 mb-10 max-w-lg mx-auto text-lg">
              Subscribe to our newsletter for the latest updates on new products and exclusive offers
            </p>

            {status === 'success' ? (
              <div className="flex items-center justify-center gap-3 text-white bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-5 border border-white/20">
                <CheckCircle className="w-5 h-5 text-accent-emerald" />
                <span className="font-medium">{message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="group px-8 py-4 bg-white text-marsana-700 font-semibold rounded-2xl hover:shadow-premium-xl hover:-translate-y-1 transition-all duration-300 ease-out-expo disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="text-white/80 text-sm mt-4">{message}</p>
            )}

            <div className="flex items-center justify-center gap-6 mt-8 text-white/50 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Exclusive offers</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>New arrivals</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>No spam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
