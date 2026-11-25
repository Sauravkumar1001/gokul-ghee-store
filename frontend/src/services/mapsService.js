import apiClient, { normalizeApiError } from './apiClient';

async function safeRequest(fn) {
  try {
    const response = await fn();
    return { ok: true, data: response.data };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}

export const mapsService = {
  getConfig() {
    return safeRequest(() => apiClient.get('/maps/config'));
  },

  getStorePlace() {
    return safeRequest(() => apiClient.get('/maps/store-place'));
  },

  geocodeAddress(payload) {
    return safeRequest(() => apiClient.post('/maps/geocode', payload));
  },
};
