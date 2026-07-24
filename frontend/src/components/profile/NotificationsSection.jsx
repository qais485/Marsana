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
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-marsana-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-marsana-100 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-400 border border-marsana-200 dark:border-marsana-800">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 flex items-center gap-1 transition-colors duration-200 min-h-[44px]">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'
        } transition-all duration-300`}>
          {message.text}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <BellOff className="h-12 w-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-surface-500 dark:text-surface-400">No notifications</p>
          <p className="text-sm text-surface-400 dark:text-surface-500">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-300 ${
                notification.is_read
                  ? 'bg-surface-50 dark:bg-surface-800/50'
                  : 'bg-marsana-50 dark:bg-marsana-900/20 border border-marsana-100 dark:border-marsana-800/50'
              }`}
            >
              <span className="text-xl mt-0.5">{getNotificationIcon(notification.notification_type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${notification.is_read ? 'text-surface-600 dark:text-surface-400' : 'text-surface-900 dark:text-white'}`}>
                    {notification.title}
                  </p>
                  {!notification.is_read && (
                    <span className="w-2 h-2 rounded-full bg-marsana-500" />
                  )}
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-0.5">{notification.message}</p>
                <p className="text-xs text-surface-500 dark:text-surface-500 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {!notification.is_read && (
                <button
                  onClick={() => handleMarkRead(notification.id)}
                  className="text-surface-400 dark:text-surface-500 hover:text-marsana-600 dark:hover:text-marsana-400 flex-shrink-0 transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
