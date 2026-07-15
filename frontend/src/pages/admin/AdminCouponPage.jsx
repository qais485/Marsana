import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Plus, Trash2, Loader2, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import { promotionService } from '../../services/api/promotionService';

export default function AdminCouponPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    per_user_limit: '',
    is_active: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await promotionService.getAdminCoupons();
      if (response.success) setCoupons(response.data);
    } catch {
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        discount_value: parseFloat(form.discount_value),
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        per_user_limit: form.per_user_limit ? parseInt(form.per_user_limit) : null,
      };
      if (editingId) {
        await promotionService.updateCoupon(editingId, data);
      } else {
        await promotionService.createCoupon(data);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({
        code: '', description: '', discount_type: 'percentage',
        discount_value: '', min_order_amount: '', max_uses: '',
        per_user_limit: '', is_active: true,
      });
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount?.toString() || '',
      max_uses: coupon.max_uses?.toString() || '',
      per_user_limit: coupon.per_user_limit?.toString() || '',
      is_active: coupon.is_active,
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await promotionService.deleteCoupon(id);
      fetchCoupons();
    } catch {
      setError('Failed to delete coupon');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
            <p className="text-gray-500 mt-1">Create and manage discount coupons</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({
              code: '', description: '', discount_type: 'percentage',
              discount_value: '', min_order_amount: '', max_uses: '',
              per_user_limit: '', is_active: true,
            }); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Coupon
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Coupon' : 'New Coupon'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="input-field" required disabled={!!editingId} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="input-field">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                <input type="number" step="0.01" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  className="input-field" placeholder="Unlimited" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
                <input type="number" value={form.per_user_limit} onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })}
                  className="input-field" placeholder="Unlimited" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field" placeholder="Optional description" />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                {form.is_active ? <ToggleRight className="w-8 h-8 text-green-600" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
              </button>
              <span className="text-sm text-gray-700">{form.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'} Coupon</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" /></div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No coupons yet. Create your first coupon!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Code</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Value</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Min Order</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Uses</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{coupon.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{coupon.discount_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {coupon.min_order_amount > 0 ? `$${coupon.min_order_amount}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(coupon)} className="text-sm text-primary-600 hover:text-primary-800">Edit</button>
                        <button onClick={() => handleDelete(coupon.id)} className="text-sm text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
