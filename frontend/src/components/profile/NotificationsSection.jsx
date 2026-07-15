import { useState, useEffect, useMemo } from 'react';
import { profileService } from '../../services/api/profileService';
import { BellOff, Check, CheckCheck, Loader2 } from 'lucide-react';

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.is_read).length,
    [notifications]
  );

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await profileService.getNotifications();
        setNotifications(response.data.notifications || []);
      } catch {
        setMessage({ type: 'error', text: 'Failed to load notifications' });
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId) => {
    try {
      await profileService.markNotificationRead(notificationId);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch {
      setMessage({ type: 'error', text: 'Failed to mark notification as read' });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await profileService.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setMessage({ type: 'success', text: 'All notifications marked as read' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to mark all as read' });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'promotion': return '🎉';
      case 'security': return '🔒';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications</p>
          <p className="text-sm text-gray-400">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-4 rounded-lg transition-colors ${
                notification.is_read ? 'bg-gray-50' : 'bg-primary-50 border border-primary-100'
              }`}
            >
              <span className="text-xl mt-0.5">{getNotificationIcon(notification.notification_type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  {!notification.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {!notification.is_read && (
                <button
                  onClick={() => handleMarkRead(notification.id)}
                  className="text-gray-400 hover:text-primary-600 flex-shrink-0"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
