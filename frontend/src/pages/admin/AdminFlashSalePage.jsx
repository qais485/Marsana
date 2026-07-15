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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Flash Sale Management</h1>
            <p className="text-gray-500 mt-1">Create and manage time-limited flash sales</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Flash Sale
          </button>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-gray-900">New Flash Sale</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="input-field" required />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Create Flash Sale</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" /></div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No flash sales yet. Create your first flash sale!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{sale.name}</h3>
                    {sale.description && <p className="text-sm text-gray-500 mt-1">{sale.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Start: {new Date(sale.start_date).toLocaleString()}</span>
                      <span>End: {new Date(sale.end_date).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isActive(sale) ? 'bg-green-100 text-green-800' : sale.is_active ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isActive(sale) ? 'Live' : sale.is_active ? 'Scheduled' : 'Inactive'}
                    </span>
                    <button onClick={() => handleToggle(sale)}>
                      {sale.is_active ? <ToggleRight className="w-8 h-8 text-green-600" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                    </button>
                    <button onClick={() => handleDelete(sale.id)} className="text-red-600 hover:text-red-800">
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
