import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  Mail,
  Eye,
  Trash2,
  X,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminCustomerSupportService } from '../../services/api/adminCustomerSupportService';

const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-800',
  read: 'bg-yellow-100 text-yellow-800',
  replied: 'bg-green-100 text-green-800',
};

export default function AdminContactMessageList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [viewingMessage, setViewingMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminCustomerSupportService.getContactStats();
      if (response.success) setStats(response.data);
    } catch (error) {
      console.error('Failed to load contact stats:', error);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const response = await adminCustomerSupportService.getContactMessages(params);
      if (response.success) {
        setMessages(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleView = async (message) => {
    try {
      const response = await adminCustomerSupportService.getContactMessage(message.id);
      if (response.success) {
        setViewingMessage(response.data);
        setReplyText('');
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to load contact message:', error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      setSending(true);
      await adminCustomerSupportService.updateContactMessage(viewingMessage.id, {
        admin_reply: replyText,
        status: 'replied',
      });
      setViewingMessage(null);
      fetchMessages();
      fetchStats();
    } catch {
      setError('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await adminCustomerSupportService.deleteContactMessage(id);
      fetchMessages();
      fetchStats();
    } catch {
      setError('Failed to delete message');
    }
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">New</p>
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Read</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Replied</p>
            <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {['', 'new', 'read', 'replied'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No contact messages found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">From</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Subject</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{msg.name}</div>
                      <div className="text-xs text-gray-500">{msg.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{msg.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[msg.status] || 'bg-gray-100 text-gray-800'}`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleView(msg)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
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

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {viewingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Message from {viewingMessage.name}</h3>
              <button onClick={() => setViewingMessage(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{viewingMessage.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="text-sm text-gray-900">{viewingMessage.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Message</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingMessage.message}</p>
              </div>
              {viewingMessage.admin_reply && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800 mb-1">Your Reply</p>
                  <p className="text-sm text-green-700 whitespace-pre-wrap">{viewingMessage.admin_reply}</p>
                </div>
              )}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Type your reply..."
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || sending}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
