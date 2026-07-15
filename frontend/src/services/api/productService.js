import api from './client';

export const productService = {
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getFilterOptions() {
    const response = await api.get('/products/filters');
    return response.data;
  },

  async getProductDetail(slug) {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  async getProductReviews(productId, params = {}) {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  async createProductReview(productId, reviewData) {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  async toggleReviewHelpful(productId, reviewId) {
    const response = await api.post(`/products/${productId}/reviews/${reviewId}/helpful`);
    return response.data;
  },

  async reportReview(productId, reviewId, reportData) {
    const response = await api.post(`/products/${productId}/reviews/${reviewId}/report`, reportData);
    return response.data;
  },

  async getRelatedProducts(productId, limit = 4) {
    const response = await api.get(`/products/${productId}/related`, {
      params: { limit },
    });
    return response.data;
  },

  async getSimilarProducts(productId, limit = 4) {
    const response = await api.get(`/products/${productId}/similar`, {
      params: { limit },
    });
    return response.data;
  },
};
