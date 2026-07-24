import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2, Check, Filter } from 'lucide-react';
import inventoryService from '../../services/api/inventoryService';

export default function AdminStockAlertsPage({ alertType }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ is_resolved: 'false', alert_type: alertType || '' });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.is_resolved === 'false') params.is_resolved = false;
      else if (filters.is_resolved === 'true') params.is_resolved = true;
      if (filters.alert_type) params.alert_type = filters.alert_type;

      const response = await inventoryService.getStockAlerts(page, 20, params);
      if (response.success) {
        setAlerts(response.data);
        setPagination(response.pagination);
      }
    } catch {
      setError('Failed to load stock alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, filters]);

  const handleResolve = async (alertId) => {
    try {
      await inventoryService.resolveAlert(alertId, 'Resolved by admin');
      fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resolve alert');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Link to="/admin/inventory" className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300 self-start">
            <ArrowLeft className="w-5 h-5 text-surface-500 dark:text-surface-400" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Stock Alerts</h1>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Monitor low stock and out of stock alerts</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-surface-500 dark:text-surface-400 flex-shrink-0" />
            <select
              value={filters.is_resolved}
              onChange={(e) => { setFilters({ ...filters, is_resolved: e.target.value }); setPage(1); }}
              className="input-premium px-3 py-2 text-sm min-h-[44px] flex-1 sm:flex-none min-w-0"
            >
              <option value="">All</option>
              <option value="false">Unresolved</option>
              <option value="true">Resolved</option>
            </select>
          </div>
          <select
            value={filters.alert_type}
            onChange={(e) => { setFilters({ ...filters, alert_type: e.target.value }); setPage(1); }}
            className="input-premium px-3 py-2 text-sm min-h-[44px] flex-1 sm:flex-none min-w-0"
          >
            <option value="">All Types</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-marsana-600 dark:text-marsana-400" />
          </div>
        ) : (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-50 dark:bg-surface-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Threshold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Current</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.alert_type === 'out_of_stock' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {alert.alert_type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{alert.product_name}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{alert.warehouse_name || 'All'}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{alert.threshold}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${alert.current_quantity === 0 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {alert.current_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.is_resolved ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {alert.is_resolved ? 'Resolved' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {!alert.is_resolved && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="flex items-center gap-1 px-2 py-1 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-300"
                        >
                          <Check className="w-3 h-3" />
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {alerts.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-surface-400 dark:text-surface-500 mx-auto mb-4" />
                <p className="text-surface-600 dark:text-surface-400">No stock alerts found</p>
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-800 flex justify-between items-center">
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-surface-200 dark:border-surface-800 rounded-xl disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 py-1 border border-surface-200 dark:border-surface-800 rounded-xl disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
