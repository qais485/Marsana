import api from './client';

export const homeService = {
  async getHomepageData() {
    const response = await api.get('/home');
    return response.data;
  },

  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async subscribeNewsletter(email) {
    const response = await api.post('/newsletter/subscribe', { email });
    return response.data;
  },

  async getBlogPosts(limit = 3) {
    const response = await api.get('/blog/posts', { params: { limit } });
    return response.data;
  },
};
