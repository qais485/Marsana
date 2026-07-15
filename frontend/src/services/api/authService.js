import api from './client';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async logout(refreshToken) {
    const response = await api.post('/auth/logout', { refresh_token: refreshToken });
    return response.data;
  },

  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  async sendEmailVerification(email) {
    const response = await api.post('/auth/email/verify/send', { email });
    return response.data;
  },

  async getEmailVerificationStatus(email) {
    const response = await api.get('/auth/email/verification/status', { params: { email } });
    return response.data;
  },

  async verifyEmail(token, code) {
    const response = await api.post('/auth/email/verify', { token, code });
    return response.data;
  },

  async changeEmail(newEmail, password) {
    const response = await api.post('/auth/email/change', {
      new_email: newEmail,
      password,
    });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/password/forgot', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/password/reset', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/password/change', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  async enable2FA(password) {
    const response = await api.post('/auth/2fa/enable', { password });
    return response.data;
  },

  async verify2FA(code) {
    const response = await api.post('/auth/2fa/verify', { code });
    return response.data;
  },

  async disable2FA(password, code) {
    const response = await api.post('/auth/2fa/disable', { password, code });
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

  async revokeAllSessions(password) {
    const response = await api.post('/auth/sessions/revoke-all', { password });
    return response.data;
  },
};
