import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coins, ArrowLeft, Loader2, TrendingUp, TrendingDown, Gift } from 'lucide-react';
import { promotionService } from '../services/api/promotionService';
import { useAuth } from '../context/AuthContext';

export default function LoyaltyPage() {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balRes, txRes] = await Promise.all([
        promotionService.getLoyaltyBalance(),
        promotionService.getLoyaltyTransactions(),
      ]);
      if (balRes.success) setBalance(balRes.data);
      if (txRes.success) setTransactions(txRes.data);
    } catch {
      setError('Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleRedeem = async () => {
    const points = parseInt(redeemAmount);
    if (!points || points <= 0) return;
    setRedeeming(true);
    try {
      const response = await promotionService.redeemLoyaltyPoints(points);
      if (response.success) {
        setRedeemAmount('');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to redeem points');
    } finally {
      setRedeeming(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Coins className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view loyalty points</h2>
          <p className="text-gray-500 mb-4">Earn points on every purchase</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Points</h1>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <Coins className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{balance?.points_balance || 0}</div>
            <div className="text-sm text-gray-500">Available Points</div>
            <div className="text-xs text-gray-400 mt-1">Worth ${((balance?.points_balance || 0) / 100).toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-600">{balance?.lifetime_earned || 0}</div>
            <div className="text-sm text-gray-500">Lifetime Earned</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <TrendingDown className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-red-600">{balance?.lifetime_redeemed || 0}</div>
            <div className="text-sm text-gray-500">Lifetime Redeemed</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Redeem Points</h3>
          <p className="text-sm text-gray-600 mb-4">100 points = $1.00 discount. Redeem your points at checkout.</p>
          <div className="flex gap-3">
            <input
              type="number"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              placeholder="Points to redeem"
              className="input-field max-w-xs"
              min={1}
              max={balance?.points_balance || 0}
            />
            <button
              onClick={handleRedeem}
              disabled={redeeming || !redeemAmount}
              className="btn-primary"
            >
              {redeeming ? 'Redeeming...' : 'Redeem'}
            </button>
          </div>
          {redeemAmount && parseInt(redeemAmount) > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              This will give you a ${(parseInt(redeemAmount) / 100).toFixed(2)} discount
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    {tx.transaction_type === 'earned' ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <Gift className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${tx.transaction_type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.transaction_type === 'earned' ? '+' : '-'}{tx.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
