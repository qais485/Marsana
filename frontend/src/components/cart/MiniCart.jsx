import { ShoppingCart, X, Trash2, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

export default function MiniCart({ isOpen, onClose }) {
  const { cart, removeFromCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-full sm:max-w-md bg-white dark:bg-surface-950 shadow-premium-xl z-50 flex flex-col animate-cart-slide">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-marsana-500 to-accent-violet flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white">
                Your Cart
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {cart.summary?.item_count || 0} items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                <ShoppingBag className="w-9 h-9 text-surface-300 dark:text-surface-600" />
              </div>
              <p className="text-surface-600 dark:text-surface-400 font-medium mb-1">
                Your cart is empty
              </p>
              <p className="text-sm text-surface-400 dark:text-surface-500 mb-6">
                Add some items to get started
              </p>
              <button
                onClick={onClose}
                className="btn-marsana text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-surface-50 dark:bg-surface-900 rounded-2xl group/item hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-surface-100 dark:bg-surface-800 rounded-lg sm:rounded-xl overflow-hidden">
                    <img
                      src={item.product_image || 'https://placehold.co/80x80/e2e8f0/94a3b8?text=No+Image'}
                      alt={item.product_name}
                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-marsana-600 dark:text-marsana-400 mt-1">
                      {formatPrice(item.product_price * item.quantity)}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await removeFromCart(item.id);
                      } catch (error) {
                        console.error('Failed to remove item:', error);
                      }
                    }}
                    className="p-2 text-surface-400 hover:text-accent-rose hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-all duration-200 self-start min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-surface-100 dark:border-surface-800 p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500 dark:text-surface-400">Subtotal</span>
                <span className="font-semibold text-surface-900 dark:text-white">
                  {formatPrice(cart.summary?.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-surface-900 dark:text-white">Total</span>
                <span className="font-bold text-surface-900 dark:text-white">
                  {formatPrice(cart.summary?.total || 0)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={onClose}
              className="w-full btn-marsana flex items-center justify-center gap-2 py-3 sm:py-3.5 min-h-[48px]"
            >
              Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/cart"
              onClick={onClose}
              className="w-full btn-ghost py-3 block text-center min-h-[44px] flex items-center justify-center"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
