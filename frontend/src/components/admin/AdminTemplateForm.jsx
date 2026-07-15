import { useState, useEffect } from 'react';
import { adminNotificationService } from '../../services/api/adminNotificationService';
import { Loader2, X } from 'lucide-react';

const NOTIFICATION_TYPES = [
  { value: 'order', label: 'Order' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'security', label: 'Security' },
  { value: 'system', label: 'System' },
];

const CHANNELS = [
  { value: 'all', label: 'All Channels' },
  { value: 'in_app', label: 'In-App Only' },
  { value: 'email', label: 'Email Only' },
  { value: 'push', label: 'Push Only' },
];

const DEFAULT_FORM = {
  name: '',
  slug: '',
  description: '',
  subject: '',
  title_template: '',
  message_template: '',
  notification_type: 'order',
  channel: 'all',
  is_active: true,
  send_email: true,
  send_push: true,
  send_in_app: true,
};

export default function AdminTemplateForm({ template, onSave, onCancel }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name || '',
        slug: template.slug || '',
        description: template.description || '',
        subject: template.subject || '',
        title_template: template.title_template || '',
        message_template: template.message_template || '',
        notification_type: template.notification_type || 'order',
        channel: template.channel || 'all',
        is_active: template.is_active ?? true,
        send_email: template.send_email ?? true,
        send_push: template.send_push ?? true,
        send_in_app: template.send_in_app ?? true,
      });
    }
  }, [template]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    setForm(prev => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (template) {
        await adminNotificationService.updateTemplate(template.id, form);
      } else {
        await adminNotificationService.createTemplate(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {template ? 'Edit Template' : 'Create Template'}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
              required
              readOnly={!!template}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject *</label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Order Confirmation - {{order_number}}"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notification Title *</label>
          <input
            type="text"
            name="title_template"
            value={form.title_template}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Order Confirmed"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message Template *</label>
          <textarea
            name="message_template"
            value={form.message_template}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Your order {{order_number}} has been placed successfully. Total: ${{total_amount}}"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Use {'{{variable}}'} for dynamic values</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              name="notification_type"
              value={form.notification_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {NOTIFICATION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel *</label>
            <select
              name="channel"
              value={form.channel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {CHANNELS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="send_in_app"
              checked={form.send_in_app}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">In-App</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="send_email"
              checked={form.send_email}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Email</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="send_push"
              checked={form.send_push}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Push</span>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {template ? 'Update Template' : 'Create Template'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
