import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Warehouse, Plus, Trash2, Loader2, ArrowLeft, Edit, MapPin, Phone, Mail } from 'lucide-react';
import inventoryService from '../../services/api/inventoryService';

export default function AdminWarehousePage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone_number: '',
    email: '',
    is_active: true,
    is_default: false,
  });

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getWarehouses();
      if (response.success) setWarehouses(response.data);
    } catch {
      setError('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await inventoryService.updateWarehouse(editingId, form);
      } else {
        await inventoryService.createWarehouse(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({
        name: '', code: '', address_line_1: '', address_line_2: '',
        city: '', state: '', postal_code: '', country: '',
        phone_number: '', email: '', is_active: true, is_default: false,
      });
      fetchWarehouses();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save warehouse');
    }
  };

  const handleEdit = (warehouse) => {
    setForm({
      name: warehouse.name,
      code: warehouse.code,
      address_line_1: warehouse.address_line_1,
      address_line_2: warehouse.address_line_2 || '',
      city: warehouse.city,
      state: warehouse.state,
      postal_code: warehouse.postal_code,
      country: warehouse.country,
      phone_number: warehouse.phone_number || '',
      email: warehouse.email || '',
      is_active: warehouse.is_active,
      is_default: warehouse.is_default,
    });
    setEditingId(warehouse.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this warehouse?')) return;
    try {
      await inventoryService.deleteWarehouse(id);
      fetchWarehouses();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete warehouse');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-marsana-600 dark:text-marsana-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Link to="/admin" className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300 self-start">
            <ArrowLeft className="w-5 h-5 text-surface-500 dark:text-surface-400" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Warehouse Management</h1>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Manage your warehouse locations and inventory</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', code: '', address_line_1: '', address_line_2: '', city: '', state: '', postal_code: '', country: '', phone_number: '', email: '', is_active: true, is_default: false }); }}
            className="btn-marsana flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{editingId ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-premium w-full px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Code *</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-premium w-full px-3 py-2" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Address Line 1 *</label>
                <input type="text" value={form.address_line_1} onChange={(e) => setForm({ ...form, address_line_1: e.target.value })} className="input-premium w-full px-3 py-2" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Address Line 2</label>
                <input type="text" value={form.address_line_2} onChange={(e) => setForm({ ...form, address_line_2: e.target.value })} className="input-premium w-full px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">City *</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-premium w-full px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">State *</label>
                <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-premium w-full px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Postal Code *</label>
                <input type="text" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="input-premium w-full px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Country *</label>
                <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-premium w-full px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label>
                <input type="text" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input-premium w-full px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-premium w-full px-3 py-2" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-surface-300 dark:border-surface-600" />
                  <span className="text-sm text-surface-700 dark:text-surface-300">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="rounded border-surface-300 dark:border-surface-600" />
                  <span className="text-sm text-surface-700 dark:text-surface-300">Default</span>
                </label>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="btn-marsana px-4 py-2">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-outline px-4 py-2">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-marsana-100 dark:bg-marsana-900/30 rounded-xl">
                    <Warehouse className="w-5 h-5 text-marsana-600 dark:text-marsana-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-white">{warehouse.name}</h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400">{warehouse.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {warehouse.is_default && (
                    <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Default</span>
                  )}
                  <button onClick={() => handleEdit(warehouse)} className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300">
                    <Edit className="w-4 h-4 text-surface-500 dark:text-surface-400" />
                  </button>
                  <button onClick={() => handleDelete(warehouse.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300">
                    <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-surface-600 dark:text-surface-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-surface-400 dark:text-surface-500" />
                  <span>
                    {warehouse.address_line_1}
                    {warehouse.address_line_2 && <>, {warehouse.address_line_2}</>}
                    <br />
                    {warehouse.city}, {warehouse.state} {warehouse.postal_code}
                    <br />
                    {warehouse.country}
                  </span>
                </div>
                {warehouse.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-surface-400 dark:text-surface-500" />
                    <span>{warehouse.phone_number}</span>
                  </div>
                )}
                {warehouse.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-surface-400 dark:text-surface-500" />
                    <span>{warehouse.email}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-800">
                <Link
                  to={`/admin/inventory/warehouse/${warehouse.id}`}
                  className="text-sm text-marsana-600 dark:text-marsana-400 hover:text-marsana-800 dark:hover:text-marsana-300 transition-all duration-300"
                >
                  View Inventory →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {warehouses.length === 0 && !loading && (
          <div className="text-center py-12 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <Warehouse className="w-12 h-12 text-surface-400 dark:text-surface-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">No warehouses</h3>
            <p className="text-surface-600 dark:text-surface-400 mb-4">Get started by adding your first warehouse.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-marsana px-4 py-2"
            >
              Add Warehouse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
