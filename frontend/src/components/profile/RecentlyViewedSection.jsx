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
        <h2 className="text-lg font-semibold text-gray-900">Recently Viewed Products</h2>
        {items.length > 0 && (
          <button onClick={handleClearAll} className="text-sm text-red-500 hover:text-red-700">
            Clear All
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

      {items.length === 0 ? (
        <div className="text-center py-8">
          <Eye className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recently viewed products</p>
          <p className="text-sm text-gray-400">Products you view will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                <p className="text-lg font-bold text-primary-600">{formatPrice(item.product_price)}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
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
