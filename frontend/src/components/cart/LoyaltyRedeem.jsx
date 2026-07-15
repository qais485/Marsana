import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { promotionService } from '../../services/api/promotionService';
import { useAuth } from '../../context/AuthContext';

const LOYALTY_POINTS_PER_DOLLAR = 100;

export default function LoyaltyRedeem() {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(null);
  const [points, setPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      promotionService.getLoyaltyBalance().then((res) => {
        if (res.success) setBalance(res.data);
      }).catch((error) => {
        console.error('Failed to load loyalty balance:', error);
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !balance || balance.points_balance === 0) return null;

  const handleRedeem = async () => {
    const pts = parseInt(points);
    if (!pts || pts <= 0) return;
    setLoading(true);
    setMessage(null);
    try {
      await promotionService.redeemLoyaltyPoints(pts);
      setMessage(`Redeemed ${pts} points ($${(pts / LOYALTY_POINTS_PER_DOLLAR).toFixed(2)} discount)`);
      setIsError(false);
      setPoints('');
      const res = await promotionService.getLoyaltyBalance();
      if (res.success) setBalance(res.data);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to redeem points');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Coins className="w-4 h-4 text-yellow-600" />
        <span className="text-sm font-medium text-yellow-800">
          {balance.points_balance} points available (${(balance.points_balance / LOYALTY_POINTS_PER_DOLLAR).toFixed(2)})
        </span>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="Points to redeem"
          className="input-field flex-1 text-sm"
          min={1}
          max={balance.points_balance}
        />
        <button
          onClick={handleRedeem}
          disabled={loading || !points}
          className="btn-primary text-sm px-3"
        >
          {loading ? '...' : 'Redeem'}
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-1.5 ${isError ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
