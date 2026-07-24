import { Bookmark, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

export default function SavedForLater() {
  const { cart, moveToCart, removeSavedItem } = useCart();

  if (!cart.saved_items || cart.saved_items.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 lg:mt-8">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-surface-600 dark:text-surface-400" />
        <h2 className="text-base sm:text-lg font-semibold text-surface-900 dark:text-white">
          Saved for Later ({cart.saved_items.length})
        </h2>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {cart.saved_items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl sm:rounded-2xl shadow-sm transition-all duration-300"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-surface-100 dark:bg-surface-800 rounded-lg sm:rounded-xl overflow-hidden">
              <img
                src={item.product_image || 'https://placehold.co/100x100/e2e8f0/94a3b8?text=No+Image'}
                alt={item.product_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-medium text-surface-900 dark:text-white truncate">
                {item.product_name}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-surface-900 dark:text-white mt-0.5 sm:mt-1">
                {formatPrice(item.product_price)}
              </p>
              <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                <button
                  onClick={async () => {
                    try {
                      await moveToCart(item.id);
                    } catch (error) {
                      console.error('Failed to move to cart:', error);
                    }
                  }}
                  className="text-[10px] sm:text-xs text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 flex items-center gap-1 font-medium transition-all duration-300 min-h-[44px] min-w-[44px] justify-center"
                >
                  <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Move to Cart</span>
                  <span className="sm:hidden">Move</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await removeSavedItem(item.id);
                    } catch (error) {
                      console.error('Failed to remove saved item:', error);
                    }
                  }}
                  className="text-[10px] sm:text-xs text-surface-500 dark:text-surface-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-all duration-300 min-h-[44px] min-w-[44px] justify-center"
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
