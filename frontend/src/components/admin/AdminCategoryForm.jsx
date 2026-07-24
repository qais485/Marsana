import { useState } from 'react';
import { adminCategoryService } from '../../services/api/adminCategoryService';
import { Loader2, Save, X } from 'lucide-react';

function getInitialFormData(category, isEdit) {
  if (isEdit && category) {
    return {
      name: category.name || '',
      description: category.description || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id || '',
      is_active: category.is_active,
      sort_order: category.sort_order || 0,
    };
  }
  return {
    name: '',
    description: '',
    image_url: '',
    parent_id: '',
    is_active: true,
    sort_order: 0,
  };
}

export default function AdminCategoryForm({ category, allCategories, onSave, onCancel }) {
  const isEdit = Boolean(category?.id);
  const [formData, setFormData] = useState(() => getInitialFormData(category, isEdit));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        parent_id: formData.parent_id || null,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (isEdit) {
        await adminCategoryService.updateCategory(category.id, payload);
      } else {
        await adminCategoryService.createCategory(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = (allCategories || []).filter(
    (c) => !c.parent_id && (!isEdit || c.id !== category?.id)
  );

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-surface-900 dark:text-white">
          {isEdit ? 'Edit Category' : 'Create Category'}
        </h3>
        <button onClick={onCancel} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300">
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-premium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="input-premium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Parent Category</label>
            <select
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className="input-premium"
            >
              <option value="">No Parent (Root)</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Sort Order</label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              min="0"
              className="input-premium"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Image URL</label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="input-premium"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 text-marsana-600 border-surface-300 dark:border-surface-600 rounded focus:ring-marsana-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">Active</span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-outline">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-marsana flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}