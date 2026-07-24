import { useState, useEffect } from 'react';
import { adminNotificationService } from '../../services/api/adminNotificationService';
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminTemplateList({ onEdit, onCreate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const loadTemplates = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminNotificationService.getTemplates({ page, limit: 20 });
      if (response.success) {
        setTemplates(response.data.templates || []);
        setPagination(response.data?.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleToggle = async (id) => {
    try {
      await adminNotificationService.toggleTemplate(id);
      loadTemplates(pagination.page);
    } catch (error) {
      console.error('Failed to toggle template:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await adminNotificationService.deleteTemplate(id);
      loadTemplates(pagination.page);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-marsana-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-surface-900">Notification Templates</h3>
        <button onClick={onCreate} className="btn-primary flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-surface-100">
          <p className="text-surface-500">No templates found</p>
          <p className="text-sm text-surface-400 mt-1">Create your first notification template</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-surface-500">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-surface-500">Slug</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-surface-500">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-surface-500">Channel</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-surface-500">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-surface-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-surface-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-surface-900">{template.name}</p>
                    <p className="text-xs text-surface-500">{template.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-surface-100 px-2 py-1 rounded">{template.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                      {template.notification_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-surface-600 capitalize">{template.channel.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(template.id)} className="flex items-center gap-1">
                      {template.is_active ? (
                        <ToggleRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-surface-400" />
                      )}
                      <span className={`text-xs ${template.is_active ? 'text-green-600' : 'text-surface-500'}`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(template)}
                        className="text-sm text-marsana-600 hover:text-marsana-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="text-red-500 hover:text-red-700"
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
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => loadTemplates(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => loadTemplates(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
