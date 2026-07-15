import api from './client';

export const cartService = {
  async getCart() {
    const response = await api.get('/cart');
    return response.data;
  },

  async addToCart(data) {
    const response = await api.post('/cart/items', data);
    return response.data;
  },

  async updateQuantity(itemId, quantity) {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  async removeFromCart(itemId) {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  async clearCart() {
    const response = await api.delete('/cart');
    return response.data;
  },

  async applyCoupon(couponCode) {
    const response = await api.post('/cart/coupon', { coupon_code: couponCode });
    return response.data;
  },

  async removeCoupon() {
    const response = await api.delete('/cart/coupon');
    return response.data;
  },

  async applyGiftCard(giftCardCode) {
    const response = await api.post('/cart/gift-card', { gift_card_code: giftCardCode });
    return response.data;
  },

  async removeGiftCard() {
    const response = await api.delete('/cart/gift-card');
    return response.data;
  },

  async setShippingMethod(shippingMethod) {
    const response = await api.post('/cart/shipping', { shipping_method: shippingMethod });
    return response.data;
  },

  async getShippingMethods() {
    const response = await api.get('/cart/shipping-methods');
    return response.data;
  },

  async saveForLater(itemId) {
    const response = await api.post(`/cart/save-for-later/${itemId}`);
    return response.data;
  },

  async moveToCart(savedItemId) {
    const response = await api.post(`/cart/move-to-cart/${savedItemId}`);
    return response.data;
  },

  async removeSavedItem(savedItemId) {
    const response = await api.delete(`/cart/saved/${savedItemId}`);
    return response.data;
  },
};
