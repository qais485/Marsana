import { useState, useEffect } from 'react';
import { adminOrderService } from '../../services/api/adminOrderService';
import {
  Loader2,
  Search,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  processing: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  shipped: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  delivered: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  cancelled: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  refunded: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-400',
};

const PAYMENT_STATUS_COLORS = {
  pending: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  paid: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  refunded: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-400',
  failed: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export default function AdminOrderList({ onView, onRefresh }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { page: currentPage, limit: 15 };
        if (search) params.search = search;
        if (filterStatus) params.status = filterStatus;
        if (filterPayment) params.payment_status = filterPayment;
        const response = await adminOrderService.getOrders(params);
        if (response.success) {
          setOrders(response.data || []);
          setPagination(response.pagination || {});
        }
      } catch {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, filterStatus, filterPayment, searchTrigger]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger((t) => t + 1);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 dark:text-surface-500" />
          <input
            type="text"
            placeholder="Search by order number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium pl-10 w-full"
          />
        </div>
        <button type="submit" className="btn-marsana min-h-[44px]">
          Search
        </button>
      </form>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Filter className="h-4 w-4 text-surface-500 dark:text-surface-400 flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="input-premium flex-1 min-w-0"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <select
          value={filterPayment}
          onChange={(e) => { setFilterPayment(e.target.value); setCurrentPage(1); }}
          className="input-premium flex-1 sm:flex-none min-w-0"
        >
          <option value="">All Payment</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-marsana-600 dark:text-marsana-400 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
            <p className="text-surface-500 dark:text-surface-400 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
                  <th className="text-left px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Order</th>
                  <th className="text-left px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Customer</th>
                  <th className="text-center px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Items</th>
                  <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Total</th>
                  <th className="text-center px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Payment</th>
                  <th className="text-left px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Date</th>
                  <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all duration-300">
                    <td className="px-4 py-3">
                      <p className="font-medium text-marsana-600 dark:text-marsana-400">{order.order_number}</p>
                    </td>
                    <td className="px-4 py-3 text-surface-700 dark:text-surface-300">{order.shipping_name || '-'}</td>
                    <td className="px-4 py-3 text-center text-surface-700 dark:text-surface-300">{order.item_count}</td>
                    <td className="px-4 py-3 text-right font-medium text-surface-900 dark:text-white">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[order.payment_status] || 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-surface-500 dark:text-surface-400 text-xs">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onView(order)}
                        className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-marsana-600 dark:hover:text-marsana-400 rounded-xl hover:bg-marsana-50 dark:hover:bg-marsana-900/30 transition-all duration-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-800">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Page {currentPage} of {pagination.pages} ({pagination.total} orders)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-xl border border-surface-200 dark:border-surface-700 disabled:opacity-50 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={currentPage === pagination.pages}
                className="p-1.5 rounded-xl border border-surface-200 dark:border-surface-700 disabled:opacity-50 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}