import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartService } from '../services/api/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const EMPTY_CART = {
  id: null,
  items: [],
  summary: {
    subtotal: 0,
    discount_amount: 0,
    estimated_tax: 0,
    estimated_shipping: 0,
    gift_card_amount: 0,
    total: 0,
    coupon_code: null,
    gift_card_code: null,
    shipping_method: 'standard',
    item_count: 0,
  },
  saved_items: [],
};

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await cartService.getCart();
          if (!cancelled && response.success) {
            setCart(response.data);
          }
        } catch {
          if (!cancelled) setError('Failed to load cart');
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    } else {
      setCart(EMPTY_CART);
    }
  }, [isAuthenticated]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = useCallback(
    async (productId, quantity = 1, variantId = null) => {
      if (!isAuthenticated) {
        throw new Error('Please login to add items to cart');
      }
      try {
        setError(null);
        const response = await cartService.addToCart({
          product_id: productId,
          quantity,
          variant_id: variantId,
        });
        if (response.success) {
          setCart(response.data);
          return true;
        }
      } catch (err) {
        const message = err.response?.data?.detail || 'Failed to add item to cart';
        setError(message);
        throw new Error(message);
      }
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (!isAuthenticated) {
      throw new Error('Please login to update cart');
    }
    try {
      setError(null);
      const response = await cartService.updateQuantity(itemId, quantity);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update quantity';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      setError(null);
      const response = await cartService.removeFromCart(itemId);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError('Failed to remove item');
      throw err;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setError(null);
      const response = await cartService.clearCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError('Failed to clear cart');
      throw err;
    }
  }, []);

  const applyCoupon = useCallback(async (couponCode) => {
    try {
      setError(null);
      const response = await cartService.applyCoupon(couponCode);
      if (response.success) {
        setCart(response.data);
        return true;
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Invalid coupon code';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      setError(null);
      const response = await cartService.removeCoupon();
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError('Failed to remove coupon');
      throw err;
    }
  }, []);

  const applyGiftCard = useCallback(async (giftCardCode) => {
    try {
      setError(null);
      const response = await cartService.applyGiftCard(giftCardCode);
      if (response.success) {
        setCart(response.data);
        return true;
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Invalid gift card';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const removeGiftCard = useCallback(async () => {
    try {
      setError(null);
      const response = await cartService.removeGiftCard();
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError('Failed to remove gift card');
      throw err;
    }
  }, []);

  const setShippingMethod = useCallback(async (method) => {
    try {
      setError(null);
      const response = await cartService.setShippingMethod(method);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Invalid shipping method';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const saveForLater = useCallback(async (itemId) => {
    try {
      setError(null);
      const response = await cartService.saveForLater(itemId);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to save item';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const moveToCart = useCallback(async (savedItemId) => {
    try {
      setError(null);
      const response = await cartService.moveToCart(savedItemId);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to move item to cart';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const removeSavedItem = useCallback(async (savedItemId) => {
    try {
      setError(null);
      const response = await cartService.removeSavedItem(savedItemId);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError('Failed to remove saved item');
      throw err;
    }
  }, []);

  const itemCount = loading ? null : (cart.summary?.item_count || 0);

  const value = {
    cart,
    loading,
    error,
    itemCount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    applyGiftCard,
    removeGiftCard,
    setShippingMethod,
    saveForLater,
    moveToCart,
    removeSavedItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
