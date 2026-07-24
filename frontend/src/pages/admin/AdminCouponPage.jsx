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
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Link to="/admin" className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300 self-start">
            <ArrowLeft className="w-5 h-5 text-surface-500 dark:text-surface-400" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Coupon Management</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Create and manage discount coupons</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({
              code: '', description: '', discount_type: 'percentage',
              discount_value: '', min_order_amount: '', max_uses: '',
              per_user_limit: '', is_active: true,
            }); }}
            className="btn-marsana flex items-center justify-center gap-2 text-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> Add Coupon
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl">{error}</div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 mb-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-surface-900 dark:text-white">{editingId ? 'Edit Coupon' : 'New Coupon'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Code</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="input-premium" required disabled={!!editingId} />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Discount Type</label>
                <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="input-premium">
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Discount Value</label>
                <input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  className="input-premium" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Min Order Amount</label>
                <input type="number" step="0.01" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  className="input-premium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Max Uses</label>
                <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  className="input-premium" placeholder="Unlimited" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Per User Limit</label>
                <input type="number" value={form.per_user_limit} onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })}
                  className="input-premium" placeholder="Unlimited" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-premium" placeholder="Optional description" />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                {form.is_active ? <ToggleRight className="w-8 h-8 text-green-600 dark:text-green-400" /> : <ToggleLeft className="w-8 h-8 text-surface-400 dark:text-surface-500" />}
              </button>
              <span className="text-sm text-surface-700 dark:text-surface-300">{form.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" className="btn-marsana min-h-[44px]">{editingId ? 'Update' : 'Create'} Coupon</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-outline min-h-[44px]">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-marsana-600 dark:text-marsana-400 mx-auto" /></div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <Tag className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
            <p className="text-surface-500 dark:text-surface-400">No coupons yet. Create your first coupon!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-800">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Code</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Type</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Value</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Min Order</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Uses</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Status</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
                    <td className="px-6 py-4 font-mono font-medium text-surface-900 dark:text-white">{coupon.code}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400 capitalize">{coupon.discount_type}</td>
                    <td className="px-6 py-4 text-sm text-surface-900 dark:text-white font-medium">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                      {coupon.min_order_amount > 0 ? `$${coupon.min_order_amount}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                      {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-300'
                      }`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(coupon)} className="text-sm text-marsana-600 dark:text-marsana-400 hover:text-marsana-800 dark:hover:text-marsana-300 transition-all duration-300">Edit</button>
                        <button onClick={() => handleDelete(coupon.id)} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-all duration-300">
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
