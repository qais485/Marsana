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
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkoutService } from '../services/api/checkoutService';
import DeliveryTrackingSection from '../components/orders/DeliveryTrackingSection';
import { formatPrice, STATUS_COLORS } from '../utils/format';

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
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <XCircle className="w-5 h-5 text-gray-500" />
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-xl font-bold text-primary-600">E-Commerce</Link>
            </div>
          </div>
        </header>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view order</h1>
            <Link to="/login" className="btn-primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-600">E-Commerce</Link>
            <nav className="flex items-center gap-4">
              <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">Products</Link>
              <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">Orders</Link>
              <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">Profile</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/orders"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">{error}</p>
            <Link to="/orders" className="btn-primary">View Orders</Link>
          </div>
        ) : order ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order {order.order_number}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
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
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {order.status.replace('_', ' ')}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/orders/${id}/invoice`}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                View Invoice
              </Link>

              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Order
                </button>
              )}

              {canReturnOrExchange && (
                <>
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Return
                  </button>
                  <button
                    onClick={() => setShowExchangeModal(true)}
                    className="btn-secondary flex items-center gap-2 text-sm"
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

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
                  <div className="space-y-3">
                    {order.status_history.map((entry) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {entry.status.replace('_', ' ')}
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
              </>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={item.product_image || 'https://placehold.co/64x64/e2e8f0/94a3b8?text=No+Image'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      {item.product_sku && (
                        <p className="text-xs text-gray-500">SKU: {item.product_sku}</p>
                      )}
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(item.unit_price)}</p>
                      <p className="text-sm text-gray-500">each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(order.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">Shipping Address</h3>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{order.shipping_name}</p>
                  <p>{order.shipping_address}</p>
                  <p>
                    {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                  </p>
                  <p>{order.shipping_country}</p>
                  {order.shipping_phone && <p className="mt-1">Phone: {order.shipping_phone}</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">Payment Info</h3>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">
                    {order.payment_method === 'cod'
                      ? 'Cash on Delivery'
                      : order.payment_method === 'credit_card'
                      ? 'Credit Card'
                      : 'PayPal'}
                  </p>
                  <p>Status: <span className="capitalize">{order.payment_status}</span></p>
                  {order.tracking_number && (
                    <p className="mt-2">
                      Tracking: <span className="font-medium">{order.tracking_number}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Order Notes</h3>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        ) : null}
      </main>

      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Order">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select a reason</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowCancelModal(false)} className="btn-secondary">
              Keep Order
            </button>
            <button
              onClick={handleCancel}
              disabled={!cancelReason || actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Cancel Order
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title="Request Return">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Request a return for your order. Returns must be requested within 30 days of delivery.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select a reason</option>
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={returnDescription}
              onChange={(e) => setReturnDescription(e.target.value)}
              className="input-field w-full"
              rows={3}
              placeholder="Please describe the issue in detail..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowReturnModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleReturn}
              disabled={!returnReason || !returnDescription || actionLoading}
              className="btn-primary flex items-center gap-2"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Submit Request
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showExchangeModal} onClose={() => setShowExchangeModal(false)} title="Request Exchange">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Request an exchange for an item. Exchanges must be requested within 30 days of delivery.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Item *</label>
            <select
              value={exchangeItemId}
              onChange={(e) => setExchangeItemId(e.target.value)}
              className="input-field w-full"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <select
              value={exchangeReason}
              onChange={(e) => setExchangeReason(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select a reason</option>
              {EXCHANGE_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What would you like instead? *</label>
            <textarea
              value={exchangeDescription}
              onChange={(e) => setExchangeDescription(e.target.value)}
              className="input-field w-full"
              rows={3}
              placeholder="Please describe what you would like instead..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowExchangeModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleExchange}
              disabled={!exchangeItemId || !exchangeReason || !exchangeDescription || actionLoading}
              className="btn-primary flex items-center gap-2"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Submit Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
