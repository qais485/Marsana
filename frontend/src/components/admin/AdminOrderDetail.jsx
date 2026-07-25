import { useState, useEffect } from 'react';
import { adminOrderService } from '../../services/api/adminOrderService';
import { escapeHtml } from '../../utils/security';
import {
  Loader2,
  X,
  Package,
  Truck,
  FileText,
  RotateCcw,
  Save,
  Printer,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const STATUS_COLORS = {
  pending: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  processing: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  shipped: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  delivered: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  cancelled: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  refunded: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-400',
};

export default function AdminOrderDetail({ order: initialOrder, onClose, onRefresh }) {
  const [order, setOrder] = useState(initialOrder);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('details');
  const [statusForm, setStatusForm] = useState({ status: '', note: '', tracking_number: '', shipping_carrier: '' });
  const [refundForm, setRefundForm] = useState({ refund_amount: '', refund_reason: '' });
  const [notesForm, setNotesForm] = useState({ admin_notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialOrder?.id) return;
    let cancelled = false;
    const fetchOrder = async () => {
      try {
        const response = await adminOrderService.getOrder(initialOrder.id);
        if (!cancelled && response.success) {
          setOrder(response.data);
          setNotesForm({ admin_notes: response.data.admin_notes || '' });
        }
      } catch {
        if (!cancelled) setError('Failed to load order details');
      }
    };
    fetchOrder();
    return () => { cancelled = true; };
  }, [initialOrder?.id]);

  const handleStatusUpdate = async () => {
    if (!statusForm.status) {
      setError('Please select a status');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await adminOrderService.updateOrderStatus(order.id, statusForm);
      if (response.success) {
        setOrder(response.data);
        setStatusForm({ status: '', note: '', tracking_number: '', shipping_carrier: '' });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async () => {
    if (!refundForm.refund_amount || !refundForm.refund_reason) {
      setError('Please fill in all refund fields');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await adminOrderService.refundOrder(order.id, {
        refund_amount: parseFloat(refundForm.refund_amount),
        refund_reason: refundForm.refund_reason,
      });
      if (response.success) {
        setOrder(response.data);
        setRefundForm({ refund_amount: '', refund_reason: '' });
        setActiveSection('details');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process refund');
    } finally {
      setSaving(false);
    }
  };

  const handleNotesUpdate = async () => {
    setSaving(true);
    setError(null);
    try {
      await adminOrderService.updateOrderNotes(order.id, notesForm);
      setOrder({ ...order, admin_notes: notesForm.admin_notes });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update notes');
    } finally {
      setSaving(false);
    }
  };

  const printInvoice = () => {
    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`
      <html><head><title>Invoice ${escapeHtml(order.order_number)}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; }
        .info { margin-bottom: 20px; }
        .info p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f5f5f5; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
      </style></head><body>
        <div class="header">
          <div class="title">INVOICE</div>
          <div>
            <p><strong>Order:</strong> ${escapeHtml(order.order_number)}</p>
            <p><strong>Date:</strong> ${escapeHtml(order.created_at ? new Date(order.created_at).toLocaleDateString() : '')}</p>
          </div>
        </div>
        <div class="info">
          <p><strong>Ship To:</strong></p>
          <p>${escapeHtml(order.shipping_name)}</p>
          <p>${escapeHtml(order.shipping_address)}</p>
          <p>${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_state)} ${escapeHtml(order.shipping_postal_code)}</p>
          <p>${escapeHtml(order.shipping_country)}</p>
        </div>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>
            ${(order.items || []).map(item => `<tr><td>${escapeHtml(item.product_name)}</td><td>${escapeHtml(item.quantity)}</td><td>$${escapeHtml((item.unit_price || 0).toFixed(2))}</td><td>$${escapeHtml((item.total_price || 0).toFixed(2))}</td></tr>`).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Subtotal: $${escapeHtml((order.subtotal || 0).toFixed(2))}</p>
          <p>Tax: $${escapeHtml((order.tax_amount || 0).toFixed(2))}</p>
          <p>Shipping: $${escapeHtml((order.shipping_cost || 0).toFixed(2))}</p>
          ${order.discount_amount > 0 ? `<p>Discount: -$${escapeHtml((order.discount_amount || 0).toFixed(2))}</p>` : ''}
          <p><strong>Total: $${escapeHtml((order.total_amount || 0).toFixed(2))}</strong></p>
        </div>
        <div class="footer"><p>Thank you for your order!</p></div>
      </body></html>
    `);
    invoiceWindow.document.close();
    invoiceWindow.print();
  };

  const printShippingLabel = () => {
    const labelWindow = window.open('', '_blank');
    labelWindow.document.write(`
      <html><head><title>Shipping Label ${escapeHtml(order.order_number)}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; border: 2px solid #000; }
        .from, .to { margin-bottom: 20px; }
        .label { font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 5px; }
        .name { font-size: 18px; font-weight: bold; }
        .address { font-size: 14px; line-height: 1.4; }
        .tracking { margin-top: 20px; padding-top: 10px; border-top: 1px dashed #000; }
        .tracking-number { font-family: monospace; font-size: 14px; }
      </style></head><body>
        <div class="from">
          <div class="label">From</div>
          <div class="address">E-Commerce Store<br>123 Commerce St<br>New York, NY 10001</div>
        </div>
        <div class="to">
          <div class="label">Ship To</div>
          <div class="name">${escapeHtml(order.shipping_name)}</div>
          <div class="address">
            ${escapeHtml(order.shipping_address)}<br>
            ${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_state)} ${escapeHtml(order.shipping_postal_code)}<br>
            ${escapeHtml(order.shipping_country)}
          </div>
        </div>
        <div class="tracking">
          <div class="label">Tracking</div>
          <div class="tracking-number">${escapeHtml(order.tracking_number) || 'Not assigned'}</div>
          <div class="label" style="margin-top: 5px;">Carrier</div>
          <div>${escapeHtml(order.shipping_carrier) || 'Not assigned'}</div>
        </div>
      </body></html>
    `);
    labelWindow.document.close();
    labelWindow.print();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300">
              <X className="h-5 w-5" />
            </button>
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Order {order.order_number}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={printInvoice} className="btn-outline flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Invoice
            </button>
            <button onClick={printShippingLabel} className="btn-outline flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping Label
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 dark:hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2 border-b border-surface-200 dark:border-surface-800 pb-2 overflow-x-auto">
        {[
          { id: 'details', label: 'Details', icon: Package },
          { id: 'status', label: 'Update Status', icon: Clock },
          { id: 'refund', label: 'Refund', icon: RotateCcw },
          { id: 'notes', label: 'Notes', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all duration-300 ${
              activeSection === tab.id
                ? 'bg-marsana-50 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-400 font-medium'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
            <h4 className="font-medium text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items
            </h4>
            <div className="space-y-2">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-surface-100 dark:border-surface-800">
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">{item.product_name}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Qty: {item.quantity} x ${(item.unit_price || 0).toFixed(2)}</p>
                  </div>
                  <span className="font-medium text-surface-900 dark:text-white">${(item.total_price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-800 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-surface-500 dark:text-surface-400">Subtotal</span><span className="text-surface-900 dark:text-white">${(order.subtotal || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500 dark:text-surface-400">Tax</span><span className="text-surface-900 dark:text-white">${(order.tax_amount || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500 dark:text-surface-400">Shipping</span><span className="text-surface-900 dark:text-white">${(order.shipping_cost || 0).toFixed(2)}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-green-600 dark:text-green-400"><span>Discount</span><span>-${(order.discount_amount || 0).toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-1"><span className="text-surface-900 dark:text-white">Total</span><span className="text-surface-900 dark:text-white">${(order.total_amount || 0).toFixed(2)}</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
              <h4 className="font-medium text-surface-900 dark:text-white mb-3">Shipping Address</h4>
              <div className="text-sm text-surface-700 dark:text-surface-300 space-y-1">
                <p className="font-medium">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                <p>{order.shipping_country}</p>
                {order.shipping_phone && <p className="text-surface-500 dark:text-surface-400">{order.shipping_phone}</p>}
              </div>
            </div>

            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
              <h4 className="font-medium text-surface-900 dark:text-white mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipping Info
              </h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-surface-500 dark:text-surface-400">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                </div>
                <div className="flex justify-between"><span className="text-surface-500 dark:text-surface-400">Payment</span>
                  <span className="font-medium text-surface-900 dark:text-white">{order.payment_status}</span>
                </div>
                <div className="flex justify-between"><span className="text-surface-500 dark:text-surface-400">Method</span>
                  <span className="text-surface-900 dark:text-white">{order.payment_method || '-'}</span>
                </div>
                <div className="flex justify-between"><span className="text-surface-500 dark:text-surface-400">Tracking</span>
                  <span className="font-mono text-xs text-surface-900 dark:text-white">{order.tracking_number || '-'}</span>
                </div>
                <div className="flex justify-between"><span className="text-surface-500 dark:text-surface-400">Carrier</span>
                  <span className="text-surface-900 dark:text-white">{order.shipping_carrier || '-'}</span>
                </div>
              </div>
            </div>

            {order.status_history && order.status_history.length > 0 && (
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm">
                <h4 className="font-medium text-surface-900 dark:text-white mb-3">Status History</h4>
                <div className="space-y-2">
                  {order.status_history.map((h) => (
                    <div key={h.id} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[h.status] || 'bg-surface-100 dark:bg-surface-800'}`}>{h.status}</span>
                        {h.note && <p className="text-surface-500 dark:text-surface-400 text-xs mt-1">{h.note}</p>}
                        <p className="text-surface-400 dark:text-surface-500 text-xs">{h.created_at ? new Date(h.created_at).toLocaleString() : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'status' && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
          <h4 className="font-medium text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Update Order Status
          </h4>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">New Status *</label>
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                className="input-premium"
              >
                <option value="">Select status...</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            {(statusForm.status === 'shipped' || statusForm.status === 'processing') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={statusForm.tracking_number}
                    onChange={(e) => setStatusForm({ ...statusForm, tracking_number: e.target.value })}
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Shipping Carrier</label>
                  <input
                    type="text"
                    value={statusForm.shipping_carrier}
                    onChange={(e) => setStatusForm({ ...statusForm, shipping_carrier: e.target.value })}
                    className="input-premium"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Note (optional)</label>
              <textarea
                value={statusForm.note}
                onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                rows={3}
                className="input-premium"
              />
            </div>
            <button
              onClick={handleStatusUpdate}
              disabled={saving || !statusForm.status}
              className="btn-marsana flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Update Status
            </button>
          </div>
        </div>
      )}

      {activeSection === 'refund' && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
          <h4 className="font-medium text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Refund Order
          </h4>
          {order.status === 'refunded' ? (
            <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl text-sm">
              <p className="font-medium text-surface-900 dark:text-white">This order has been refunded.</p>
              <p className="text-surface-500 dark:text-surface-400 mt-1">Amount: ${(order.refund_amount || 0).toFixed(2)}</p>
              {order.refund_reason && <p className="text-surface-500 dark:text-surface-400">Reason: {order.refund_reason}</p>}
            </div>
          ) : order.status === 'cancelled' ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-sm text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Cannot refund a cancelled order.
            </div>
          ) : (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Refund Amount *</label>
                <input
                  type="number"
                  value={refundForm.refund_amount}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_amount: e.target.value })}
                  max={order.total_amount}
                  step="0.01"
                  className="input-premium"
                />
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">Max: ${(order.total_amount || 0).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Reason *</label>
                <textarea
                  value={refundForm.refund_reason}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_reason: e.target.value })}
                  rows={3}
                  className="input-premium"
                />
              </div>
              <button
                onClick={handleRefund}
                disabled={saving || !refundForm.refund_amount || !refundForm.refund_reason}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-xl text-sm hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-all duration-300 flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Process Refund
              </button>
            </div>
          )}
        </div>
      )}

      {activeSection === 'notes' && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
          <h4 className="font-medium text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Admin Notes
          </h4>
          <div className="space-y-4 max-w-md">
            <textarea
              value={notesForm.admin_notes}
              onChange={(e) => setNotesForm({ admin_notes: e.target.value })}
              rows={5}
              placeholder="Add internal notes about this order..."
              className="input-premium"
            />
            <button
              onClick={handleNotesUpdate}
              disabled={saving}
              className="btn-marsana flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}