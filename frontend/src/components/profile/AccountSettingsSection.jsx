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
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-marsana-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 p-6 transition-all duration-300">
      <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Account Settings</h2>

      {message.text && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'
        } transition-all duration-300`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-surface-900 dark:text-white mb-3">Notifications</h3>
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

        <div className="border-t border-surface-200 dark:border-surface-800 pt-6">
          <h3 className="text-sm font-medium text-surface-900 dark:text-white mb-3">Preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Language</label>
              <select name="language" value={settings.language} onChange={handleChange} className="input-premium">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Currency</label>
              <select name="currency" value={settings.currency} onChange={handleChange} className="input-premium">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SAR">SAR (﷼)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-marsana flex items-center gap-2 w-full sm:w-auto justify-center min-h-[44px]" disabled={saving}>
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
    <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl transition-all duration-300 gap-3">
      <div className="min-w-0">
        <p className="font-medium text-surface-900 dark:text-white">{label}</p>
        <p className="text-sm text-surface-600 dark:text-surface-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-marsana-500/30 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-surface-900 ${
          enabled ? 'bg-marsana-600' : 'bg-surface-200 dark:bg-surface-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition-all duration-300 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
