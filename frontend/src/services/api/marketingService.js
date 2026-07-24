import api from './client';

const BASE = '/admin/marketing';

const marketingService = {
  getDashboard: async () => {
    const response = await api.get(`${BASE}/dashboard`);
    return response.data;
  },

  // Email Campaigns
  getEmailCampaigns: async (page = 1, limit = 20) => {
    const response = await api.get(`${BASE}/email-campaigns`, { params: { page, limit } });
    return response.data;
  },

  getEmailCampaign: async (id) => {
    const response = await api.get(`${BASE}/email-campaigns/${id}`);
    return response.data;
  },

  createEmailCampaign: async (data) => {
    const response = await api.post(`${BASE}/email-campaigns`, data);
    return response.data;
  },

  updateEmailCampaign: async (id, data) => {
    const response = await api.put(`${BASE}/email-campaigns/${id}`, data);
    return response.data;
  },

  deleteEmailCampaign: async (id) => {
    const response = await api.delete(`${BASE}/email-campaigns/${id}`);
    return response.data;
  },

  sendEmailCampaign: async (id) => {
    const response = await api.post(`${BASE}/email-campaigns/${id}/send`);
    return response.data;
  },

  scheduleEmailCampaign: async (id, scheduledAt) => {
    const response = await api.post(`${BASE}/email-campaigns/${id}/schedule`, { scheduled_at: scheduledAt });
    return response.data;
  },

  // SMS Campaigns
  getSMSCampaigns: async (page = 1, limit = 20) => {
    const response = await api.get(`${BASE}/sms-campaigns`, { params: { page, limit } });
    return response.data;
  },

  getSMSCampaign: async (id) => {
    const response = await api.get(`${BASE}/sms-campaigns/${id}`);
    return response.data;
  },

  createSMSCampaign: async (data) => {
    const response = await api.post(`${BASE}/sms-campaigns`, data);
    return response.data;
  },

  updateSMSCampaign: async (id, data) => {
    const response = await api.put(`${BASE}/sms-campaigns/${id}`, data);
    return response.data;
  },

  deleteSMSCampaign: async (id) => {
    const response = await api.delete(`${BASE}/sms-campaigns/${id}`);
    return response.data;
  },

  sendSMSCampaign: async (id) => {
    const response = await api.post(`${BASE}/sms-campaigns/${id}/send`);
    return response.data;
  },

  scheduleSMSCampaign: async (id, scheduledAt) => {
    const response = await api.post(`${BASE}/sms-campaigns/${id}/schedule`, { scheduled_at: scheduledAt });
    return response.data;
  },

  // Push Campaigns
  getPushCampaigns: async (page = 1, limit = 20) => {
    const response = await api.get(`${BASE}/push-campaigns`, { params: { page, limit } });
    return response.data;
  },

  getPushCampaign: async (id) => {
    const response = await api.get(`${BASE}/push-campaigns/${id}`);
    return response.data;
  },

  createPushCampaign: async (data) => {
    const response = await api.post(`${BASE}/push-campaigns`, data);
    return response.data;
  },

  updatePushCampaign: async (id, data) => {
    const response = await api.put(`${BASE}/push-campaigns/${id}`, data);
    return response.data;
  },

  deletePushCampaign: async (id) => {
    const response = await api.delete(`${BASE}/push-campaigns/${id}`);
    return response.data;
  },

  sendPushCampaign: async (id) => {
    const response = await api.post(`${BASE}/push-campaigns/${id}/send`);
    return response.data;
  },

  schedulePushCampaign: async (id, scheduledAt) => {
    const response = await api.post(`${BASE}/push-campaigns/${id}/schedule`, { scheduled_at: scheduledAt });
    return response.data;
  },

  // Campaign Logs
  getCampaignLogs: async (params = {}) => {
    const response = await api.get(`${BASE}/campaign-logs`, { params });
    return response.data;
  },

  // Affiliate Programs
  getAffiliatePrograms: async () => {
    const response = await api.get(`${BASE}/affiliate-programs`);
    return response.data;
  },

  getAffiliateProgram: async (id) => {
    const response = await api.get(`${BASE}/affiliate-programs/${id}`);
    return response.data;
  },

  createAffiliateProgram: async (data) => {
    const response = await api.post(`${BASE}/affiliate-programs`, data);
    return response.data;
  },

  updateAffiliateProgram: async (id, data) => {
    const response = await api.put(`${BASE}/affiliate-programs/${id}`, data);
    return response.data;
  },

  deleteAffiliateProgram: async (id) => {
    const response = await api.delete(`${BASE}/affiliate-programs/${id}`);
    return response.data;
  },

  // Affiliates
  getAffiliates: async (page = 1, limit = 20, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await api.get(`${BASE}/affiliates`, { params });
    return response.data;
  },

  getAffiliateSummary: async () => {
    const response = await api.get(`${BASE}/affiliates/summary`);
    return response.data;
  },

  getAffiliate: async (id) => {
    const response = await api.get(`${BASE}/affiliates/${id}`);
    return response.data;
  },

  createAffiliate: async (data) => {
    const response = await api.post(`${BASE}/affiliates`, data);
    return response.data;
  },

  approveAffiliate: async (id) => {
    const response = await api.post(`${BASE}/affiliates/${id}/approve`);
    return response.data;
  },

  rejectAffiliate: async (id) => {
    const response = await api.post(`${BASE}/affiliates/${id}/reject`);
    return response.data;
  },

  // Affiliate Links
  getAffiliateLinks: async (affiliateId) => {
    const response = await api.get(`${BASE}/affiliates/${affiliateId}/links`);
    return response.data;
  },

  createAffiliateLink: async (affiliateId, data) => {
    const response = await api.post(`${BASE}/affiliates/${affiliateId}/links`, data);
    return response.data;
  },

  // Affiliate Earnings
  getAffiliateEarnings: async (affiliateId, page = 1, limit = 20) => {
    const response = await api.get(`${BASE}/affiliates/${affiliateId}/earnings`, {
      params: { page, limit },
    });
    return response.data;
  },
};

export default marketingService;
