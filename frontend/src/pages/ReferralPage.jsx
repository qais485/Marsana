import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, Copy, Check } from 'lucide-react';
import { promotionService } from '../services/api/promotionService';
import { useAuth } from '../context/AuthContext';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to access referrals</h2>
          <p className="text-gray-500 mb-4">Invite friends and earn rewards</p>
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

  const referralLink = referralCode ? `${window.location.origin}/referral/${referralCode.code}` : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Refer a Friend</h1>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Referral Link</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with friends. When they make their first purchase, you both earn 500 points!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="input-field flex-1 text-sm font-mono"
              />
              <button onClick={handleCopy} className="btn-primary flex items-center gap-2 shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {referralCode && (
              <p className="text-xs text-gray-500 mt-3">
                Or share code: <span className="font-mono font-semibold text-primary-600">{referralCode.code}</span>
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Have a Referral Code?</h3>
            <p className="text-sm text-gray-600 mb-4">Enter a friend&apos;s code to get 500 bonus points.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={applyCode}
                onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="input-field flex-1"
              />
              <button onClick={handleApply} disabled={applying || !applyCode} className="btn-primary shrink-0">
                {applying ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Referral Stats</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{referralCode?.total_referrals || 0}</div>
              <div className="text-sm text-gray-500">Friends Referred</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{referralCode?.successful_referrals || 0}</div>
              <div className="text-sm text-gray-500">Successful Signups</div>
            </div>
          </div>

          <h4 className="font-medium text-gray-900 mb-3">Reward History</h4>
          {rewards.length === 0 ? (
            <p className="text-gray-500 text-sm">No referral rewards yet. Start inviting friends!</p>
          ) : (
            <div className="space-y-2">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{reward.description}</p>
                    <p className="text-xs text-gray-500">{new Date(reward.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-green-600">+{reward.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
