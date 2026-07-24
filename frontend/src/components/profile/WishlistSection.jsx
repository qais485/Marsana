import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Loader2, Share2, Copy, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

export default function WishlistSection() {
  const { items, loading, fetchWishlist, removeFromWishlist, clearWishlist, shareWishlistItem, moveToCart } = useWishlist();
  const { fetchCart } = useCart();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    const result = await removeFromWishlist(productId);
    if (result.success) {
      setMessage({ type: 'success', text: 'Product removed from wishlist' });
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to remove product' });
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) return;

    const result = await clearWishlist();
    if (result.success) {
      setMessage({ type: 'success', text: 'Wishlist cleared' });
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to clear wishlist' });
    }
  };

  const handleShare = async (productId) => {
    const result = await shareWishlistItem(productId);
    if (result.success) {
      setShareModal(result.data);
      setCopied(false);
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to generate share link' });
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = shareModal.share_url?.startsWith('http') ? shareModal.share_url : `${window.location.origin}${shareModal.share_url}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to copy link' });
    }
  };

  const handleMoveToCart = async (productId) => {
    setMovingId(productId);
    const result = await moveToCart(productId);
    if (result.success) {
      await fetchCart();
      setMessage({ type: 'success', text: 'Product moved to cart' });
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to move to cart' });
    }
    setMovingId(null);
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
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Wishlist</h2>
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
          <Heart className="h-12 w-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-surface-500 dark:text-surface-400">Your wishlist is empty</p>
          <p className="text-sm text-surface-400 dark:text-surface-500">Save products you love for later</p>
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
                    <ShoppingCart className="h-6 w-6 text-surface-400 dark:text-surface-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 dark:text-white truncate">{item.product_name}</p>
                <p className="text-lg font-bold text-marsana-600 dark:text-marsana-400">{formatPrice(item.product_price)}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                  Added {new Date(item.created_at).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleMoveToCart(item.product_id)}
                    disabled={movingId === item.product_id}
                    className="flex items-center gap-1 text-xs text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 disabled:opacity-50 transition-colors duration-200"
                  >
                    {movingId === item.product_id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-3 w-3" />
                    )}
                    Move to Cart
                  </button>
                  <span className="text-surface-300 dark:text-surface-600">|</span>
                  <button
                    onClick={() => handleShare(item.product_id)}
                    className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 transition-colors duration-200"
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleRemove(item.product_id)}
                className="text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 self-start transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {shareModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-md w-full shadow-premium border border-surface-200 dark:border-surface-800">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Share Wishlist</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
              Share this link with friends so they can see your wishlist:
            </p>
            <div className="flex items-center gap-2 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl mb-4">
              <input
                type="text"
                readOnly
                value={shareModal.share_url?.startsWith('http') ? shareModal.share_url : `${window.location.origin}${shareModal.share_url}`}
                className="flex-1 bg-transparent text-sm text-surface-700 dark:text-surface-300 outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-all duration-200"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-surface-500 dark:text-surface-400" />
                )}
              </button>
            </div>
            <button
              onClick={() => setShareModal(null)}
              className="w-full py-2 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
