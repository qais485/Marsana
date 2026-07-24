import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowLeft, Loader2, Search, Filter } from 'lucide-react';
import inventoryService from '../../services/api/inventoryService';

export default function AdminInventoryHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ change_type: '', product_id: '' });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.change_type) params.change_type = filters.change_type;
      if (filters.product_id) params.product_id = filters.product_id;

      const response = await inventoryService.getHistory(page, 20, params);
      if (response.success) {
        setHistory(response.data);
        setPagination(response.pagination);
      }
    } catch {
      setError('Failed to load inventory history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, filters]);

  const getChangeTypeBadge = (type) => {
    const badges = {
      adjustment: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      restock: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      sale: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      transfer: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      return: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      damage: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return badges[type] || 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300';
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Link to="/admin/inventory" className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300 self-start">
            <ArrowLeft className="w-5 h-5 text-surface-500 dark:text-surface-400" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Inventory History</h1>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Track all inventory changes and adjustments</p>
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
              value={filters.change_type}
              onChange={(e) => { setFilters({ ...filters, change_type: e.target.value }); setPage(1); }}
              className="input-premium px-3 py-2 text-sm min-h-[44px] flex-1 sm:flex-none min-w-0"
            >
              <option value="">All Types</option>
              <option value="adjustment">Adjustment</option>
              <option value="restock">Restock</option>
              <option value="sale">Sale</option>
              <option value="transfer">Transfer</option>
              <option value="return">Return</option>
              <option value="damage">Damage</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Filter by Product ID"
            value={filters.product_id}
            onChange={(e) => { setFilters({ ...filters, product_id: e.target.value }); setPage(1); }}
            className="input-premium px-3 py-2 text-sm min-h-[44px] w-full sm:w-40"
          />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Quantity Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Previous</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">New</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{record.product_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getChangeTypeBadge(record.change_type)}`}>
                        {record.change_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${record.quantity_change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {record.quantity_change > 0 ? '+' : ''}{record.quantity_change}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{record.previous_quantity}</td>
                    <td className="px-6 py-4 text-sm text-surface-900 dark:text-white font-medium">{record.new_quantity}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400 max-w-xs truncate">{record.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {history.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-surface-400 dark:text-surface-500 mx-auto mb-4" />
                <p className="text-surface-600 dark:text-surface-400">No inventory history found</p>
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
