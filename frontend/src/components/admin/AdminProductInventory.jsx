import { useState, useEffect } from 'react';
import { adminProductService } from '../../services/api/adminProductService';
import { Loader2, Search, Package, Edit2, Check, X } from 'lucide-react';

export default function AdminProductInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { page: 1, limit: 50 };
        if (search) params.search = search;
        const response = await adminProductService.getProducts(params);
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchTrigger]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTrigger((t) => t + 1);
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditValue(String(product.stock_quantity));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveStock = async (productId) => {
    const newStock = parseInt(editValue);
    if (isNaN(newStock) || newStock < 0) {
      setError('Invalid stock value');
      return;
    }

    setSaving(true);
    try {
      await adminProductService.updateInventory(productId, newStock);
      setProducts(products.map((p) =>
        p.id === productId ? { ...p, stock_quantity: newStock } : p
      ));
      cancelEdit();
    } catch {
      setError('Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (qty) => {
    if (qty <= 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (qty < 10) return { label: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'In Stock', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products to update stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
          Search
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Barcode</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const status = getStockStatus(product.stock_quantity);
                  const isEditing = editingId === product.id;

                  return (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[150px]">{product.name}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{product.sku || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{product.barcode || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            min="0"
                            className="w-20 px-2 py-1 border border-primary-300 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium">{product.stock_quantity}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => saveStock(product.id)}
                              disabled={saving}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                            >
                              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button onClick={cancelEdit} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(product)}
                            className="p-1.5 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
