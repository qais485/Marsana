import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Loader2, Mail, Hash, ArrowLeft } from 'lucide-react';
import { checkoutService } from '../services/api/checkoutService';
import { formatPrice, STATUS_COLORS } from '../utils/format';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SEO from '../components/seo/SEO';

export default function OrderTrackingPage() {
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!email || !orderNumber) return;

    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      const response = await checkoutService.trackOrder(email, orderNumber);
      if (response.success) {
        setOrder(response.data);
      } else {
        setError('Order not found. Please check your email and order number.');
        setOrder(null);
      }
    } catch {
      setError('Order not found. Please check your email and order number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 overflow-x-hidden">
      <SEO title="Track Order" noindex />
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-marsana-600 dark:text-surface-400 dark:hover:text-marsana-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-marsana-100 dark:bg-marsana-900/30 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-marsana-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-2">
            Track Your Order
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Enter your email and order number to check the status of your order.
          </p>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 mb-8 shadow-sm">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-premium pl-10 w-full min-h-[44px]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Order Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="ORD-20260715-0001"
                  required
                  className="input-premium pl-10 w-full min-h-[44px]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email || !orderNumber}
              className="btn-marsana w-full flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Track Order
            </button>
          </form>
        </div>

        {error && searched && (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 text-center shadow-sm">
            <p className="text-surface-500 dark:text-surface-400">{error}</p>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Order Number</p>
                  <p className="text-lg font-bold text-surface-900 dark:text-white">
                    {order.order_number}
                  </p>
                </div>
                <span
                  className={`self-start px-3 py-1 rounded-full text-sm font-medium capitalize whitespace-nowrap ${
                    STATUS_COLORS[order.status] || 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="border-t border-surface-100 dark:border-surface-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Order Date</span>
                  <span className="text-surface-900 dark:text-white">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Total</span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Items</span>
                  <span className="text-surface-900 dark:text-white">{order.item_count}</span>
                </div>
                {order.tracking_number && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500 dark:text-surface-400">Tracking Number</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {order.tracking_number}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {order.status_history && order.status_history.length > 0 && (
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                  Status History
                </h2>
                <div className="space-y-3">
                  {order.status_history.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-marsana-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">
                          {entry.status}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {new Date(entry.created_at).toLocaleString()}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Shipping Details
              </h2>
              <div className="text-sm text-surface-600 dark:text-surface-400">
                <p className="font-medium text-surface-900 dark:text-white">
                  {order.shipping_name}
                </p>
                <p>{order.shipping_address}</p>
                <p>
                  {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                </p>
                <p>{order.shipping_country}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
