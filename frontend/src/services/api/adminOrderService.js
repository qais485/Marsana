import api from './client';

export const adminOrderService = {
  async getOrders(params = {}) {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  async getOrderStats() {
    const response = await api.get('/admin/orders/stats');
    return response.data;
  },

  async getOrder(orderId) {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  async updateOrderStatus(orderId, data) {
    const response = await api.patch(`/admin/orders/${orderId}/status`, data);
    return response.data;
  },

  async refundOrder(orderId, data) {
    const response = await api.post(`/admin/orders/${orderId}/refund`, data);
    return response.data;
  },

  async updateOrderNotes(orderId, data) {
    const response = await api.patch(`/admin/orders/${orderId}/notes`, data);
    return response.data;
  },
};
