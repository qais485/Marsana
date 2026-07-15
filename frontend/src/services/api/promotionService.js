import api from './client';

export const promotionService = {
  async validateCoupon(code, subtotal) {
    const response = await api.post('/promotions/coupon/validate', null, {
      params: { code, subtotal },
    });
    return response.data;
  },

  async getAdminCoupons(params = {}) {
    const response = await api.get('/promotions/admin/coupons', { params });
    return response.data;
  },

  async createCoupon(data) {
    const response = await api.post('/promotions/admin/coupons', data);
    return response.data;
  },

  async updateCoupon(id, data) {
    const response = await api.put(`/promotions/admin/coupons/${id}`, data);
    return response.data;
  },

  async deleteCoupon(id) {
    const response = await api.delete(`/promotions/admin/coupons/${id}`);
    return response.data;
  },

  async getAdminDiscounts(params = {}) {
    const response = await api.get('/promotions/admin/discounts', { params });
    return response.data;
  },

  async createDiscount(data) {
    const response = await api.post('/promotions/admin/discounts', data);
    return response.data;
  },

  async updateDiscount(id, data) {
    const response = await api.put(`/promotions/admin/discounts/${id}`, data);
    return response.data;
  },

  async deleteDiscount(id) {
    const response = await api.delete(`/promotions/admin/discounts/${id}`);
    return response.data;
  },

  async getAdminFlashSales(params = {}) {
    const response = await api.get('/promotions/admin/flash-sales', { params });
    return response.data;
  },

  async createFlashSale(data) {
    const response = await api.post('/promotions/admin/flash-sales', data);
    return response.data;
  },

  async updateFlashSale(id, data) {
    const response = await api.put(`/promotions/admin/flash-sales/${id}`, data);
    return response.data;
  },

  async deleteFlashSale(id) {
    const response = await api.delete(`/promotions/admin/flash-sales/${id}`);
    return response.data;
  },

  async addFlashSaleItem(saleId, data) {
    const response = await api.post(`/promotions/admin/flash-sales/${saleId}/items`, data);
    return response.data;
  },

  async removeFlashSaleItem(itemId) {
    const response = await api.delete(`/promotions/admin/flash-sales/items/${itemId}`);
    return response.data;
  },

  async getLoyaltyBalance() {
    const response = await api.get('/promotions/loyalty/balance');
    return response.data;
  },

  async redeemLoyaltyPoints(points) {
    const response = await api.post('/promotions/loyalty/redeem', { points });
    return response.data;
  },

  async getLoyaltyTransactions(params = {}) {
    const response = await api.get('/promotions/loyalty/transactions', { params });
    return response.data;
  },

  async getReferralCode() {
    const response = await api.get('/promotions/referral/code');
    return response.data;
  },

  async applyReferral(code) {
    const response = await api.post('/promotions/referral/apply', { referral_code: code });
    return response.data;
  },

  async getReferralRewards(params = {}) {
    const response = await api.get('/promotions/referral/rewards', { params });
    return response.data;
  },
};
