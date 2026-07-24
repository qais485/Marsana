import api from './client';

export const adminSettingsService = {
  async getAllSettings() {
    const response = await api.get('/admin/settings/');
    return response.data;
  },

  async getSettingsByCategory(category) {
    const response = await api.get(`/admin/settings/${category}`);
    return response.data;
  },

  async getSettingByKey(key) {
    const response = await api.get(`/admin/settings/key/${key}`);
    return response.data;
  },

  async updateSetting(key, value) {
    const response = await api.put(`/admin/settings/key/${key}`, { value });
    return response.data;
  },

  async updateSettingsBulk(settings) {
    const response = await api.put('/admin/settings/bulk', { settings });
    return response.data;
  },

  async initializeDefaultSettings() {
    const response = await api.post('/admin/settings/initialize');
    return response.data;
  },
};
