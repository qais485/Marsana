import { Bookmark, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

export default function SavedForLater() {
  const { cart, moveToCart, removeSavedItem } = useCart();

  if (!cart.saved_items || cart.saved_items.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Bookmark className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Saved for Later ({cart.saved_items.length})
        </h2>
      </div>

      <div className="space-y-3">
        {cart.saved_items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl"
          >
            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={item.product_image || 'https://placehold.co/100x100/e2e8f0/94a3b8?text=No+Image'}
                alt={item.product_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.product_name}
              </h3>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {formatPrice(item.product_price)}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={async () => {
                    try {
                      await moveToCart(item.id);
                    } catch (error) {
                      console.error('Failed to move to cart:', error);
                    }
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Move to Cart
                </button>
                <button
                  onClick={async () => {
                    try {
                      await removeSavedItem(item.id);
                    } catch (error) {
                      console.error('Failed to remove saved item:', error);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
