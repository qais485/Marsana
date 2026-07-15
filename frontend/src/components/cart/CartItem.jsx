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
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={item.product_image || 'https://placehold.co/150x150/e2e8f0/94a3b8?text=No+Image'}
          alt={item.product_name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {item.product_name}
            </h3>
            {item.product_sku && (
              <p className="text-xs text-gray-500 mt-0.5">SKU: {item.product_sku}</p>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1 || updating || !item.product_in_stock}
              className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={item.quantity >= item.product_max_quantity || updating || !item.product_in_stock}
              className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveForLater}
              className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save for later
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(item.product_price * item.quantity)}
            </span>
          </div>
        </div>

        {!item.product_in_stock && (
          <p className="text-xs text-red-500 mt-2">Out of stock</p>
        )}
        {item.quantity >= item.product_max_quantity && item.product_max_quantity < 99 && (
          <p className="text-xs text-orange-500 mt-2">
            Max quantity reached ({item.product_max_quantity} available)
          </p>
        )}
      </div>
    </div>
  );
}
