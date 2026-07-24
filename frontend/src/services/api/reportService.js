import api from './client';

export const reportService = {
  async getSalesReport(params = {}) {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  },

  async getProductReport(params = {}) {
    const response = await api.get('/reports/products', { params });
    return response.data;
  },

  async getCustomerReport(params = {}) {
    const response = await api.get('/reports/customers', { params });
    return response.data;
  },

  async getInventoryReport(params = {}) {
    const response = await api.get('/reports/inventory', { params });
    return response.data;
  },

  async getFinancialReport(params = {}) {
    const response = await api.get('/reports/financial', { params });
    return response.data;
  },
};
