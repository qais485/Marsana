import api from './client';

export const adminService = {
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getUserStats() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async getProductStats() {
    const response = await api.get('/admin/products');
    return response.data;
  },

  async getSalesStats() {
    const response = await api.get('/admin/sales');
    return response.data;
  },

  async getRevenueStats() {
    const response = await api.get('/admin/revenue');
    return response.data;
  },
};
