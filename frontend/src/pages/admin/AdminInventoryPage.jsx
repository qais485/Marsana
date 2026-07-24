import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, Loader2, Search, AlertTriangle, XCircle, Edit } from 'lucide-react';
import inventoryService from '../../services/api/inventoryService';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockForm, setStockForm] = useState({ stock_quantity: 0, low_stock_threshold: 10 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, summaryRes] = await Promise.all([
        inventoryService.getProductInventory(page, 20, search || undefined),
        inventoryService.getSummary(),
      ]);
      if (inventoryRes.success) {
        setProducts(inventoryRes.data);
        setPagination(inventoryRes.pagination);
      }
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch {
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleEditStock = (product) => {
    setEditingProduct(product);
    setStockForm({
      stock_quantity: product.total_quantity,
      low_stock_threshold: product.low_stock_threshold,
    });
  };

  const handleSaveStock = async () => {
    try {
      await inventoryService.updateProductInventory(editingProduct.product_id, {
        stock_quantity: parseInt(stockForm.stock_quantity),
        low_stock_threshold: parseInt(stockForm.low_stock_threshold),
      });
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update inventory');
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
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Inventory Management</h1>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Track and manage product stock levels</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/inventory/low-stock"
              className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all duration-300 text-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Low Stock</span>
              <span className="sm:hidden">Low</span>
            </Link>
            <Link
              to="/admin/inventory/out-of-stock"
              className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 text-sm"
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Out of Stock</span>
              <span className="sm:hidden">Out</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
              <p className="text-sm text-surface-600 dark:text-surface-400">Total Products</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{summary.total_products}</p>
            </div>
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
              <p className="text-sm text-surface-600 dark:text-surface-400">Stock Value</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">${summary.total_stock_value.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
              <p className="text-sm text-surface-600 dark:text-surface-400">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.low_stock_count}</p>
            </div>
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
              <p className="text-sm text-surface-600 dark:text-surface-400">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.out_of_stock_count}</p>
            </div>
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
              <p className="text-sm text-surface-600 dark:text-surface-400">Warehouses</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{summary.total_warehouses}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-surface-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="input-premium w-full pl-10 pr-4 py-2"
            />
          </div>
          <button
            type="submit"
            className="btn-marsana px-4 py-2 min-h-[44px]"
          >
            Search
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-marsana-600 dark:text-marsana-400" />
          </div>
        ) : (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-50 dark:bg-surface-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Threshold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {products.map((product) => (
                  <tr key={product.product_id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-surface-400 dark:text-surface-500" />
                        <span className="font-medium text-surface-900 dark:text-white">{product.product_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{product.sku || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${product.is_out_of_stock ? 'text-red-600 dark:text-red-400' : product.is_low_stock ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                        {product.total_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{product.low_stock_threshold}</td>
                    <td className="px-6 py-4">
                      {product.is_out_of_stock ? (
                        <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">Out of Stock</span>
                      ) : product.is_low_stock ? (
                        <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">Low Stock</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditStock(product)}
                        className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300"
                      >
                        <Edit className="w-4 h-4 text-surface-500 dark:text-surface-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-surface-400 dark:text-surface-500 mx-auto mb-4" />
                <p className="text-surface-600 dark:text-surface-400">No products found</p>
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

        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl p-6 w-full max-w-md border border-surface-200 dark:border-surface-800">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Update Inventory: {editingProduct.product_name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={stockForm.stock_quantity}
                    onChange={(e) => setStockForm({ ...stockForm, stock_quantity: e.target.value })}
                    className="input-premium w-full px-3 py-2"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={stockForm.low_stock_threshold}
                    onChange={(e) => setStockForm({ ...stockForm, low_stock_threshold: e.target.value })}
                    className="input-premium w-full px-3 py-2"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveStock}
                  className="btn-marsana px-4 py-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="btn-outline px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
