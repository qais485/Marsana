import api from './client';

export const adminCategoryService = {
  async getCategories() {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  async getCategory(categoryId) {
    const response = await api.get(`/admin/categories/${categoryId}`);
    return response.data;
  },

  async createCategory(data) {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  async updateCategory(categoryId, data) {
    const response = await api.put(`/admin/categories/${categoryId}`, data);
    return response.data;
  },

  async deleteCategory(categoryId) {
    const response = await api.delete(`/admin/categories/${categoryId}`);
    return response.data;
  },
};
