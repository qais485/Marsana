import { useState } from 'react';
import { Gift, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function GiftCardInput() {
  const { cart, applyGiftCard, removeGiftCard } = useCart();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const hasGiftCard = cart.summary?.gift_card_code;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      await applyGiftCard(code.trim());
      setMessage('Gift card applied successfully');
      setIsError(false);
      setCode('');
    } catch (err) {
      setMessage(err.message || 'Invalid gift card');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeGiftCard();
      setMessage(null);
    } catch {
      setMessage('Failed to remove gift card');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (hasGiftCard) {
    return (
      <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            {cart.summary.gift_card_code}
          </span>
        </div>
        <button
          onClick={handleRemove}
          disabled={loading}
          className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
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
          placeholder="Gift card code"
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
