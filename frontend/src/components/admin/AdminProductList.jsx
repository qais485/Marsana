import { useState, useEffect } from 'react';
import { adminProductService } from '../../services/api/adminProductService';
import {
  Loader2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function AdminProductList({ onEdit, onRefresh }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActive, setFilterActive] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { page: currentPage, limit: 10 };
        if (search) params.search = search;
        if (filterActive !== '') params.is_active = filterActive === 'true';
        const response = await adminProductService.getProducts(params);
        if (response.success) {
          setProducts(response.data || []);
          setPagination(response.pagination || {});
        }
      } catch {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, filterActive, searchTrigger]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger((t) => t + 1);
  };

  const handleDelete = async (productId) => {
    try {
      await adminProductService.deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
      setDeleteConfirm(null);
      if (onRefresh) onRefresh();
    } catch {
      setError('Failed to delete product');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 dark:text-surface-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium pl-10 w-full"
            />
          </div>
          <button type="submit" className="btn-marsana min-h-[44px]">
            Search
          </button>
        </form>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-surface-500 dark:text-surface-400 flex-shrink-0" />
            <select
              value={filterActive}
              onChange={(e) => { setFilterActive(e.target.value); setCurrentPage(1); }}
              className="input-premium flex-1 sm:flex-none min-w-0"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => onEdit(null)}
            className="btn-marsana flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
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
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
            <p className="text-surface-500 dark:text-surface-400 text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
                  <th className="text-left px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Product</th>
                  <th className="text-left px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">SKU</th>
                  <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Price</th>
                  <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all duration-300">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-surface-400 dark:text-surface-500" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white truncate max-w-[150px]">{product.name}</p>
                          <p className="text-xs text-surface-500 dark:text-surface-400">{product.category_name || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{product.sku || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-surface-900 dark:text-white">${product.price}</span>
                      {product.discount_price && (
                        <span className="text-green-600 dark:text-green-400 ml-1 text-xs">${product.discount_price}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${product.stock_quantity <= 0 ? 'text-red-600 dark:text-red-400' : product.stock_quantity < 10 ? 'text-yellow-600 dark:text-yellow-400' : 'text-surface-900 dark:text-white'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-marsana-600 dark:hover:text-marsana-400 rounded-xl hover:bg-marsana-50 dark:hover:bg-marsana-900/30 transition-all duration-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
              Page {currentPage} of {pagination.pages}
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

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 max-w-sm w-full mx-4 shadow-sm">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Delete Product</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-xl text-sm hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}