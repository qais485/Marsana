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
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h2>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
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

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Privacy Note</p>
              <p className="text-sm text-gray-600 mt-1">
                Your privacy is important to us. These settings control what information is visible
                to other users on your public profile. Sensitive information like your password and
                payment details are never shared.
              </p>
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
