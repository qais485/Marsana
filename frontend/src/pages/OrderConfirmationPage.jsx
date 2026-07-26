import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../utils/format';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SEO from '../components/seo/SEO';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 overflow-x-hidden">
      <SEO title="Order Confirmed" noindex />
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Thank you for your order. We've received your order and are processing it.
          </p>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Order Number</p>
              <p className="text-lg font-bold text-surface-900 dark:text-white">
                {order.order_number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-surface-500 dark:text-surface-400">Order Date</p>
              <p className="text-sm font-medium text-surface-900 dark:text-white">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-surface-100 dark:border-surface-800 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-marsana-500" />
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-white">Status</p>
                <p className="text-sm text-surface-500 dark:text-surface-400 capitalize">
                  {order.status}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-marsana-500" />
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-white">Payment</p>
                <p className="text-sm text-surface-500 dark:text-surface-400 capitalize">
                  {order.payment_method === 'cod'
                    ? 'Cash on Delivery'
                    : order.payment_method === 'credit_card'
                    ? 'Credit Card'
                    : 'PayPal'}{' '}
                  - {order.payment_status}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Order Items
          </h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl"
              >
                <div className="w-14 h-14 flex-shrink-0 bg-surface-200 dark:bg-surface-700 rounded-xl overflow-hidden">
                  <img
                    src={item.product_image || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=No+Image'}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-surface-900 dark:text-white">
                  {formatPrice(item.total_price)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-surface-100 dark:border-surface-800 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-surface-500 dark:text-surface-400">Subtotal</span>
              <span className="font-medium text-surface-900 dark:text-white">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">Discount</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  -{formatPrice(order.discount_amount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-surface-500 dark:text-surface-400">Shipping</span>
              <span className="font-medium text-surface-900 dark:text-white">
                {order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-500 dark:text-surface-400">Tax</span>
              <span className="font-medium text-surface-900 dark:text-white">
                {formatPrice(order.tax_amount)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-surface-100 dark:border-surface-800">
              <span className="text-surface-900 dark:text-white">Total</span>
              <span className="text-surface-900 dark:text-white">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Shipping Details
          </h2>
          <div className="text-sm text-surface-600 dark:text-surface-400">
            <p className="font-medium text-surface-900 dark:text-white">{order.shipping_name}</p>
            <p>{order.shipping_address}</p>
            <p>
              {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
            </p>
            <p>{order.shipping_country}</p>
            {order.shipping_phone && <p className="mt-1">Phone: {order.shipping_phone}</p>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="btn-marsana flex items-center justify-center gap-2 min-h-[44px]">
            View My Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/products" className="btn-outline flex items-center justify-center gap-2 min-h-[44px]">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link to="/" className="btn-outline flex items-center justify-center min-h-[44px]">
            Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
