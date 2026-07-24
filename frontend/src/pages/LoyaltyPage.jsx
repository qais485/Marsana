import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coins, ArrowLeft, Loader2, TrendingUp, TrendingDown, Gift, AlertCircle } from 'lucide-react';
import { promotionService } from '../services/api/promotionService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

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
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-marsana-100 dark:bg-marsana-900/30 flex items-center justify-center mx-auto mb-6">
            <Coins className="w-10 h-10 text-marsana-500" />
          </div>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
            Sign in to view loyalty points
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mb-4">
            Earn points on every purchase
          </p>
          <Link to="/login" className="btn-marsana">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-marsana-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link
            to="/dashboard"
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
            Loyalty Points
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 text-center shadow-sm">
            <Coins className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
              {balance?.points_balance || 0}
            </div>
            <div className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Available Points</div>
            <div className="text-xs text-surface-400 dark:text-surface-500 mt-1">
              Worth ${((balance?.points_balance || 0) / 100).toFixed(2)}
            </div>
          </div>
          <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 text-center shadow-sm">
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {balance?.lifetime_earned || 0}
            </div>
            <div className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Lifetime Earned</div>
          </div>
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 text-center shadow-sm col-span-2 lg:col-span-1">
            <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
              {balance?.lifetime_redeemed || 0}
            </div>
            <div className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Lifetime Redeemed</div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-3 sm:mb-4">Redeem Points</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
            100 points = $1.00 discount. Redeem your points at checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              placeholder="Points to redeem"
              className="input-premium w-full sm:max-w-xs"
              min={1}
              max={balance?.points_balance || 0}
            />
            <button
              onClick={handleRedeem}
              disabled={redeeming || !redeemAmount}
              className="btn-marsana min-h-[44px]"
            >
              {redeeming ? 'Redeeming...' : 'Redeem'}
            </button>
          </div>
          {redeemAmount && parseInt(redeemAmount) > 0 && (
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">
              This will give you a ${(parseInt(redeemAmount) / 100).toFixed(2)} discount
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 shadow-sm">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-3 sm:mb-4">
            Transaction History
          </h3>
          {transactions.length === 0 ? (
            <p className="text-surface-500 dark:text-surface-400 text-center py-4">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-surface-50 dark:border-surface-800 last:border-0 gap-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {tx.transaction_type === 'earned' ? (
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      tx.transaction_type === 'earned'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {tx.transaction_type === 'earned' ? '+' : '-'}{tx.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
