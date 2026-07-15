import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkoutService } from '../services/api/checkoutService';
import { formatPrice } from '../utils/format';

export default function InvoicePage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await checkoutService.getInvoice(id);
        if (!cancelled) {
          if (response.success) {
            setInvoice(response.data);
          } else {
            setError('Invoice not found');
          }
        }
      } catch {
        if (!cancelled) setError('Invoice not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, id]);

  const handlePrint = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Sign in to view invoice</p>
            <Link to="/login" className="btn-primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-600">E-Commerce</Link>
            <div className="flex items-center gap-3">
              <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/orders/${id}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 no-print"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Order
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">{error}</p>
            <Link to={`/orders/${id}`} className="btn-primary">View Order</Link>
          </div>
        ) : invoice ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 print:border-0 print:rounded-none print:shadow-none">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-sm text-gray-500 mt-1">Order #{invoice.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(invoice.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-2">Status</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{invoice.status}</p>
                <p className="text-sm text-gray-500 mt-2">Payment</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{invoice.payment_status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                  Bill To
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{invoice.billing_name || invoice.shipping_name}</p>
                  <p>{invoice.billing_address || invoice.shipping_address}</p>
                  <p>
                    {invoice.billing_city || invoice.shipping_city},{' '}
                    {invoice.billing_state || invoice.shipping_state}{' '}
                    {invoice.billing_postal_code || invoice.shipping_postal_code}
                  </p>
                  <p>{invoice.billing_country || invoice.shipping_country}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                  Ship To
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{invoice.shipping_name}</p>
                  <p>{invoice.shipping_address}</p>
                  <p>
                    {invoice.shipping_city}, {invoice.shipping_state} {invoice.shipping_postal_code}
                  </p>
                  <p>{invoice.shipping_country}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Items
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2">
                      Item
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide py-2">
                      Qty
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide py-2">
                      Unit Price
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide py-2">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                        {item.product_sku && (
                          <p className="text-xs text-gray-500">SKU: {item.product_sku}</p>
                        )}
                      </td>
                      <td className="py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                      <td className="py-3 text-right text-sm text-gray-600">
                        {formatPrice(item.unit_price)}
                      </td>
                      <td className="py-3 text-right text-sm font-medium text-gray-900">
                        {formatPrice(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(invoice.subtotal)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(invoice.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {invoice.shipping_cost === 0 ? 'Free' : formatPrice(invoice.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(invoice.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(invoice.total_amount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Payment Method:{' '}
                {invoice.payment_method === 'cod'
                  ? 'Cash on Delivery'
                  : invoice.payment_method === 'credit_card'
                  ? 'Credit Card'
                  : 'PayPal'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Thank you for your purchase!
              </p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
