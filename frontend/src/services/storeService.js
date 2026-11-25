import apiClient, { normalizeApiError } from './apiClient';

export const storeService = {
  async getStoreSettings() {
    try {
      const { data } = await apiClient.get('/store/settings');
      return { ok: true, settings: data.settings };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error) };
    }
  },

  async submitContactEnquiry(payload) {
    try {
      const { data } = await apiClient.post('/contact', payload);
      return { ok: true, message: data.message };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error) };
    }
  },

  async subscribeNewsletter(email) {
    try {
      const { data } = await apiClient.post('/newsletter', { email });
      return { ok: true, message: data.message };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error) };
    }
  },

  async trackEvent(payload) {
    try {
      await apiClient.post('/analytics/events', payload);
    } catch {
      // Analytics tracking must never interrupt storefront UX
    }
  },
};
