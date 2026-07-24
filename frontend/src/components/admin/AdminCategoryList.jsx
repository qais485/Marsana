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
        <tr className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all duration-300">
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
              {depth > 0 && <ChevronRight className="w-3 h-3 text-surface-400 dark:text-surface-500" />}
              <GripVertical className="w-4 h-4 text-surface-300 dark:text-surface-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center justify-center">
                  <FolderTree className="w-4 h-4 text-surface-400 dark:text-surface-500" />
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-white text-sm">{category.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{category.slug}</p>
                </div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-center">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{category.product_count}</span>
          </td>
          <td className="px-4 py-3 text-center">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}>
              {category.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-4 py-3 text-right text-sm text-surface-500 dark:text-surface-400">
            {category.sort_order}
          </td>
          <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => onEdit(category)}
                className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-marsana-600 dark:hover:text-marsana-400 rounded-xl hover:bg-marsana-50 dark:hover:bg-marsana-900/30 transition-all duration-300"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm(category.id)}
                className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300"
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
        <form onSubmit={(e) => e.preventDefault()} className="flex-1 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 dark:text-surface-500" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium pl-10 w-full"
            />
          </div>
        </form>
        <button
          onClick={() => onEdit(null)}
          className="btn-marsana flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
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
        ) : rootCategories.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
            <p className="text-surface-500 dark:text-surface-400 text-sm">No categories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
                  <th className="text-left px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Category</th>
                  <th className="text-center px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Products</th>
                  <th className="text-center px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Order</th>
                  <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">Actions</th>
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 max-w-sm w-full mx-4 shadow-sm">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Delete Category</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-6">
              Are you sure? Category must have no products or subcategories.
            </p>
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