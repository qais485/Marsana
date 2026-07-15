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
      await profileService.deleteAccount({ password, confirmation: confirmationText });
      await logout();
      navigate('/login');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to delete account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-red-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-red-900">Delete Account</h2>
          <p className="text-sm text-red-600">This action cannot be undone</p>
        </div>
      </div>

      <div className="bg-red-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-red-800 mb-2">Before you delete your account:</h3>
        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
          <li>All your data will be permanently removed</li>
          <li>Your order history will be lost</li>
          <li>Your saved addresses and wishlist will be deleted</li>
          <li>You will be logged out immediately</li>
          <li>This action is irreversible</li>
        </ul>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Enter your password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Your current password"
            required
          />
        </div>

        <div>
          <label className="label">
            Type <span className="font-mono font-bold text-red-600">DELETE_MY_ACCOUNT</span> to confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="input-field"
            placeholder="DELETE_MY_ACCOUNT"
            required
          />
        </div>

        <button
          type="submit"
          className="btn-danger flex items-center gap-2 w-full justify-center"
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
