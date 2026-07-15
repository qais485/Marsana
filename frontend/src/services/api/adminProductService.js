import api from './client';

export const adminProductService = {
  async getProducts(params = {}) {
    const response = await api.get('/admin/products/list', { params });
    return response.data;
  },

  async getProduct(productId) {
    const response = await api.get(`/admin/products/${productId}`);
    return response.data;
  },

  async createProduct(data) {
    const response = await api.post('/admin/products', data);
    return response.data;
  },

  async updateProduct(productId, data) {
    const response = await api.put(`/admin/products/${productId}`, data);
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },

  async updateInventory(productId, stockQuantity) {
    const response = await api.patch(`/admin/products/${productId}/inventory`, {
      stock_quantity: stockQuantity,
    });
    return response.data;
  },

  async importProducts(products) {
    const response = await api.post('/admin/products/import', products);
    return response.data;
  },

  async exportProductsCsv(params = {}) {
    const response = await api.get('/admin/products/export/csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
