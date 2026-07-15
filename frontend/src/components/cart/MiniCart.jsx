import { ShoppingCart, X, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

export default function MiniCart({ isOpen, onClose }) {
  const { cart, removeFromCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Cart ({cart.summary?.item_count || 0})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <button onClick={onClose} className="btn-primary">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3 border-b border-gray-100">
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.product_image || 'https://placehold.co/80x80/e2e8f0/94a3b8?text=No+Image'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
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
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">
                {formatPrice(cart.summary?.subtotal || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-gray-900">
                {formatPrice(cart.summary?.total || 0)}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="w-full btn-secondary py-3 block text-center"
            >
              View Cart
            </Link>
            <button
              onClick={onClose}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
