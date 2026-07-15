import { useState, useEffect } from 'react';
import { adminNotificationService } from '../../services/api/adminNotificationService';
import { BarChart3, Send, Inbox, Bell, Mail, Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AdminNotificationStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await adminNotificationService.getNotificationStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to load notification stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load notification statistics</p>
      </div>
    );
  }

  const inApp = stats.in_app || {};
  const logs = stats.logs || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary-50 text-primary-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inApp.total || 0}</p>
              <p className="text-sm text-gray-500">Total In-App</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inApp.unread || 0}</p>
              <p className="text-sm text-gray-500">Unread</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{logs.total || 0}</p>
              <p className="text-sm text-gray-500">Total Sent</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{logs.sent_today || 0}</p>
              <p className="text-sm text-gray-500">Sent Today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Channel</h3>
          <div className="space-y-3">
            {Object.entries(logs.by_channel || {}).map(([channel, count]) => (
              <div key={channel} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {channel === 'email' && <Mail className="h-4 w-4 text-blue-500" />}
                  {channel === 'in_app' && <Bell className="h-4 w-4 text-primary-500" />}
                  {channel === 'push' && <Smartphone className="h-4 w-4 text-purple-500" />}
                  <span className="text-sm text-gray-700 capitalize">{channel.replace('_', ' ')}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(logs.by_channel || {}).length === 0 && (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Status</h3>
          <div className="space-y-3">
            {Object.entries(logs.by_status || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {status === 'sent' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                  {status === 'pending' && <Loader2 className="h-4 w-4 text-yellow-500" />}
                  <span className="text-sm text-gray-700 capitalize">{status}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(logs.by_status || {}).length === 0 && (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </div>
        </div>
      </div>

      {inApp.by_type && Object.keys(inApp.by_type).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">In-App Notifications by Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(inApp.by_type).map(([type, count]) => (
              <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500 capitalize">{type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
