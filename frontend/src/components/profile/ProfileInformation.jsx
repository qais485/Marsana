import { useState, useEffect } from 'react';
import { profileService } from '../../services/api/profileService';
import { Camera, Save, Loader2 } from 'lucide-react';

export default function ProfileInformation({ onUpdate }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    bio: '',
    gender: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileService.getProfile();
        const { user: userData, profile } = response.data;
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone_number: profile.phone_number || '',
          date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
          bio: profile.bio || '',
          gender: profile.gender || '',
          avatar_url: profile.avatar_url || '',
        });
      } catch {
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {};
      for (const [key, value] of Object.entries(formData)) {
        if (key === 'date_of_birth') {
          payload.date_of_birth = value || null;
        } else if (value !== '') {
          payload[key] = value;
        }
      }
      await profileService.updateProfile(payload);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      if (onUpdate) onUpdate();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile' });
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
      <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Profile Information</h2>

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
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-surface-200 dark:border-surface-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-marsana-100 dark:bg-marsana-900/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-marsana-600 dark:text-marsana-400">
                  {formData.first_name?.[0]}{formData.last_name?.[0]}
                </span>
              </div>
            )}
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-white dark:bg-surface-800 rounded-full p-1.5 shadow-md border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Upload avatar (coming soon)"
            >
              <Camera className="h-4 w-4 text-surface-500 dark:text-surface-400" />
            </button>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Avatar URL</label>
            <input
              type="url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              className="input-premium w-full"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="input-premium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="input-premium"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="input-premium"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="input-premium"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-premium"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="input-premium"
            rows={3}
            maxLength={500}
            placeholder="Tell us about yourself..."
          />
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{formData.bio.length}/500 characters</p>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-marsana flex items-center gap-2 w-full sm:w-auto justify-center min-h-[44px]" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
