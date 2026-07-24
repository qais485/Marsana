import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { adminUserService } from '../../services/api/adminUserService';
import {
  Loader2,
  ArrowLeft,
  Save,
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
  Mail,
  Calendar,
} from 'lucide-react';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [blockConfirm, setBlockConfirm] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await adminUserService.getUser(id);
        if (response.success) {
          setUser(response.data);
          setFormData({
            first_name: response.data.first_name || '',
            last_name: response.data.last_name || '',
            email: response.data.email || '',
            role: response.data.role || 'user',
          });
        }
      } catch {
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const response = await adminUserService.updateUser(id, formData);
      if (response.success) {
        setUser(response.data);
        setSuccess('User updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const response = await adminUserService.toggleUserActive(id);
      if (response.success) {
        setUser(response.data);
        setBlockConfirm(false);
        const action = response.data.is_active ? 'unblocked' : 'blocked';
        setSuccess(`User ${action} successfully`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError('Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-marsana-600 dark:text-marsana-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-surface-500 dark:text-surface-400 mb-4">User not found</p>
          <Link to="/admin/users" className="btn-marsana text-sm">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <header className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link to="/admin/users" className="text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-300 flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white truncate">Edit User</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setBlockConfirm(true)}
                className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 ${
                  user.is_active
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                }`}
              >
                {user.is_active ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                {user.is_active ? 'Block User' : 'Unblock User'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-red-200 dark:border-red-800 p-3 sm:p-4 mb-6 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-green-200 dark:border-green-800 p-4 mb-6 text-green-700 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-marsana-100 dark:bg-marsana-900/30 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-marsana-700 dark:text-marsana-400">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-surface-500 dark:text-surface-400">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <Calendar className="h-4 w-4" />
              <span>Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                user.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
              }`}>
                {user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                {user.is_active ? 'Active' : 'Blocked'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                user.is_email_verified ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-300'
              }`}>
                {user.is_email_verified ? 'Email Verified' : 'Email Unverified'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Edit User Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input-premium w-full px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input-premium w-full px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-premium w-full px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-premium w-full px-3 py-2 text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link to="/admin/users" className="btn-outline text-sm">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn-marsana flex items-center gap-2 text-sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>

      {blockConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-sm w-full mx-4 border border-surface-200 dark:border-surface-800">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              {user.is_active ? 'Block User' : 'Unblock User'}
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-6">
              {user.is_active
                ? `Are you sure you want to block ${user.first_name} ${user.last_name}? They will not be able to log in.`
                : `Are you sure you want to unblock ${user.first_name} ${user.last_name}? They will be able to log in again.`
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBlockConfirm(false)} className="btn-outline text-sm">Cancel</button>
              <button
                onClick={handleToggleActive}
                className={`px-4 py-2 rounded-xl text-sm text-white transition-all duration-300 ${
                  user.is_active ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {user.is_active ? 'Block' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
