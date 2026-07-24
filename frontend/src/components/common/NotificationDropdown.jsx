import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, X, Loader2, ShoppingCart, Tag, Shield, Info } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const TYPE_ICONS = {
  order: ShoppingCart,
  promotion: Tag,
  security: Shield,
  system: Info,
};

const TYPE_COLORS = {
  order: 'text-marsana-500 bg-marsana-50',
  promotion: 'text-success bg-success/10',
  security: 'text-error bg-error/10',
  system: 'text-surface-500 bg-surface-100',
};

export default function NotificationDropdown() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-error to-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-premium border border-surface-100 z-50 overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-marsana-500/10 text-marsana-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-marsana-500 hover:text-marsana-600 font-medium flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-marsana-500 animate-spin" />
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-7 h-7 text-surface-300" />
                </div>
                <p className="text-sm font-medium text-surface-500">No notifications yet</p>
                <p className="text-xs text-surface-400 mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              recentNotifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.notification_type] || Info;
                const colorClass = TYPE_COLORS[notification.notification_type] || TYPE_COLORS.system;
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-5 py-4 border-b border-surface-50 hover:bg-surface-50/50 transition-colors duration-200 ${
                      !notification.is_read ? 'bg-marsana-500/5' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.is_read ? 'font-semibold text-surface-900' : 'text-surface-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-surface-500 line-clamp-2 mt-1">{notification.message}</p>
                      <p className="text-xs text-surface-400 mt-1.5">
                        {notification.created_at ? new Date(notification.created_at).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1.5 text-surface-400 hover:text-marsana-500 hover:bg-marsana-50 rounded-lg shrink-0 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block text-center px-5 py-3.5 text-sm font-medium text-marsana-500 hover:bg-marsana-50 border-t border-surface-100 transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
