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
      const payload = {
        ...formData,
        date_of_birth: formData.date_of_birth || null,
      };
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
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
                  {formData.first_name?.[0]}{formData.last_name?.[0]}
                </span>
              </div>
            )}
            {/* Placeholder for future avatar upload functionality */}
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-50"
              title="Upload avatar (coming soon)"
            >
              <Camera className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <label className="label">Avatar URL</label>
            <input
              type="url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="input-field"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="input-field"
            rows={3}
            maxLength={500}
            placeholder="Tell us about yourself..."
          />
          <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
