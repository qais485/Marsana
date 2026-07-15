import { useState, useRef, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
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
  const addedTimeoutRef = useRef(null);
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const inWishlist = isInWishlist(product.id);

  const images = typeof product.images === 'string' ? product.images.split(',').filter(Boolean) : [];
  const primaryImage = images[0] || 'https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image';

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
      if (addedTimeoutRef.current) {
        clearTimeout(addedTimeoutRef.current);
      }
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
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            -{discountPercent}%
          </span>
        )}

        {product.is_new_arrival && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            New
          </span>
        )}

        <button
          onClick={handleWishlistToggle}
          disabled={!isAuthenticated || wishlistLoading}
          className={`absolute p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-10 disabled:opacity-50 disabled:cursor-not-allowed ${
            product.is_new_arrival ? 'top-12 right-2' : 'top-2 right-2'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
          />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={!isAuthenticated || adding || (product.stock_quantity != null && product.stock_quantity <= 0)}
          className={`absolute bottom-2 right-2 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all ${
            added
              ? 'bg-green-500 text-white'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Add to cart"
        >
          {added ? (
            <Check className="w-4 h-4" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.floor(product.rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.review_count})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
            {formatPrice(hasDiscount ? product.discount_price : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
