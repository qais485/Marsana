import api from './client';

export const authService = {
  async logout(refreshToken) {
    const response = await api.post('/auth/logout', { refresh_token: refreshToken });
    return response.data;
  },

  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  async socialLogin(data) {
    const response = await api.post('/auth/social/login', data);
    return response.data;
  },

  async getDevices() {
    const response = await api.get('/auth/devices');
    return response.data;
  },

  async getSessions() {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  async revokeDevice(deviceId) {
    const response = await api.post('/auth/devices/revoke', { device_id: deviceId });
    return response.data;
  },

  async revokeAllSessions() {
    const response = await api.post('/auth/sessions/revoke-all');
    return response.data;
  },
};
