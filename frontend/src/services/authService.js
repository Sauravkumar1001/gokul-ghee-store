import apiClient, { normalizeApiError } from './apiClient';

export const authService = {
  async getCaptcha() {
    try {
      const { data } = await apiClient.get('/auth/captcha');
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error) };
    }
  },

  async login(credentials) {
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error) };
    }
  },

  async register(payload) {
    try {
      const { data } = await apiClient.post('/auth/register', payload);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error) };
    }
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
      return { ok: true };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error) };
    }
  },

  async getCurrentUser() {
    try {
      const { data } = await apiClient.get('/auth/me');
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error) };
    }
  },

  async getMyOrders() {
    try {
      const { data } = await apiClient.get('/orders/my');
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error) };
    }
  },

  async getOrderById(orderId) {
    try {
      const { data } = await apiClient.get(`/orders/${encodeURIComponent(orderId)}`);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error) };
    }
  },
};
