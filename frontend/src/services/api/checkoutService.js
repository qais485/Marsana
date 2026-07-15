import api from './client';

export const checkoutService = {
  async placeOrder(data) {
    const response = await api.post('/checkout', data);
    return response.data;
  },

  async placeGuestOrder(data) {
    const response = await api.post('/checkout/guest', data);
    return response.data;
  },

  async getOrders(page = 1, limit = 20) {
    const response = await api.get('/orders', { params: { page, limit } });
    return response.data;
  },

  async getOrder(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  async trackOrder(email, orderNumber) {
    const response = await api.post('/orders/track', {
      email,
      order_number: orderNumber,
    });
    return response.data;
  },

  async cancelOrder(orderId, reason) {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  async requestReturn(orderId, data) {
    const response = await api.post(`/orders/${orderId}/return`, data);
    return response.data;
  },

  async requestExchange(orderId, data) {
    const response = await api.post(`/orders/${orderId}/exchange`, data);
    return response.data;
  },

  async getInvoice(orderId) {
    const response = await api.get(`/orders/${orderId}/invoice`);
    return response.data;
  },

  async getShippingMethods(address, subtotal = 0) {
    const response = await api.post('/shipping/methods', address, {
      params: { subtotal },
    });
    return response.data;
  },

  async getPickupLocations() {
    const response = await api.get('/shipping/pickup-locations');
    return response.data;
  },

  async getOrderTracking(orderId) {
    const response = await api.get(`/orders/${orderId}/tracking`);
    return response.data;
  },
};
