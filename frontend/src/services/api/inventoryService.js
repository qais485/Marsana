import api from './client';

const BASE = '/admin/inventory';

const inventoryService = {
  getSummary: async () => {
    const response = await api.get(`${BASE}/summary`);
    return response.data;
  },

  getWarehouses: async (isActive) => {
    const params = {};
    if (isActive !== undefined) params.is_active = isActive;
    const response = await api.get(`${BASE}/warehouses`, { params });
    return response.data;
  },

  getWarehouse: async (id) => {
    const response = await api.get(`${BASE}/warehouses/${id}`);
    return response.data;
  },

  createWarehouse: async (data) => {
    const response = await api.post(`${BASE}/warehouses`, data);
    return response.data;
  },

  updateWarehouse: async (id, data) => {
    const response = await api.put(`${BASE}/warehouses/${id}`, data);
    return response.data;
  },

  deleteWarehouse: async (id) => {
    const response = await api.delete(`${BASE}/warehouses/${id}`);
    return response.data;
  },

  getWarehouseInventory: async (warehouseId, page = 1, limit = 20) => {
    const response = await api.get(`${BASE}/warehouses/${warehouseId}/inventory`, {
      params: { page, limit },
    });
    return response.data;
  },

  getProductInventory: async (page = 1, limit = 20, search) => {
    const params = { page, limit };
    if (search) params.search = search;
    const response = await api.get(`${BASE}/products`, { params });
    return response.data;
  },

  updateProductInventory: async (productId, data) => {
    const response = await api.patch(`${BASE}/products/${productId}`, data);
    return response.data;
  },

  adjustStock: async (data) => {
    const response = await api.post(`${BASE}/adjust`, data);
    return response.data;
  },

  bulkAdjustStock: async (adjustments) => {
    const response = await api.post(`${BASE}/adjust/bulk`, { adjustments });
    return response.data;
  },

  transferStock: async (data) => {
    const response = await api.post(`${BASE}/transfer`, data);
    return response.data;
  },

  getLowStockItems: async (page = 1, limit = 20) => {
    const response = await api.get(`${BASE}/low-stock`, {
      params: { page, limit },
    });
    return response.data;
  },

  getOutOfStockItems: async (page = 1, limit = 20) => {
    const response = await api.get(`${BASE}/out-of-stock`, {
      params: { page, limit },
    });
    return response.data;
  },

  getStockAlerts: async (page = 1, limit = 20, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await api.get(`${BASE}/alerts`, { params });
    return response.data;
  },

  resolveAlert: async (alertId, notes) => {
    const response = await api.patch(`${BASE}/alerts/${alertId}/resolve`, { notes });
    return response.data;
  },

  getInventoryHistory: async (page = 1, limit = 20, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await api.get(`${BASE}/history`, { params });
    return response.data;
  },
};

export default inventoryService;
