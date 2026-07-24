import { useState, useEffect } from 'react';
import { profileService } from '../../services/api/profileService';
import { Shield, Loader2, Save } from 'lucide-react';

export default function PrivacySettingsSection() {
  const [settings, setSettings] = useState({
    show_email: false,
    show_phone: false,
    show_address: false,
    profile_visible: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await profileService.getPrivacySettings();
        setSettings(response.data);
      } catch {
        setMessage({ type: 'error', text: 'Failed to load privacy settings' });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await profileService.updatePrivacySettings(settings);
      setMessage({ type: 'success', text: 'Privacy settings updated successfully' });
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
      <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Privacy Settings</h2>

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
        <div className="space-y-3">
          <ToggleSetting
            label="Profile visibility"
            description="Allow others to see your profile"
            enabled={settings.profile_visible}
            onToggle={() => handleToggle('profile_visible')}
          />
          <ToggleSetting
            label="Show email address"
            description="Display your email on your public profile"
            enabled={settings.show_email}
            onToggle={() => handleToggle('show_email')}
          />
          <ToggleSetting
            label="Show phone number"
            description="Display your phone number on your public profile"
            enabled={settings.show_phone}
            onToggle={() => handleToggle('show_phone')}
          />
          <ToggleSetting
            label="Show address"
            description="Display your address on your public profile"
            enabled={settings.show_address}
            onToggle={() => handleToggle('show_address')}
          />
        </div>

        <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700/50">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-surface-500 dark:text-surface-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">Privacy Note</p>
              <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                Your privacy is important to us. These settings control what information is visible
                to other users on your public profile. Sensitive information like your password and
                payment details are never shared.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-marsana flex items-center gap-2" disabled={saving}>
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
    <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl transition-all duration-300">
      <div>
        <p className="font-medium text-surface-900 dark:text-white">{label}</p>
        <p className="text-sm text-surface-600 dark:text-surface-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-marsana-500/30 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-surface-900 ${
          enabled ? 'bg-marsana-600' : 'bg-surface-200 dark:bg-surface-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-all duration-300 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
