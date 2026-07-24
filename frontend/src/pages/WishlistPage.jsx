import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2, Share2, Copy, Check, ArrowLeft, Package } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items, loading, fetchWishlist, removeFromWishlist, clearWishlist, shareWishlistItem, moveToCart } = useWishlist();
  const { fetchCart } = useCart();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  const handleRemove = async (productId) => {
    const result = await removeFromWishlist(productId);
    if (result.success) setMessage({ type: 'success', text: 'Product removed from wishlist' });
    else setMessage({ type: 'error', text: result.message || 'Failed to remove product' });
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) return;
    const result = await clearWishlist();
    if (result.success) setMessage({ type: 'success', text: 'Wishlist cleared' });
    else setMessage({ type: 'error', text: result.message || 'Failed to clear wishlist' });
  };

  const handleShare = async (productId) => {
    const result = await shareWishlistItem(productId);
    if (result.success) { setShareModal(result.data); setCopied(false); }
    else setMessage({ type: 'error', text: result.message || 'Failed to generate share link' });
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${shareModal.share_url}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setMessage({ type: 'error', text: 'Failed to copy link' }); }
  };

  const handleMoveToCart = async (productId) => {
    setMovingId(productId);
    const result = await moveToCart(productId);
    if (result.success) { await fetchCart(); setMessage({ type: 'success', text: 'Product moved to cart' }); }
    else setMessage({ type: 'error', text: result.message || 'Failed to move to cart' });
    setMovingId(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-9 h-9 text-surface-300 dark:text-surface-600" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Sign in to view your wishlist</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">Save products you love for later</p>
          <Link to="/login" className="btn-marsana">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-marsana-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 overflow-x-hidden">
      <Header />
      <div className="h-16 lg:h-18" />

      <div className="section-premium py-8">
        <Link to="/products" className="flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white">My Wishlist</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2">{items.length} items saved</p>
          </div>
          {items.length > 0 && (
            <button onClick={handleClearAll} className="text-sm text-accent-rose hover:text-red-600 font-medium transition-colors">
              Clear All
            </button>
          )}
        </div>

        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white dark:bg-surface-900 rounded-3xl p-12 sm:p-16 text-center shadow-soft border border-surface-100/50 dark:border-surface-800/50">
            <div className="w-20 h-20 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-9 h-9 text-surface-300 dark:text-surface-600" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Your wishlist is empty</h2>
            <p className="text-surface-500 dark:text-surface-400 mb-8">Save products you love for later</p>
            <Link to="/products" className="btn-marsana">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-surface-900 rounded-3xl p-4 sm:p-5 shadow-soft border border-surface-100/50 dark:border-surface-800/50 hover:shadow-float hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 sm:h-28 bg-surface-100 dark:bg-surface-800 rounded-2xl flex-shrink-0 overflow-hidden">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-surface-300 dark:text-surface-600" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-surface-900 dark:text-white truncate text-sm sm:text-base">{item.product_name}</p>
                    <p className="text-base sm:text-lg font-bold text-marsana-600 dark:text-marsana-400 mt-1 sm:mt-2">{formatPrice(item.product_price)}</p>
                    <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-surface-100 dark:border-surface-800">
                  <button
                    onClick={() => handleMoveToCart(item.product_id)}
                    disabled={movingId === item.product_id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-marsana-500 to-accent-violet text-white rounded-2xl font-semibold text-sm hover:shadow-glow-sm transition-all duration-200 disabled:opacity-50 min-h-[44px]"
                  >
                    {movingId === item.product_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    Move to Cart
                  </button>
                  <button onClick={() => handleShare(item.product_id)} className="p-2.5 border border-surface-200 dark:border-surface-800 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" title="Share">
                    <Share2 className="h-4 w-4 text-surface-500 dark:text-surface-400" />
                  </button>
                  <button onClick={() => handleRemove(item.product_id)} className="p-2.5 border border-surface-200 dark:border-surface-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" title="Remove">
                    <Trash2 className="h-4 w-4 text-surface-500 hover:text-accent-rose" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {shareModal && (
        <div className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 max-w-md w-full shadow-premium-xl animate-scale-in">
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-3">Share Wishlist</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">Share this link with friends so they can see your wishlist:</p>
            <div className="flex items-center gap-2 p-3 bg-surface-50 dark:bg-surface-800 rounded-2xl mb-6">
              <input type="text" readOnly value={`${window.location.origin}${shareModal.share_url}`} className="flex-1 bg-transparent text-sm text-surface-700 dark:text-surface-300 outline-none" />
              <button onClick={handleCopyLink} className="p-2 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-colors">
                {copied ? <Check className="h-4 w-4 text-accent-emerald" /> : <Copy className="h-4 w-4 text-surface-400" />}
              </button>
            </div>
            <button onClick={() => setShareModal(null)} className="w-full py-3 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-2xl hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors font-medium">
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
