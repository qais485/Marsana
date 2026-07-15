import { useState, useEffect, Fragment } from 'react';
import { adminCategoryService } from '../../services/api/adminCategoryService';
import {
  Loader2,
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderTree,
  ChevronRight,
  GripVertical,
} from 'lucide-react';

export default function AdminCategoryList({ onEdit, onRefresh }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminCategoryService.getCategories();
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch {
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (categoryId) => {
    try {
      await adminCategoryService.deleteCategory(categoryId);
      setCategories(categories.filter((c) => c.id !== categoryId));
      setDeleteConfirm(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete category');
      setDeleteConfirm(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const rootCategories = filteredCategories.filter((c) => !c.parent_id);
  const childMap = {};
  filteredCategories.forEach((c) => {
    if (c.parent_id) {
      if (!childMap[c.parent_id]) childMap[c.parent_id] = [];
      childMap[c.parent_id].push(c);
    }
  });

  const renderCategory = (category, depth = 0) => {
    const children = childMap[category.id] || [];
    return (
      <Fragment key={category.id}>
        <tr className="border-b border-gray-50 hover:bg-gray-50">
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
              {depth > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
              <GripVertical className="w-4 h-4 text-gray-300" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FolderTree className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                  <p className="text-xs text-gray-500">{category.slug}</p>
                </div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-center">
            <span className="text-sm font-medium text-gray-700">{category.product_count}</span>
          </td>
          <td className="px-4 py-3 text-center">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {category.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-4 py-3 text-right text-sm text-gray-500">
            {category.sort_order}
          </td>
          <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => onEdit(category)}
                className="p-1.5 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-primary-50"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm(category.id)}
                className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
        {children.map((child) => renderCategory(child, depth + 1))}
      </Fragment>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => e.preventDefault()} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </form>
        <button
          onClick={() => onEdit(null)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
        ) : rootCategories.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No categories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Products</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Order</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rootCategories.map((category) => renderCategory(category))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure? Category must have no products or subcategories.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
