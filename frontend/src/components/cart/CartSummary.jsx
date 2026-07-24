import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

export default function CartSummary() {
  const { cart } = useCart();
  const summary = cart?.summary;

  if (!summary) return null;

  const freeShippingThreshold = 50;
  const subtotalForFreeShipping = Math.max(freeShippingThreshold - summary.subtotal, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-surface-900 dark:text-white">Order Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-surface-500 dark:text-surface-400">
            Subtotal ({summary.item_count} {summary.item_count === 1 ? 'item' : 'items'})
          </span>
          <span className="font-semibold text-surface-900 dark:text-white">{formatPrice(summary.subtotal)}</span>
        </div>

        {summary.discount_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-accent-emerald">Discount ({summary.coupon_code})</span>
            <span className="font-semibold text-accent-emerald">
              -{formatPrice(summary.discount_amount)}
            </span>
          </div>
        )}

        {summary.gift_card_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-accent-violet">Gift Card</span>
            <span className="font-semibold text-accent-violet">
              -{formatPrice(summary.gift_card_amount)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-surface-500 dark:text-surface-400">Estimated Shipping</span>
          <span className="font-semibold text-surface-900 dark:text-white">
            {summary.subtotal >= freeShippingThreshold && summary.estimated_shipping === 0
              ? 'Free'
              : formatPrice(summary.estimated_shipping)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-surface-500 dark:text-surface-400">Estimated Tax</span>
          <span className="font-semibold text-surface-900 dark:text-white">
            {formatPrice(summary.estimated_tax)}
          </span>
        </div>

        {subtotalForFreeShipping > 0 && (
          <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl">
            <p className="text-xs text-accent-emerald font-medium">
              Add {formatPrice(subtotalForFreeShipping)} more for free shipping!
            </p>
            <div className="mt-2 w-full bg-accent-emerald/20 rounded-full h-1.5">
              <div
                className="bg-accent-emerald h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((summary.subtotal / freeShippingThreshold) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-surface-900 dark:text-white">Total</span>
            <span className="text-lg font-bold text-surface-900 dark:text-white">
              {formatPrice(summary.total)}
            </span>
          </div>
        </div>
      </div>

      <Link
        to="/checkout"
        className="w-full btn-marsana py-3.5 text-base font-semibold block text-center min-h-[48px]"
      >
        Proceed to Checkout
      </Link>

      <p className="text-xs text-surface-400 dark:text-surface-500 text-center">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
}
