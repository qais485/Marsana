import { useState, useRef, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Check, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from '../../utils/format';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addedTimeoutRef = useRef(null);
  
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const inWishlist = isInWishlist(product.id);

  const images = product.images && typeof product.images === 'string' ? product.images.split(',').filter(Boolean) : [];
  const primaryImage = images[0] || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image';
  const secondaryImage = images[1] || primaryImage;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || adding || added) return;
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
      addedTimeoutRef.current = setTimeout(() => setAdded(false), 2000);
    } catch {
      // Error handled by context
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    };
  }, []);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || wishlistLoading) return;

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.discount_price || product.price,
          image: primaryImage,
        });
      }
    } catch {
      // Error handled by context
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div
      className="group relative bg-white dark:bg-surface-900 rounded-3xl shadow-soft border border-surface-100/50 dark:border-surface-800/50 overflow-hidden hover:shadow-float hover:-translate-y-2 hover:border-marsana-100 dark:hover:border-marsana-900 transition-all duration-500 ease-out-expo"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-surface-50 dark:bg-surface-800">
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out-expo ${
            isHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
          }`}
        />
        {/* Secondary Image */}
        <img
          src={secondaryImage}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out-expo ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
          {hasDiscount && (
            <span className="bg-gradient-to-r from-accent-rose to-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-glow-rose">
              -{discountPercent}%
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-gradient-to-r from-accent-emerald to-emerald-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Quick Actions - always visible on mobile, hover on desktop */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={handleWishlistToggle}
            disabled={!isAuthenticated || wishlistLoading}
            className={`p-2 sm:p-2.5 bg-white/90 dark:bg-surface-800/90 backdrop-blur-xl rounded-lg sm:rounded-xl shadow-soft transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center ${
              inWishlist ? 'text-accent-rose' : 'text-surface-600 dark:text-surface-400'
            }`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Add to Cart Button - always visible on mobile, hover on desktop */}
        <div className="absolute bottom-2 right-2 left-2 sm:bottom-3 sm:right-3 sm:left-3 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-300 delay-75">
          <button
            onClick={handleAddToCart}
            disabled={!isAuthenticated || adding || (product.stock_quantity != null && product.stock_quantity <= 0)}
            className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 min-h-[40px] sm:min-h-[44px] ${
              added
                ? 'bg-gradient-to-r from-accent-emerald to-emerald-500 text-white shadow-glow'
                : 'bg-gradient-to-r from-marsana-500 to-accent-violet text-white shadow-glow-sm hover:shadow-glow'
            } disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl`}
            aria-label="Add to cart"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Added</span>
              </>
            ) : adding ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </>
            )}
          </button>
        </div>

        {/* Quick View Button */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-300 delay-100">
          <a
            href={`/products/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:flex items-center justify-center p-3 bg-white/90 dark:bg-surface-800/90 backdrop-blur-xl rounded-xl shadow-soft transition-all duration-300 hover:scale-110 text-surface-600 dark:text-surface-400"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-5">
        {/* Category */}
        {product.category_name && (
          <p className="text-[10px] sm:text-xs font-medium text-marsana-500 dark:text-marsana-400 mb-1 sm:mb-1.5 uppercase tracking-wider">
            {product.category_name}
          </p>
        )}

        {/* Name */}
        <h3 className="text-xs sm:text-sm font-semibold text-surface-900 dark:text-white line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-marsana-600 dark:group-hover:text-marsana-400 transition-colors duration-200 leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-surface-200 dark:text-surface-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs text-surface-500 dark:text-surface-400">
            ({product.review_count})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={`text-sm sm:text-base lg:text-lg font-bold ${hasDiscount ? 'text-accent-rose' : 'text-surface-900 dark:text-white'}`}>
            {formatPrice(hasDiscount ? product.discount_price : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-surface-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Indicator */}
        {product.stock_quantity !== undefined && (
          <div className="mt-1.5 sm:mt-2">
            {product.stock_quantity > 10 ? (
              <span className="text-[10px] sm:text-xs text-accent-emerald font-medium">In Stock</span>
            ) : product.stock_quantity > 0 ? (
              <span className="text-[10px] sm:text-xs text-accent-amber font-medium">Only {product.stock_quantity} left</span>
            ) : (
              <span className="text-[10px] sm:text-xs text-accent-rose font-medium">Out of Stock</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
