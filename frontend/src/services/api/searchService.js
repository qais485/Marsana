import api from './client';

export const searchService = {
  async getSuggestions(query) {
    const response = await api.get('/search/suggestions', {
      params: { q: query },
    });
    return response.data;
  },

  async getPopularSearches(limit = 10) {
    const response = await api.get('/search/popular', {
      params: { limit },
    });
    return response.data;
  },

  async search(query, page = 1, limit = 20) {
    const response = await api.get('/search', {
      params: { q: query, page, limit },
    });
    return response.data;
  },

  async getHistory(limit = 20) {
    const response = await api.get('/search/history', {
      params: { limit },
    });
    return response.data;
  },

  async addToHistory(query) {
    const response = await api.post('/search/history', { query });
    return response.data;
  },

  async removeFromHistory(historyId) {
    const response = await api.delete(`/search/history/${historyId}`);
    return response.data;
  },

  async clearHistory() {
    const response = await api.delete('/search/history');
    return response.data;
  },
};
