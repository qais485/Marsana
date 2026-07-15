import api from './client';

export const adminNotificationService = {
  async getTemplates(params = {}) {
    const response = await api.get('/admin/notification-templates', { params });
    return response.data;
  },

  async getTemplate(id) {
    const response = await api.get(`/admin/notification-templates/${id}`);
    return response.data;
  },

  async createTemplate(data) {
    const response = await api.post('/admin/notification-templates', data);
    return response.data;
  },

  async updateTemplate(id, data) {
    const response = await api.put(`/admin/notification-templates/${id}`, data);
    return response.data;
  },

  async toggleTemplate(id) {
    const response = await api.patch(`/admin/notification-templates/${id}/toggle`);
    return response.data;
  },

  async deleteTemplate(id) {
    const response = await api.delete(`/admin/notification-templates/${id}`);
    return response.data;
  },

  async getNotifications(params = {}) {
    const response = await api.get('/admin/notifications', { params });
    return response.data;
  },

  async getNotificationStats() {
    const response = await api.get('/admin/notifications/stats');
    return response.data;
  },

  async createNotification(data) {
    const response = await api.post('/admin/notifications', data);
    return response.data;
  },

  async broadcastNotification(data) {
    const response = await api.post('/admin/notifications/broadcast', data);
    return response.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(`/admin/notifications/${id}`);
    return response.data;
  },
};
