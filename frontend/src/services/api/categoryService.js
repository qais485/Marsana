import api from './client';

export const categoryService = {
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  async getAllCategories() {
    const response = await api.get('/categories/all');
    return response.data;
  },

  async getFeaturedCategories(limit = 6) {
    const response = await api.get('/categories/featured', { params: { limit } });
    return response.data;
  },

  async getCategoryBySlug(slug) {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },

  async getCategoryChildren(slug) {
    const response = await api.get(`/categories/${slug}/children`);
    return response.data;
  },
};
