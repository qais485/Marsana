import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Loader2, Mail, Hash, ArrowLeft } from 'lucide-react';
import { checkoutService } from '../services/api/checkoutService';
import { formatPrice, STATUS_COLORS } from '../utils/format';

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-600">E-Commerce</Link>
            <nav className="flex items-center gap-4">
              <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">Products</Link>
              <Link to="/track-order" className="text-sm font-medium text-primary-600">Track Order</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="text-center mb-8">
          <Package className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500">
            Enter your email and order number to check the status of your order.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="ORD-20260715-0001"
                  required
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email || !orderNumber}
              className="btn-primary w-full flex items-center justify-center gap-2"
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
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="text-lg font-bold text-gray-900">{order.order_number}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Date</span>
                  <span>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items</span>
                  <span>{order.item_count}</span>
                </div>
                {order.tracking_number && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tracking Number</span>
                    <span className="font-medium">{order.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>

            {order.status_history && order.status_history.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
                <div className="space-y-3">
                  {order.status_history.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {entry.status}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.created_at).toLocaleString()}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Details</h2>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">{order.shipping_name}</p>
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
    </div>
  );
}
