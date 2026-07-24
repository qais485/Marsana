import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/api/profileService';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteAccountSection() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isConfirmed = confirmation === 'DELETE_MY_ACCOUNT';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfirmed) {
      setMessage({ type: 'error', text: 'Please type DELETE_MY_ACCOUNT to confirm' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await profileService.deleteAccount({ password, confirmation });
      await logout();
      navigate('/login');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to delete account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-red-200 dark:border-red-800/50 p-6 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">Delete Account</h2>
          <p className="text-sm text-red-600 dark:text-red-400/80">This action cannot be undone</p>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6 border border-red-100 dark:border-red-800/30">
        <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Before you delete your account:</h3>
        <ul className="text-sm text-red-700 dark:text-red-400/90 space-y-1 list-disc list-inside">
          <li>All your data will be permanently removed</li>
          <li>Your order history will be lost</li>
          <li>Your saved addresses and wishlist will be deleted</li>
          <li>You will be logged out immediately</li>
          <li>This action is irreversible</li>
        </ul>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'
        } transition-all duration-300`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Enter your password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-premium"
            placeholder="Your current password"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Type <span className="font-mono font-bold text-red-600 dark:text-red-400">DELETE_MY_ACCOUNT</span> to confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="input-premium"
            placeholder="DELETE_MY_ACCOUNT"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-2xl font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          disabled={loading || !password || !isConfirmed}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Permanently Delete My Account
        </button>
      </form>
    </div>
  );
}
