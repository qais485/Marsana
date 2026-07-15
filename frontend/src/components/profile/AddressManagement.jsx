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
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Address Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        )}
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900">{editingId ? 'Edit Address' : 'New Address'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Address Type</label>
              <select name="address_type" value={formData.address_type} onChange={handleChange} className="input-field">
                <option value="shipping">Shipping</option>
                <option value="billing">Billing</option>
              </select>
            </div>
            <div>
              <label className="label">Label (optional)</label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleChange}
                className="input-field"
                placeholder="Home, Office, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label className="label">Address Line 1</label>
            <input type="text" name="address_line_1" value={formData.address_line_1} onChange={handleChange} className="input-field" required />
          </div>

          <div>
            <label className="label">Address Line 2</label>
            <input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleChange} className="input-field" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label">Postal Code</label>
              <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingId ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No addresses saved yet</p>
          <p className="text-sm text-gray-400">Add your first address to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    address.address_type === 'billing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {address.address_type}
                  </span>
                  {address.label && (
                    <span className="text-xs text-gray-500">{address.label}</span>
                  )}
                  {address.is_default && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary-600">
                      <Star className="h-3 w-3 fill-current" /> Default
                    </span>
                  )}
                </div>
                <p className="font-medium text-gray-900">{address.first_name} {address.last_name}</p>
                <p className="text-sm text-gray-600">{address.address_line_1}</p>
                {address.address_line_2 && <p className="text-sm text-gray-600">{address.address_line_2}</p>}
                <p className="text-sm text-gray-600">{address.city}, {address.state} {address.postal_code}</p>
                <p className="text-sm text-gray-600">{address.country}</p>
                {address.phone_number && <p className="text-sm text-gray-500 mt-1">{address.phone_number}</p>}
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEdit(address)} className="text-gray-500 hover:text-primary-600">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(address.id)} className="text-gray-500 hover:text-red-600">
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
