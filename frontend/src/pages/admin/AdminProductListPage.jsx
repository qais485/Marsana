import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminProductService } from '../../services/api/adminProductService';
import {
  Loader2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  ArrowLeft,
  Upload,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminProductListPage() {
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
        const params = { page: currentPage, limit: 20 };
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

  useEffect(() => {
    const totalPages = pagination.pages || 1;
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pagination.pages]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger(t => t + 1);
  };

  const handleDelete = async (productId) => {
    try {
      await adminProductService.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setPagination(prev => {
        const newTotal = (prev.total || 0) - 1;
        const newPages = Math.max(1, Math.ceil(newTotal / (prev.limit || 10)));
        return { ...prev, total: newTotal, pages: newPages };
      });
      setDeleteConfirm(null);
    } catch {
      setError('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Product Management</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/products/import"
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Upload className="h-4 w-4" />
                Import
              </Link>
              <Link
                to="/admin/products/export"
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                Export
              </Link>
              <Link
                to="/admin/products/new"
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <button type="submit" className="btn-primary text-sm">
                Search
              </button>
            </form>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterActive}
                onChange={(e) => { setFilterActive(e.target.value); setCurrentPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="card mb-6 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products found</p>
              <Link to="/admin/products/new" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" />
                Create your first product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category_name || 'Uncategorized'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.sku || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-medium">${product.price}</span>
                        {product.discount_price && (
                          <span className="text-green-600 ml-1">${product.discount_price}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-medium ${product.stock_quantity <= 0 ? 'text-red-600' : product.stock_quantity < 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="text-gray-500 hover:text-primary-600 p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="text-gray-500 hover:text-red-600 p-1"
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} products
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {pagination.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
