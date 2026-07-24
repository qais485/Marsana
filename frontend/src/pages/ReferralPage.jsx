import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { promotionService } from '../services/api/promotionService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

export default function ReferralPage() {
  const { user, isAuthenticated } = useAuth();
  const [referralCode, setReferralCode] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codeRes, rewardsRes] = await Promise.all([
        promotionService.getReferralCode(),
        promotionService.getReferralRewards(),
      ]);
      if (codeRes.success) setReferralCode(codeRes.data);
      if (rewardsRes.success) setRewards(rewardsRes.data);
    } catch {
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleCopy = async () => {
    const link = `${window.location.origin}/referral/${referralCode?.code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    if (!applyCode.trim()) return;
    setApplying(true);
    try {
      const response = await promotionService.applyReferral(applyCode.trim());
      if (response.success) {
        setApplyCode('');
        fetchData();
        alert('Referral applied! You received 500 bonus points.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply referral code');
    } finally {
      setApplying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-marsana-100 dark:bg-marsana-900/30 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-marsana-500" />
          </div>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
            Sign in to access referrals
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mb-4">
            Invite friends and earn rewards
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

  const referralLink = referralCode
    ? `${window.location.origin}/referral/${referralCode.code}`
    : '';

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
            Refer a Friend
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-3 sm:mb-4">
              Your Referral Link
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
              Share this link with friends. When they make their first purchase, you both earn 500
              points!
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="input-premium flex-1 text-sm font-mono"
              />
              <button
                onClick={handleCopy}
                className="btn-marsana flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {referralCode && (
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-3">
                Or share code:{' '}
                <span className="font-mono font-semibold text-marsana-600 dark:text-marsana-400">
                  {referralCode.code}
                </span>
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-3 sm:mb-4">
              Have a Referral Code?
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
              Enter a friend's code to get 500 bonus points.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={applyCode}
                onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="input-premium flex-1"
              />
              <button
                onClick={handleApply}
                disabled={applying || !applyCode}
                className="btn-marsana shrink-0 min-h-[44px]"
              >
                {applying ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 shadow-sm">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-3 sm:mb-4">Referral Stats</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-center p-3 sm:p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">
                {referralCode?.total_referrals || 0}
              </div>
              <div className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">
                Friends Referred
              </div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-marsana-600 dark:text-marsana-400">
                {referralCode?.successful_referrals || 0}
              </div>
              <div className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">
                Successful Signups
              </div>
            </div>
          </div>

          <h4 className="font-medium text-surface-900 dark:text-white mb-3">Reward History</h4>
          {rewards.length === 0 ? (
            <p className="text-surface-500 dark:text-surface-400 text-sm">
              No referral rewards yet. Start inviting friends!
            </p>
          ) : (
            <div className="space-y-2">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between py-2 border-b border-surface-50 dark:border-surface-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {reward.description}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {new Date(reward.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +{reward.points}
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
