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
      <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({summary.item_count} {summary.item_count === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-gray-900">{formatPrice(summary.subtotal)}</span>
        </div>

        {summary.discount_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount ({summary.coupon_code})</span>
            <span className="font-medium text-green-600">
              -{formatPrice(summary.discount_amount)}
            </span>
          </div>
        )}

        {summary.gift_card_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-purple-600">Gift Card</span>
            <span className="font-medium text-purple-600">
              -{formatPrice(summary.gift_card_amount)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estimated Shipping</span>
          <span className="font-medium text-gray-900">
            {summary.subtotal >= freeShippingThreshold && summary.estimated_shipping === 0
              ? 'Free'
              : formatPrice(summary.estimated_shipping)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estimated Tax</span>
          <span className="font-medium text-gray-900">
            {formatPrice(summary.estimated_tax)}
          </span>
        </div>

        {subtotalForFreeShipping > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700">
              Add {formatPrice(subtotalForFreeShipping)} more for free shipping!
            </p>
            <div className="mt-1.5 w-full bg-green-200 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((summary.subtotal / freeShippingThreshold) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900">
              {formatPrice(summary.total)}
            </span>
          </div>
        </div>
      </div>

      <Link
        to="/checkout"
        className="w-full btn-primary py-3 text-base font-semibold mt-4 block text-center"
      >
        Proceed to Checkout
      </Link>

      <p className="text-xs text-gray-500 text-center">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
}
