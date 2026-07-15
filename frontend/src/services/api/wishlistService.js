import api from './client';

export const wishlistService = {
  async getWishlist() {
    const response = await api.get('/profile/wishlist');
    return response.data;
  },

  async addToWishlist(data) {
    const response = await api.post('/profile/wishlist', data);
    return response.data;
  },

  async removeFromWishlist(productId) {
    const response = await api.delete(`/profile/wishlist/${productId}`);
    return response.data;
  },

  async clearWishlist() {
    const response = await api.delete('/profile/wishlist');
    return response.data;
  },

  async shareWishlistItem(productId) {
    const response = await api.post(`/profile/wishlist/${productId}/share`);
    return response.data;
  },

  async moveToCart(productId, quantity = 1) {
    const response = await api.post(`/profile/wishlist/${productId}/move-to-cart`, { quantity });
    return response.data;
  },

  async getSharedWishlist(shareToken) {
    const response = await api.get(`/wishlist/shared/${shareToken}`);
    return response.data;
  },
};
