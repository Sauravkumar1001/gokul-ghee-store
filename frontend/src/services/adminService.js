import apiClient, { normalizeApiError } from './apiClient';

async function safeAdminRequest(fn) {
  try {
    const response = await fn();
    return { ok: true, data: response.data };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}

export const adminService = {
  getDashboard() {
    return safeAdminRequest(() => apiClient.get('/admin/dashboard'));
  },

  getAnalytics() {
    return safeAdminRequest(() => apiClient.get('/admin/analytics'));
  },

  getUsageMeter() {
    return safeAdminRequest(() => apiClient.get('/admin/usage-meter'));
  },

  uploadImages(files) {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
    return safeAdminRequest(() =>
      apiClient.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  },

  getCategories() {
    return safeAdminRequest(() => apiClient.get('/admin/categories'));
  },
  createCategory(payload) {
    return safeAdminRequest(() => apiClient.post('/admin/categories', payload));
  },
  updateCategory(id, payload) {
    return safeAdminRequest(() =>
      apiClient.patch(`/admin/categories/${encodeURIComponent(id)}`, payload)
    );
  },
  deleteCategory(id) {
    return safeAdminRequest(() =>
      apiClient.delete(`/admin/categories/${encodeURIComponent(id)}`)
    );
  },

  getProducts(params = {}) {
    return safeAdminRequest(() => apiClient.get('/admin/products', { params }));
  },
  createProduct(payload) {
    return safeAdminRequest(() => apiClient.post('/admin/products', payload));
  },
  updateProduct(id, payload) {
    return safeAdminRequest(() =>
      apiClient.patch(`/admin/products/${encodeURIComponent(id)}`, payload)
    );
  },
  deleteProduct(id) {
    return safeAdminRequest(() =>
      apiClient.delete(`/admin/products/${encodeURIComponent(id)}`)
    );
  },

  getInventory() {
    return safeAdminRequest(() => apiClient.get('/admin/inventory'));
  },
  adjustInventory(payload) {
    return safeAdminRequest(() => apiClient.post('/admin/inventory/adjust', payload));
  },

  getOrders(params = {}) {
    return safeAdminRequest(() => apiClient.get('/admin/orders', { params }));
  },
  getOrderDetail(id) {
    return safeAdminRequest(() =>
      apiClient.get(`/admin/orders/${encodeURIComponent(id)}`)
    );
  },
  updateOrderStatus(id, payload) {
    return safeAdminRequest(() =>
      apiClient.patch(`/admin/orders/${encodeURIComponent(id)}/status`, payload)
    );
  },

  getCustomers(params = {}) {
    return safeAdminRequest(() => apiClient.get('/admin/customers', { params }));
  },
  getCustomerDetail(id) {
    return safeAdminRequest(() =>
      apiClient.get(`/admin/customers/${encodeURIComponent(id)}`)
    );
  },

  getDeliveryZones() {
    return safeAdminRequest(() => apiClient.get('/admin/delivery-zones'));
  },
  createDeliveryZone(payload) {
    return safeAdminRequest(() => apiClient.post('/admin/delivery-zones', payload));
  },
  updateDeliveryZone(id, payload) {
    return safeAdminRequest(() =>
      apiClient.patch(`/admin/delivery-zones/${encodeURIComponent(id)}`, payload)
    );
  },
  deleteDeliveryZone(id) {
    return safeAdminRequest(() =>
      apiClient.delete(`/admin/delivery-zones/${encodeURIComponent(id)}`)
    );
  },

  getCoupons() {
    return safeAdminRequest(() => apiClient.get('/admin/coupons'));
  },
  createCoupon(payload) {
    return safeAdminRequest(() => apiClient.post('/admin/coupons', payload));
  },
  updateCoupon(id, payload) {
    return safeAdminRequest(() =>
      apiClient.patch(`/admin/coupons/${encodeURIComponent(id)}`, payload)
    );
  },
  deleteCoupon(id) {
    return safeAdminRequest(() =>
      apiClient.delete(`/admin/coupons/${encodeURIComponent(id)}`)
    );
  },

  getReviews(params = {}) {
    return safeAdminRequest(() => apiClient.get('/admin/reviews', { params }));
  },
  moderateReview(id, status) {
    return safeAdminRequest(() =>
      apiClient.patch(`/admin/reviews/${encodeURIComponent(id)}`, { status })
    );
  },

  getSettings() {
    return safeAdminRequest(() => apiClient.get('/admin/settings'));
  },
  updateSettings(payload) {
    return safeAdminRequest(() => apiClient.put('/admin/settings', payload));
  },
};
