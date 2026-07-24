import { useState, useEffect } from 'react';
import { profileService } from '../../services/api/profileService';
import { Plus, Edit2, Trash2, MapPin, Loader2, Star } from 'lucide-react';

const EMPTY_ADDRESS = {
  address_type: 'shipping',
  label: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  is_default: false,
};

export default function AddressManagement() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_ADDRESS);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadAddresses = () => {
    profileService.getAddresses().then((response) => {
      setAddresses(response.data || []);
    }).catch(() => {
      setMessage({ type: 'error', text: 'Failed to load addresses' });
    });
  };

  useEffect(() => {
    loadAddresses();
    return () => setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (editingId) {
        await profileService.updateAddress(editingId, formData);
        setMessage({ type: 'success', text: 'Address updated successfully' });
      } else {
        await profileService.createAddress(formData);
        setMessage({ type: 'success', text: 'Address created successfully' });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(EMPTY_ADDRESS);
      loadAddresses();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to save address' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      address_type: address.address_type,
      label: address.label || '',
      first_name: address.first_name,
      last_name: address.last_name,
      phone_number: address.phone_number || '',
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await profileService.deleteAddress(addressId);
      setAddresses(addresses.filter(a => a.id !== addressId));
      setMessage({ type: 'success', text: 'Address deleted successfully' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete address' });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_ADDRESS);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Address Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-marsana flex items-center gap-2 min-h-[44px]">
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        )}
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'
        } transition-all duration-300`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl space-y-4 transition-all duration-300">
          <h3 className="font-medium text-surface-900 dark:text-white">{editingId ? 'Edit Address' : 'New Address'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Address Type</label>
              <select name="address_type" value={formData.address_type} onChange={handleChange} className="input-premium">
                <option value="shipping">Shipping</option>
                <option value="billing">Billing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Label (optional)</label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleChange}
                className="input-premium"
                placeholder="Home, Office, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="input-premium" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="input-premium" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Phone Number</label>
            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="input-premium" />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Address Line 1</label>
            <input type="text" name="address_line_1" value={formData.address_line_1} onChange={handleChange} className="input-premium" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Address Line 2</label>
            <input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleChange} className="input-premium" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-premium w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className="input-premium w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Postal Code</label>
              <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="input-premium w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} className="input-premium w-full" required />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="w-4 h-4 text-marsana-600 bg-white dark:bg-surface-800 border-surface-300 dark:border-surface-600 rounded focus:ring-marsana-500 focus:ring-2"
            />
            <span className="text-sm text-surface-700 dark:text-surface-300">Set as default address</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button type="button" onClick={handleCancel} className="btn-outline min-h-[44px]">Cancel</button>
            <button type="submit" className="btn-marsana flex items-center gap-2 min-h-[44px] justify-center" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingId ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-surface-500 dark:text-surface-400">No addresses saved yet</p>
          <p className="text-sm text-surface-400 dark:text-surface-500">Add your first address to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl transition-all duration-300">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${
                    address.address_type === 'billing'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {address.address_type}
                  </span>
                  {address.label && (
                    <span className="text-xs text-surface-500 dark:text-surface-400">{address.label}</span>
                  )}
                  {address.is_default && (
                    <span className="inline-flex items-center gap-1 text-xs text-marsana-600 dark:text-marsana-400">
                      <Star className="h-3 w-3 fill-current" /> Default
                    </span>
                  )}
                </div>
                <p className="font-medium text-surface-900 dark:text-white">{address.first_name} {address.last_name}</p>
                <p className="text-sm text-surface-600 dark:text-surface-400 truncate">{address.address_line_1}</p>
                {address.address_line_2 && <p className="text-sm text-surface-600 dark:text-surface-400 truncate">{address.address_line_2}</p>}
                <p className="text-sm text-surface-600 dark:text-surface-400">{address.city}, {address.state} {address.postal_code}</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">{address.country}</p>
                {address.phone_number && <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{address.phone_number}</p>}
              </div>
              <div className="flex gap-1 ml-3 flex-shrink-0">
                <button onClick={() => handleEdit(address)} className="p-2 text-surface-500 dark:text-surface-400 hover:text-marsana-600 dark:hover:text-marsana-400 transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(address.id)} className="p-2 text-surface-500 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
