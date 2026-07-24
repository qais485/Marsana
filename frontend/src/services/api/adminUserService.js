import api from './client';

export const adminUserService = {
  async getUsers(params = {}) {
    const response = await api.get('/admin/users/list', { params });
    return response.data;
  },

  async getUser(userId) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  async updateUser(userId, data) {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data;
  },

  async toggleUserActive(userId) {
    const response = await api.patch(`/admin/users/${userId}/active`);
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};
