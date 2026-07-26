import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Loader2,
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  XCircle,
  RotateCcw,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkoutService } from '../services/api/checkoutService';
import DeliveryTrackingSection from '../components/orders/DeliveryTrackingSection';
import { formatPrice, STATUS_COLORS } from '../utils/format';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SEO from '../components/seo/SEO';

const CANCEL_REASONS = [
  'Changed my mind',
  'Found a better price',
  'Ordered by mistake',
  'No longer needed',
  'Shipping too slow',
  'Other',
];

const RETURN_REASONS = [
  'Wrong item received',
  'Item damaged/defective',
  'Item not as described',
  'Changed my mind',
  'Quality not as expected',
  'Other',
];

const EXCHANGE_REASONS = [
  'Wrong size',
  'Wrong color',
  'Want different model',
  'Item defective',
  'Other',
];

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-surface-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-surface-200 dark:border-surface-800">
        <div className="flex items-center justify-between p-4 border-b border-surface-100 dark:border-surface-800">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-surface-400" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [cancelReason, setCancelReason] = useState('');
  const [cancelDescription, setCancelDescription] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnItemId, setReturnItemId] = useState('');
  const [exchangeReason, setExchangeReason] = useState('');
  const [exchangeDescription, setExchangeDescription] = useState('');
  const [exchangeItemId, setExchangeItemId] = useState('');

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await checkoutService.getOrder(id);
      if (response.success) {
        setOrder(response.data);
      } else {
        setError('Order not found');
      }
    } catch {
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      loadOrder();
    }
  }, [isAuthenticated, id]);

  const handleCancel = async () => {
    if (!cancelReason) return;
    try {
      setActionLoading(true);
      const response = await checkoutService.cancelOrder(id, cancelReason);
      if (response.success) {
        setOrder(response.data);
        setShowCancelModal(false);
        setCancelReason('');
        setCancelDescription('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!returnReason || !returnDescription) return;
    try {
      setActionLoading(true);
      const response = await checkoutService.requestReturn(id, {
        reason: returnReason,
        description: returnDescription,
        order_item_id: returnItemId || null,
      });
      if (response.success) {
        setShowReturnModal(false);
        setReturnReason('');
        setReturnDescription('');
        setReturnItemId('');
        loadOrder();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit return request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExchange = async () => {
    if (!exchangeReason || !exchangeDescription || !exchangeItemId) return;
    try {
      setActionLoading(true);
      const response = await checkoutService.requestExchange(id, {
        order_item_id: exchangeItemId,
        reason: exchangeReason,
        description: exchangeDescription,
      });
      if (response.success) {
        setShowExchangeModal(false);
        setExchangeReason('');
        setExchangeDescription('');
        setExchangeItemId('');
        loadOrder();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit exchange request');
    } finally {
      setActionLoading(false);
    }
  };

  const canCancel = order && ['pending', 'processing'].includes(order.status);
  const canReturnOrExchange = order && order.status === 'delivered';

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
              Sign in to view order
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
      <SEO title="Order Details" noindex />
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/orders"
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-marsana-600 dark:text-surface-400 dark:hover:text-marsana-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

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
            <Link to="/orders" className="btn-marsana">
              View Orders
            </Link>
          </div>
        ) : order ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                  Order {order.order_number}
                </h1>
                <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">
                  Placed on{' '}
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span
                className={`self-start px-3 py-1 rounded-full text-sm font-medium capitalize whitespace-nowrap ${
                  STATUS_COLORS[order.status] || 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                }`}
              >
                {order.status.replace('_', ' ')}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                to={`/orders/${id}/invoice`}
                className="btn-outline flex items-center gap-2 text-sm min-h-[44px]"
              >
                <FileText className="w-4 h-4" />
                View Invoice
              </Link>

              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors min-h-[44px]"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Order
                </button>
              )}

              {canReturnOrExchange && (
                <>
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="btn-outline flex items-center gap-2 text-sm min-h-[44px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Return
                  </button>
                  <button
                    onClick={() => setShowExchangeModal(true)}
                    className="btn-outline flex items-center gap-2 text-sm min-h-[44px]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Request Exchange
                  </button>
                </>
              )}
            </div>

            {order.status_history && order.status_history.length > 0 && (
              <>
                <DeliveryTrackingSection orderId={id} />

                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                    Order Timeline
                  </h2>
                  <div className="space-y-3">
                    {order.status_history.map((entry) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-marsana-500 mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">
                            {entry.status.replace('_', ' ')}
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
              </>
            )}

            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Order Items
              </h2>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-surface-50 dark:bg-surface-800 rounded-xl"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-surface-200 dark:bg-surface-700 rounded-xl overflow-hidden">
                      <img
                        src={item.product_image || 'https://placehold.co/64x64/e2e8f0/94a3b8?text=No+Image'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 dark:text-white truncate">
                        {item.product_name}
                      </p>
                      {item.product_sku && (
                        <p className="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">
                          SKU: {item.product_sku}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-surface-900 dark:text-white text-sm sm:text-base">
                        {formatPrice(item.unit_price)}
                      </p>
                      <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">each</p>
                    </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-surface-400" />
                  <h3 className="font-semibold text-surface-900 dark:text-white">
                    Shipping Address
                  </h3>
                </div>
                <div className="text-sm text-surface-600 dark:text-surface-400">
                  <p className="font-medium text-surface-900 dark:text-white">
                    {order.shipping_name}
                  </p>
                  <p>{order.shipping_address}</p>
                  <p>
                    {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                  </p>
                  <p>{order.shipping_country}</p>
                  {order.shipping_phone && (
                    <p className="mt-1">Phone: {order.shipping_phone}</p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-surface-400" />
                  <h3 className="font-semibold text-surface-900 dark:text-white">Payment Info</h3>
                </div>
                <div className="text-sm text-surface-600 dark:text-surface-400">
                  <p className="font-medium text-surface-900 dark:text-white">
                    {order.payment_method === 'cod'
                      ? 'Cash on Delivery'
                      : order.payment_method === 'credit_card'
                      ? 'Credit Card'
                      : 'PayPal'}
                  </p>
                  <p>
                    Status:{' '}
                    <span className="capitalize text-surface-900 dark:text-white">
                      {order.payment_status}
                    </span>
                  </p>
                  {order.tracking_number && (
                    <p className="mt-2">
                      Tracking:{' '}
                      <span className="font-medium text-surface-900 dark:text-white">
                        {order.tracking_number}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
                  Order Notes
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">{order.notes}</p>
              </div>
            )}
          </div>
        ) : null}
      </main>

      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Order">
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Reason *
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="input-premium w-full"
            >
              <option value="">Select a reason</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowCancelModal(false)} className="btn-outline">
              Keep Order
            </button>
            <button
              onClick={handleCancel}
              disabled={!cancelReason || actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Cancel Order
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title="Request Return">
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Request a return for your order. Returns must be requested within 30 days of delivery.
          </p>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Reason *
            </label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="input-premium w-full"
            >
              <option value="">Select a reason</option>
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Description *
            </label>
            <textarea
              value={returnDescription}
              onChange={(e) => setReturnDescription(e.target.value)}
              className="input-premium w-full"
              rows={3}
              placeholder="Please describe the issue in detail..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowReturnModal(false)} className="btn-outline">
              Cancel
            </button>
            <button
              onClick={handleReturn}
              disabled={!returnReason || !returnDescription || actionLoading}
              className="btn-marsana flex items-center gap-2"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Submit Request
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        title="Request Exchange"
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Request an exchange for an item. Exchanges must be requested within 30 days of delivery.
          </p>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Select Item *
            </label>
            <select
              value={exchangeItemId}
              onChange={(e) => setExchangeItemId(e.target.value)}
              className="input-premium w-full"
            >
              <option value="">Select an item</option>
              {order?.items?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.product_name} (Qty: {item.quantity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Reason *
            </label>
            <select
              value={exchangeReason}
              onChange={(e) => setExchangeReason(e.target.value)}
              className="input-premium w-full"
            >
              <option value="">Select a reason</option>
              {EXCHANGE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              What would you like instead? *
            </label>
            <textarea
              value={exchangeDescription}
              onChange={(e) => setExchangeDescription(e.target.value)}
              className="input-premium w-full"
              rows={3}
              placeholder="Please describe what you would like instead..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowExchangeModal(false)} className="btn-outline">
              Cancel
            </button>
            <button
              onClick={handleExchange}
              disabled={!exchangeItemId || !exchangeReason || !exchangeDescription || actionLoading}
              className="btn-marsana flex items-center gap-2"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Submit Request
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
