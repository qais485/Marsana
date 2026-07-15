import api from './client';

export const profileService = {
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/profile', data);
    return response.data;
  },

  async deleteAccount(password) {
    const response = await api.delete('/profile', {
      data: { password, confirmation: 'DELETE_MY_ACCOUNT' },
    });
    return response.data;
  },

  async getAddresses() {
    const response = await api.get('/profile/addresses');
    return response.data;
  },

  async createAddress(data) {
    const response = await api.post('/profile/addresses', data);
    return response.data;
  },

  async updateAddress(addressId, data) {
    const response = await api.put(`/profile/addresses/${addressId}`, data);
    return response.data;
  },

  async deleteAddress(addressId) {
    const response = await api.delete(`/profile/addresses/${addressId}`);
    return response.data;
  },

  async getRecentlyViewed(limit = 20) {
    const response = await api.get('/profile/recently-viewed', { params: { limit } });
    return response.data;
  },

  async addRecentlyViewed(data) {
    const response = await api.post('/profile/recently-viewed', data);
    return response.data;
  },

  async clearRecentlyViewed() {
    const response = await api.delete('/profile/recently-viewed');
    return response.data;
  },

  async getNotifications() {
    const response = await api.get('/profile/notifications');
    return response.data;
  },

  async markNotificationRead(notificationId) {
    const response = await api.patch(`/profile/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllNotificationsRead() {
    const response = await api.put('/profile/notifications/read-all');
    return response.data;
  },

  async getPrivacySettings() {
    const response = await api.get('/profile/privacy');
    return response.data;
  },

  async updatePrivacySettings(data) {
    const response = await api.patch('/profile/privacy', data);
    return response.data;
  },

  async getAccountSettings() {
    const response = await api.get('/profile/settings');
    return response.data;
  },

  async updateAccountSettings(data) {
    const response = await api.patch('/profile/settings', data);
    return response.data;
  },
};
