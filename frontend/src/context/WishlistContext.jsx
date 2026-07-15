import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { wishlistService } from '../services/api/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await wishlistService.getWishlist();
      if (response.success) {
        setItems(response.data || []);
      }
    } catch {
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = useCallback(async (product) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to wishlist');
    }
    try {
      setError(null);
      const response = await wishlistService.addToWishlist({
        product_id: product.id,
        variant_id: product.variant_id || null,
        product_name: product.name,
        product_price: String(product.price),
        product_image: product.image || null,
      });
      if (response.success) {
        await fetchWishlist();
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to add to wishlist';
      setError(message);
      return { success: false, message };
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to remove items from wishlist');
    }
    try {
      setError(null);
      const response = await wishlistService.removeFromWishlist(productId);
      if (response.success) {
        setItems((prev) => prev.filter((item) => item.product_id !== productId));
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to remove from wishlist';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Please login to clear wishlist');
    }
    try {
      setError(null);
      const response = await wishlistService.clearWishlist();
      if (response.success) {
        setItems([]);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to clear wishlist';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const shareWishlistItem = useCallback(async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to share wishlist');
    }
    try {
      setError(null);
      const response = await wishlistService.shareWishlistItem(productId);
      if (response.success) {
        return { success: true, data: response.data };
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to generate share link';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const moveToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to move items to cart');
    }
    try {
      setError(null);
      const response = await wishlistService.moveToCart(productId, quantity);
      if (response.success) {
        setItems((prev) => prev.filter((item) => item.product_id !== productId));
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to move to cart';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const isInWishlist = useCallback((productId) => {
    return items.some((item) => item.product_id === productId);
  }, [items]);

  const itemCount = items.length;

  const value = {
    items,
    loading,
    error,
    itemCount,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    shareWishlistItem,
    moveToCart,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
