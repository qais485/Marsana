import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkoutService } from '../services/api/checkoutService';
import { formatPrice, STATUS_COLORS } from '../utils/format';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SEO from '../components/seo/SEO';

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const loadOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await checkoutService.getOrders(page);
      if (response.success) {
        setOrders(response.data || []);
        setPagination(response.pagination || {});
      }
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 overflow-x-hidden">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-marsana-100 dark:bg-marsana-900/30 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-marsana-500" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">
              Sign in to view orders
            </h1>
            <Link to="/login" className="btn-marsana">
              Sign In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 overflow-x-hidden">
      <SEO title="Order History" noindex />
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-marsana-600 dark:text-surface-400 dark:hover:text-marsana-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-8">
          My Orders
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-marsana-500 animate-spin" />
              <div className="absolute inset-0 w-10 h-10 border-2 border-marsana-200 dark:border-marsana-800 rounded-full" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-marsana-50 dark:bg-marsana-950/30 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-marsana-400 dark:text-marsana-500" />
            </div>
            <p className="text-surface-500 dark:text-surface-400 mb-4">{error}</p>
            <button onClick={() => loadOrders()} className="btn-marsana">
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-marsana-50 dark:bg-marsana-950/30 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-marsana-400 dark:text-marsana-500" />
            </div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
              No orders yet
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mb-8">
              Start shopping to place your first order
            </p>
            <Link to="/products" className="btn-marsana">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 hover:shadow-lg hover:border-marsana-200 dark:hover:border-marsana-800 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 sm:gap-4 min-w-0">
                      {order.first_item_image && (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-surface-100 dark:bg-surface-800 rounded-xl overflow-hidden hidden sm:block">
                          <img
                            src={order.first_item_image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-surface-900 dark:text-white">
                          {order.order_number}
                        </p>
                        <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">
                          {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${
                          STATUS_COLORS[order.status] || 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="text-base sm:text-lg font-bold text-surface-900 dark:text-white mt-2">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => loadOrders((pagination?.page || 1) - 1)}
                  disabled={(pagination?.page || 1) <= 1}
                  className="p-2 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                </button>
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Page {pagination?.page || 1} of {pagination?.pages || 1}
                </span>
                <button
                  onClick={() => loadOrders((pagination?.page || 1) + 1)}
                  disabled={(pagination?.page || 1) >= (pagination?.pages || 1)}
                  className="p-2 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
