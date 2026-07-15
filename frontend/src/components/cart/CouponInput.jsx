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
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            {cart.summary.coupon_code}
          </span>
        </div>
        <button
          onClick={handleRemove}
          disabled={loading}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
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
          className="input-field flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="btn-primary text-sm px-4"
        >
          {loading ? 'Applying...' : 'Apply'}
        </button>
      </form>
      {message && (
        <p className={`text-xs mt-1.5 ${isError ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
