import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2, Share2, Copy, Check, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items, loading, fetchWishlist, removeFromWishlist, clearWishlist, shareWishlistItem, moveToCart } = useWishlist();
  const { fetchCart } = useCart();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

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
    const url = `${window.location.origin}${shareModal.share_url}`;
    try {
      await navigator.clipboard.writeText(url);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your wishlist</h2>
          <p className="text-gray-500 mb-4">Save products you love for later</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/products"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 mt-1">{items.length} items saved</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save products you love for later</p>
            <Link
              to="/products"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                    <p className="text-lg font-bold text-primary-600 mt-1">{formatPrice(item.product_price)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleMoveToCart(item.product_id)}
                    disabled={movingId === item.product_id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {movingId === item.product_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                    Move to Cart
                  </button>
                  <button
                    onClick={() => handleShare(item.product_id)}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Share"
                  >
                    <Share2 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {shareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Wishlist</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with friends so they can see your wishlist:
            </p>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}${shareModal.share_url}`}
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            <button
              onClick={() => setShareModal(null)}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
