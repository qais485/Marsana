import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { adminCustomerSupportService } from '../../services/api/adminCustomerSupportService';

const CATEGORIES = ['general', 'orders', 'shipping', 'payments', 'returns', 'account', 'technical'];

export default function AdminFAQForm({ faq, onSave, onCancel }) {
  const isEdit = Boolean(faq?.id);

  const getInitialFormData = () => ({
    question: faq?.question || '',
    answer: faq?.answer || '',
    category: faq?.category || 'general',
    sort_order: faq?.sort_order || 0,
    is_active: faq?.is_active !== undefined ? faq.is_active : true,
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFormData({
      question: faq?.question || '',
      answer: faq?.answer || '',
      category: faq?.category || 'general',
      sort_order: faq?.sort_order || 0,
      is_active: faq?.is_active !== undefined ? faq.is_active : true,
    });
  }, [faq]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      if (isEdit) {
        await adminCustomerSupportService.updateFAQItem(faq.id, formData);
      } else {
        await adminCustomerSupportService.createFAQItem(formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save FAQ item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{isEdit ? 'Edit FAQ' : 'Create FAQ'}</h3>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter the question"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter the answer"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
