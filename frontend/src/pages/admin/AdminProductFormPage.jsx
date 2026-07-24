import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { adminProductService } from '../../services/api/adminProductService';
import { categoryService } from '../../services/api/categoryService';
import { productService } from '../../services/api/productService';
import { Loader2, ArrowLeft, Save, X } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  description: '',
  short_description: '',
  price: '',
  discount_price: '',
  images: '',
  category_id: '',
  brand_id: '',
  stock_quantity: 0,
  sku: '',
  barcode: '',
  is_active: true,
  is_featured: false,
  is_new_arrival: false,
  is_best_seller: false,
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isEdit) {
          const response = await adminProductService.getProduct(id);
          if (response.success) {
            const p = response.data;
            setFormData({
              name: p.name || '',
              description: p.description || '',
              short_description: p.short_description || '',
              price: p.price || '',
              discount_price: p.discount_price || '',
              images: p.images || '',
              category_id: p.category_id || '',
              brand_id: p.brand_id || '',
              stock_quantity: p.stock_quantity || 0,
              sku: p.sku || '',
              barcode: p.barcode || '',
              is_active: p.is_active,
              is_featured: p.is_featured,
              is_new_arrival: p.is_new_arrival,
              is_best_seller: p.is_best_seller,
            });
          }
        }
        const [catRes, filterRes] = await Promise.all([
          categoryService.getCategories(),
          productService.getFilterOptions(),
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (filterRes.success) setBrands(filterRes.data?.brands || []);
      } catch {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const price = parseFloat(formData.price);
      if (!price || price <= 0) {
        setError('Price must be greater than 0');
        setSaving(false);
        return;
      }

      const payload = {
        ...formData,
        price,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
      };

      if (isEdit) {
        await adminProductService.updateProduct(id, payload);
      } else {
        await adminProductService.createProduct(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-marsana-600 dark:text-marsana-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <header className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center gap-4 h-14 sm:h-16">
            <Link to="/admin/products" className="text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-300">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white">
              {isEdit ? 'Edit Product' : 'Create Product'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-red-200 dark:border-red-800 p-3 sm:p-4 mb-6 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <X className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-premium w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="input-premium w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="input-premium w-full px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Short Description</label>
                <input
                  type="text"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  maxLength={500}
                  className="input-premium w-full px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input-premium w-full px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0.01"
                  className="input-premium w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Discount Price</label>
                <input
                  type="number"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="input-premium w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  min="0"
                  className="input-premium w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Image URL</label>
                <input
                  type="text"
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  className="input-premium w-full px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Organization</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="input-premium w-full px-3 py-2 text-sm"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Brand</label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  className="input-premium w-full px-3 py-2 text-sm"
                >
                  <option value="">No Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'is_active', label: 'Active' },
                { name: 'is_featured', label: 'Featured' },
                { name: 'is_new_arrival', label: 'New Arrival' },
                { name: 'is_best_seller', label: 'Best Seller' },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    checked={formData[name]}
                    onChange={handleChange}
                    className="w-4 h-4 text-marsana-600 border-surface-300 dark:border-surface-600 rounded focus:ring-marsana-500"
                  />
                  <span className="text-sm text-surface-700 dark:text-surface-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/admin/products" className="btn-outline text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-marsana flex items-center gap-2 text-sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
