import { useState, useEffect } from 'react';
import { profileService } from '../../services/api/profileService';
import { formatPrice } from '../../utils/format';
import { Clock, Eye, Loader2 } from 'lucide-react';

export default function RecentlyViewedSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const response = await profileService.getRecentlyViewed();
        setItems(response.data || []);
      } catch {
        setMessage({ type: 'error', text: 'Failed to load recently viewed products' });
      } finally {
        setLoading(false);
      }
    };
    loadRecentlyViewed();
  }, []);

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your recently viewed products?')) return;

    try {
      await profileService.clearRecentlyViewed();
      setItems([]);
      setMessage({ type: 'success', text: 'Recently viewed products cleared' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to clear recently viewed products' });
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Recently Viewed Products</h2>
        {items.length > 0 && (
          <button onClick={handleClearAll} className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200">
            Clear All
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

      {items.length === 0 ? (
        <div className="text-center py-8">
          <Eye className="h-12 w-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-surface-500 dark:text-surface-400">No recently viewed products</p>
          <p className="text-sm text-surface-400 dark:text-surface-500">Products you view will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl transition-all duration-300">
              <div className="w-20 h-20 bg-surface-200 dark:bg-surface-700 rounded-xl flex-shrink-0 overflow-hidden">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-surface-400 dark:text-surface-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 dark:text-white truncate">{item.product_name}</p>
                <p className="text-lg font-bold text-marsana-600 dark:text-marsana-400">{formatPrice(item.product_price)}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Viewed {new Date(item.viewed_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
