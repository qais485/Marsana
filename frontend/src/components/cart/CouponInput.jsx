import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CouponInput() {
  const { cart, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const hasCoupon = cart.summary?.coupon_code;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      await applyCoupon(code.trim());
      setMessage('Coupon applied successfully');
      setIsError(false);
      setCode('');
    } catch (err) {
      setMessage(err.message || 'Invalid coupon code');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeCoupon();
      setMessage(null);
    } catch {
      setMessage('Failed to remove coupon');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (hasCoupon) {
    return (
      <div className="flex items-center justify-between p-2.5 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
        <div className="flex items-center gap-2 min-w-0">
          <Tag className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400 truncate">
            {cart.summary.coupon_code}
          </span>
        </div>
        <button
          onClick={handleRemove}
          disabled={loading}
          className="p-1.5 sm:p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleApply} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          className="input-premium flex-1 text-xs sm:text-sm min-h-[44px]"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="btn-marsana text-xs sm:text-sm px-3 sm:px-4 min-h-[44px]"
        >
          {loading ? 'Applying...' : 'Apply'}
        </button>
      </form>
      {message && (
        <p className={`text-[10px] sm:text-xs mt-1.5 ${isError ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
