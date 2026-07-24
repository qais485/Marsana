import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Plus, Send, Clock, Trash2, Edit } from 'lucide-react';
import marketingService from '../../services/api/marketingService';

export default function AdminEmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    from_email: '',
    from_name: '',
    segment: '',
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await marketingService.getEmailCampaigns(page);
      if (response.success) {
        setCampaigns(response.data);
        setPagination(response.pagination);
      }
    } catch {
      setError('Failed to load email campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page]);

  const handleCreate = async () => {
    try {
      await marketingService.createEmailCampaign(formData);
      setShowForm(false);
      setFormData({ name: '', subject: '', body: '', from_email: '', from_name: '', segment: '' });
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create campaign');
    }
  };

  const handleUpdate = async () => {
    try {
      await marketingService.updateEmailCampaign(editingCampaign.id, formData);
      setEditingCampaign(null);
      setShowForm(false);
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await marketingService.deleteEmailCampaign(id);
      fetchCampaigns();
    } catch {
      setError('Failed to delete campaign');
    }
  };

  const handleSend = async (id) => {
    if (!confirm('Send this campaign now?')) return;
    try {
      await marketingService.sendEmailCampaign(id);
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send campaign');
    }
  };

  const openEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      subject: campaign.subject,
      body: campaign.body,
      from_email: campaign.from_email,
      from_name: campaign.from_name || '',
      segment: campaign.segment || '',
    });
    setShowForm(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300',
      scheduled: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      sent: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return badges[status] || 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300';
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Link to="/admin/marketing" className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-300 self-start">
            <ArrowLeft className="w-5 h-5 text-surface-500 dark:text-surface-400" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Email Campaigns</h1>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Create and manage email marketing campaigns</p>
          </div>
          <button
            onClick={() => { setEditingCampaign(null); setFormData({ name: '', subject: '', body: '', from_email: '', from_name: '', segment: '' }); setShowForm(true); }}
            className="btn-marsana flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-marsana-600 dark:text-marsana-400" />
          </div>
        ) : (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-50 dark:bg-surface-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Sent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Opened</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Clicked</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
                    <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{campaign.name}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400 max-w-xs truncate">{campaign.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{campaign.total_sent}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{campaign.total_opened}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{campaign.total_clicked}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {campaign.status === 'draft' && (
                          <button onClick={() => handleSend(campaign.id)} className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 transition-all duration-300">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => openEdit(campaign)} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 transition-all duration-300">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(campaign.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 transition-all duration-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {campaigns.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-surface-400 dark:text-surface-500 mx-auto mb-4" />
                <p className="text-surface-600 dark:text-surface-400">No email campaigns yet</p>
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-800 flex justify-between items-center">
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-surface-200 dark:border-surface-800 rounded-xl disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300">Previous</button>
                  <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-3 py-1 border border-surface-200 dark:border-surface-800 rounded-xl disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300">Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-surface-200 dark:border-surface-800">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{editingCampaign ? 'Edit Campaign' : 'New Email Campaign'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Campaign Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-premium w-full px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Subject</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="input-premium w-full px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">From Email</label>
                  <input type="email" value={formData.from_email} onChange={(e) => setFormData({ ...formData, from_email: e.target.value })} className="input-premium w-full px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">From Name</label>
                  <input type="text" value={formData.from_name} onChange={(e) => setFormData({ ...formData, from_name: e.target.value })} className="input-premium w-full px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Segment</label>
                  <select value={formData.segment} onChange={(e) => setFormData({ ...formData, segment: e.target.value })} className="input-premium w-full px-3 py-2">
                    <option value="">All Users</option>
                    <option value="active">Active Users</option>
                    <option value="inactive">Inactive Users</option>
                    <option value="new">New Users</option>
                    <option value="vip">VIP Users</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Body</label>
                  <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={8} className="input-premium w-full px-3 py-2" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={editingCampaign ? handleUpdate : handleCreate} className="btn-marsana px-4 py-2">
                  {editingCampaign ? 'Update' : 'Create'}
                </button>
                <button onClick={() => { setShowForm(false); setEditingCampaign(null); }} className="btn-outline px-4 py-2">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
