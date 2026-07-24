import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Plus, Trash2, Loader2, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import { promotionService } from '../../services/api/promotionService';

export default function AdminFlashSalePage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await promotionService.getAdminFlashSales();
      if (response.success) setSales(response.data);
    } catch {
      setError('Failed to load flash sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await promotionService.createFlashSale(form);
      setShowForm(false);
      setForm({ name: '', description: '', start_date: '', end_date: '', is_active: true });
      fetchSales();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create flash sale');
    }
  };

  const handleToggle = async (sale) => {
    try {
      await promotionService.updateFlashSale(sale.id, { is_active: !sale.is_active });
      fetchSales();
    } catch {
      setError('Failed to update flash sale');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this flash sale?')) return;
    try {
      await promotionService.deleteFlashSale(id);
      fetchSales();
    } catch {
      setError('Failed to delete flash sale');
    }
  };

  const isActive = (sale) => {
    const now = new Date();
    return sale.is_active && new Date(sale.start_date) <= now && new Date(sale.end_date) >= now;
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Link to="/admin" className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300 self-start">
            <ArrowLeft className="w-5 h-5 text-surface-500 dark:text-surface-400" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Flash Sale Management</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Create and manage time-limited flash sales</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-marsana flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Flash Sale
          </button>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 mb-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-surface-900 dark:text-white">New Flash Sale</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-premium" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-premium" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Start Date</label>
                <input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="input-premium" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">End Date</label>
                <input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="input-premium" required />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" className="btn-marsana min-h-[44px]">Create Flash Sale</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline min-h-[44px]">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-marsana-600 dark:text-marsana-400 mx-auto" /></div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <Zap className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
            <p className="text-surface-500 dark:text-surface-400">No flash sales yet. Create your first flash sale!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-white">{sale.name}</h3>
                    {sale.description && <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{sale.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm text-surface-600 dark:text-surface-400">
                      <span>Start: {new Date(sale.start_date).toLocaleString()}</span>
                      <span>End: {new Date(sale.end_date).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isActive(sale) ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : sale.is_active ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-300'
                    }`}>
                      {isActive(sale) ? 'Live' : sale.is_active ? 'Scheduled' : 'Inactive'}
                    </span>
                    <button onClick={() => handleToggle(sale)} className="transition-all duration-300">
                      {sale.is_active ? <ToggleRight className="w-8 h-8 text-green-600 dark:text-green-400" /> : <ToggleLeft className="w-8 h-8 text-surface-400 dark:text-surface-500" />}
                    </button>
                    <button onClick={() => handleDelete(sale.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-all duration-300">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
