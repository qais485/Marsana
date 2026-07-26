import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkoutService } from '../services/api/checkoutService';
import { formatPrice } from '../utils/format';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SEO from '../components/seo/SEO';

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
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <p className="text-surface-500 dark:text-surface-400 mb-4">Sign in to view invoice</p>
          <Link to="/login" className="btn-marsana">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 overflow-x-hidden">
      <SEO title="Invoice" noindex />
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/orders/${id}`}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-marsana-600 dark:text-surface-400 dark:hover:text-marsana-400 mb-6 no-print transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Order
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-marsana-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-surface-500 dark:text-surface-400 mb-4">{error}</p>
            <Link to={`/orders/${id}`} className="btn-marsana">View Order</Link>
          </div>
        ) : invoice ? (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-8 print:border-0 print:rounded-none print:shadow-none shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">INVOICE</h1>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                  Order #{invoice.order_number}
                </p>
              </div>
              <div className="flex flex-row sm:flex-row gap-4 sm:gap-6 sm:text-right">
                <div>
                  <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Date</p>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    {new Date(invoice.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Status</p>
                  <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">
                    {invoice.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Payment</p>
                  <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">
                    {invoice.payment_status}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div>
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-2 uppercase tracking-wide">
                  Bill To
                </h3>
                <div className="text-sm text-surface-600 dark:text-surface-400">
                  <p className="font-medium text-surface-900 dark:text-white">
                    {invoice.billing_name || invoice.shipping_name}
                  </p>
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
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-2 uppercase tracking-wide">
                  Ship To
                </h3>
                <div className="text-sm text-surface-600 dark:text-surface-400">
                  <p className="font-medium text-surface-900 dark:text-white">
                    {invoice.shipping_name}
                  </p>
                  <p>{invoice.shipping_address}</p>
                  <p>
                    {invoice.shipping_city}, {invoice.shipping_state} {invoice.shipping_postal_code}
                  </p>
                  <p>{invoice.shipping_country}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 sm:mb-8 overflow-x-auto">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3 uppercase tracking-wide">
                Items
              </h3>
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide py-2">
                      Item
                    </th>
                    <th className="text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide py-2">
                      Qty
                    </th>
                    <th className="text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide py-2">
                      Unit Price
                    </th>
                    <th className="text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide py-2">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-surface-100 dark:border-surface-800">
                      <td className="py-3">
                        <p className="text-sm font-medium text-surface-900 dark:text-white">
                          {item.product_name}
                        </p>
                        {item.product_sku && (
                          <p className="text-xs text-surface-500 dark:text-surface-400">
                            SKU: {item.product_sku}
                          </p>
                        )}
                      </td>
                      <td className="py-3 text-center text-sm text-surface-600 dark:text-surface-400">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right text-sm text-surface-600 dark:text-surface-400">
                        {formatPrice(item.unit_price)}
                      </td>
                      <td className="py-3 text-right text-sm font-medium text-surface-900 dark:text-white">
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
                  <span className="text-surface-500 dark:text-surface-400">Subtotal</span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {formatPrice(invoice.subtotal)}
                  </span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">Discount</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      -{formatPrice(invoice.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Shipping</span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {invoice.shipping_cost === 0 ? 'Free' : formatPrice(invoice.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Tax</span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {formatPrice(invoice.tax_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-surface-200 dark:border-surface-700">
                  <span className="text-surface-900 dark:text-white">Total</span>
                  <span className="text-surface-900 dark:text-white">
                    {formatPrice(invoice.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700 text-center no-print">
              <button
                onClick={handlePrint}
                className="btn-marsana inline-flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700 text-center">
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Payment Method:{' '}
                {invoice.payment_method === 'cod'
                  ? 'Cash on Delivery'
                  : invoice.payment_method === 'credit_card'
                  ? 'Credit Card'
                  : 'PayPal'}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                Thank you for your purchase!
              </p>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
