import { useState } from 'react';
import { Minus, Plus, Trash2, Bookmark } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart, saveForLater } = useCart();
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (delta) => {
    if (updating) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (newQty > item.product_max_quantity) return;
    setUpdating(true);
    try {
      await updateQuantity(item.id, newQty);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeFromCart(item.id);
    } catch {
      // Error handled by CartContext
    }
  };

  const handleSaveForLater = async () => {
    try {
      await saveForLater(item.id);
    } catch {
      // Error handled by CartContext
    }
  };

  return (
    <div className="flex gap-3 sm:gap-4 py-4 border-b border-surface-100 dark:border-surface-800 last:border-0">
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 bg-surface-100 dark:bg-surface-800 rounded-2xl overflow-hidden">
        <img
          src={item.product_image || 'https://placehold.co/150x150/e2e8f0/94a3b8?text=No+Image'}
          alt={item.product_name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white truncate">
              {item.product_name}
            </h3>
            {item.product_sku && (
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">SKU: {item.product_sku}</p>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-200 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1 || updating || !item.product_in_stock}
              className="px-3 py-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-2 text-sm font-medium text-surface-900 dark:text-white min-w-[2.5rem] text-center border-x border-surface-200 dark:border-surface-700">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={item.quantity >= item.product_max_quantity || updating || !item.product_in_stock}
              className="px-3 py-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveForLater}
              className="text-xs text-surface-500 dark:text-surface-400 hover:text-marsana-600 dark:hover:text-marsana-400 flex items-center gap-1.5 transition-colors min-h-[44px] min-w-[44px] justify-center"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save for later</span>
              <span className="sm:hidden">Save</span>
            </button>
            <span className="text-sm font-bold text-surface-900 dark:text-white">
              {formatPrice(item.product_price * item.quantity)}
            </span>
          </div>
        </div>

        {!item.product_in_stock && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2">Out of stock</p>
        )}
        {item.quantity >= item.product_max_quantity && item.product_max_quantity < 99 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Max quantity reached ({item.product_max_quantity} available)
          </p>
        )}
      </div>
    </div>
  );
}
