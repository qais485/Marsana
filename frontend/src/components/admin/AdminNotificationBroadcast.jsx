import { useState } from 'react';
import { adminNotificationService } from '../../services/api/adminNotificationService';
import { Loader2, Radio } from 'lucide-react';

const NOTIFICATION_TYPES = [
  { value: 'order', label: 'Order' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'security', label: 'Security' },
  { value: 'system', label: 'System' },
];

const TARGETS = [
  { value: 'all', label: 'All Users' },
  { value: 'active', label: 'Active Users' },
  { value: 'inactive', label: 'Inactive Users' },
];

export default function AdminNotificationBroadcast({ onSent }) {
  const [form, setForm] = useState({
    title: '',
    message: '',
    notification_type: 'system',
    target: 'all',
    send_email: false,
    send_push: false,
    send_in_app: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResult(null);
    setLoading(true);

    try {
      const response = await adminNotificationService.broadcastNotification(form);
      if (response.success) {
        setSuccess('Notification broadcasted successfully');
        setResult(response.data);
        setForm({
          title: '',
          message: '',
          notification_type: 'system',
          target: 'all',
          send_email: false,
          send_push: false,
          send_in_app: true,
        });
        onSent?.();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to broadcast notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-surface-100 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-surface-900 mb-4 sm:mb-6">Broadcast Notification</h3>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          {success}
          {result && (
            <div className="mt-2 text-sm">
              <p>Sent to {result.total_users} users</p>
              <p>In-App: {result.in_app_sent} | Email: {result.email_sent}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Target Audience *</label>
          <select
            name="target"
            value={form.target}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-marsana-500 focus:border-marsana-500"
          >
            {TARGETS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-marsana-500 focus:border-marsana-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Message *</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-marsana-500 focus:border-marsana-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Type *</label>
          <select
            name="notification_type"
            value={form.notification_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-marsana-500 focus:border-marsana-500"
          >
            {NOTIFICATION_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg hover:bg-surface-50 cursor-pointer">
            <input
              type="checkbox"
              name="send_in_app"
              checked={form.send_in_app}
              onChange={handleChange}
              className="rounded border-surface-300 text-marsana-600 focus:ring-marsana-500 flex-shrink-0"
            />
            <span className="text-sm text-surface-700">In-App</span>
          </label>
          <label className="flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg hover:bg-surface-50 cursor-pointer">
            <input
              type="checkbox"
              name="send_email"
              checked={form.send_email}
              onChange={handleChange}
              className="rounded border-surface-300 text-marsana-600 focus:ring-marsana-500 flex-shrink-0"
            />
            <span className="text-sm text-surface-700">Email</span>
          </label>
          <label className="flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg hover:bg-surface-50 cursor-pointer">
            <input
              type="checkbox"
              name="send_push"
              checked={form.send_push}
              onChange={handleChange}
              className="rounded border-surface-300 text-marsana-600 focus:ring-marsana-500 flex-shrink-0"
            />
            <span className="text-sm text-surface-700">Push</span>
          </label>
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
          Broadcast Notification
        </button>
      </form>
    </div>
  );
}
