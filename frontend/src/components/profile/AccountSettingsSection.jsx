import { useState, useEffect } from 'react';
import { profileService } from '../../services/api/profileService';
import { Loader2, Save } from 'lucide-react';

export default function AccountSettingsSection() {
  const [settings, setSettings] = useState({
    email_notifications: true,
    order_updates: true,
    promotional_emails: false,
    security_alerts: true,
    language: 'en',
    currency: 'USD',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await profileService.getAccountSettings();
        setSettings(response.data);
      } catch {
        setMessage({ type: 'error', text: 'Failed to load account settings' });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await profileService.updateAccountSettings(settings);
      setMessage({ type: 'success', text: 'Account settings updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
          <div className="space-y-3">
            <ToggleSetting
              label="Email notifications"
              description="Receive general notifications via email"
              enabled={settings.email_notifications}
              onToggle={() => handleToggle('email_notifications')}
            />
            <ToggleSetting
              label="Order updates"
              description="Get notified about order status changes"
              enabled={settings.order_updates}
              onToggle={() => handleToggle('order_updates')}
            />
            <ToggleSetting
              label="Promotional emails"
              description="Receive deals, offers, and marketing emails"
              enabled={settings.promotional_emails}
              onToggle={() => handleToggle('promotional_emails')}
            />
            <ToggleSetting
              label="Security alerts"
              description="Important security notifications about your account"
              enabled={settings.security_alerts}
              onToggle={() => handleToggle('security_alerts')}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Language</label>
              <select name="language" value={settings.language} onChange={handleChange} className="input-field">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select name="currency" value={settings.currency} onChange={handleChange} className="input-field">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SAR">SAR (﷼)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

function ToggleSetting({ label, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          enabled ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
