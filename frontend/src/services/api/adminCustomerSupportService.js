import api from './client';

export const adminCustomerSupportService = {
  async getContactMessages(params = {}) {
    const response = await api.get('/admin/support/contact-messages', { params });
    return response.data;
  },

  async getContactMessage(messageId) {
    const response = await api.get(`/admin/support/contact-messages/${messageId}`);
    return response.data;
  },

  async getContactStats() {
    const response = await api.get('/admin/support/contact-messages/stats');
    return response.data;
  },

  async updateContactMessage(messageId, data) {
    const response = await api.put(`/admin/support/contact-messages/${messageId}`, data);
    return response.data;
  },

  async deleteContactMessage(messageId) {
    const response = await api.delete(`/admin/support/contact-messages/${messageId}`);
    return response.data;
  },

  async getFAQItems(params = {}) {
    const response = await api.get('/admin/support/faq', { params });
    return response.data;
  },

  async getFAQItem(faqId) {
    const response = await api.get(`/admin/support/faq/${faqId}`);
    return response.data;
  },

  async getFAQCategories() {
    const response = await api.get('/admin/support/faq/categories');
    return response.data;
  },

  async createFAQItem(data) {
    const response = await api.post('/admin/support/faq', data);
    return response.data;
  },

  async updateFAQItem(faqId, data) {
    const response = await api.put(`/admin/support/faq/${faqId}`, data);
    return response.data;
  },

  async deleteFAQItem(faqId) {
    const response = await api.delete(`/admin/support/faq/${faqId}`);
    return response.data;
  },

  async getHelpArticles(params = {}) {
    const response = await api.get('/admin/support/help-articles', { params });
    return response.data;
  },

  async getHelpArticle(articleId) {
    const response = await api.get(`/admin/support/help-articles/${articleId}`);
    return response.data;
  },

  async getHelpCategories() {
    const response = await api.get('/admin/support/help-articles/categories');
    return response.data;
  },

  async createHelpArticle(data) {
    const response = await api.post('/admin/support/help-articles', data);
    return response.data;
  },

  async updateHelpArticle(articleId, data) {
    const response = await api.put(`/admin/support/help-articles/${articleId}`, data);
    return response.data;
  },

  async deleteHelpArticle(articleId) {
    const response = await api.delete(`/admin/support/help-articles/${articleId}`);
    return response.data;
  },
};
