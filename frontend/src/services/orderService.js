import apiClient, { normalizeApiError } from './apiClient';

async function safeRequest(fn) {
  try {
    const response = await fn();
    return { ok: true, data: response.data };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}

export const orderService = {
  getDeliveryZones() {
    return safeRequest(() => apiClient.get('/delivery/zones'));
  },

  checkPincode({ pincode, subtotal = 0 }) {
    return safeRequest(() =>
      apiClient.post('/delivery/check-pincode', { pincode, subtotal })
    );
  },

  validateCoupon({ code, subtotal = 0 }) {
    return safeRequest(() =>
      apiClient.post('/coupons/validate', { code, subtotal })
    );
  },

  getCheckoutQuote({ items, pincode, couponCode = '' }) {
    return safeRequest(() =>
      apiClient.post('/orders/quote', { items, pincode, couponCode })
    );
  },

  getPaymentConfig() {
    return safeRequest(() => apiClient.get('/payments/config'));
  },

  placeOrder(payload) {
    return safeRequest(() => apiClient.post('/orders', payload));
  },

  verifyRazorpayPayment(payload) {
    return safeRequest(() => apiClient.post('/payments/razorpay/verify', payload));
  },

  reportRazorpayFailure(payload) {
    return safeRequest(() => apiClient.post('/payments/razorpay/failure', payload));
  },

  getMyOrders(params = {}) {
    return safeRequest(() => apiClient.get('/orders/my', { params }));
  },

  getOrderById(orderId) {
    return safeRequest(() => apiClient.get(`/orders/${encodeURIComponent(orderId)}`));
  },

  cancelOrder(orderId, reason = 'Cancelled by customer') {
    return safeRequest(() =>
      apiClient.post(`/orders/${encodeURIComponent(orderId)}/cancel`, { reason })
    );
  },

  submitReview(payload) {
    return safeRequest(() => apiClient.post('/reviews', payload));
  },

  getMyReviews() {
    return safeRequest(() => apiClient.get('/reviews/my'));
  },

  getAddresses() {
    return safeRequest(() => apiClient.get('/users/addresses'));
  },

  createAddress(payload) {
    return safeRequest(() => apiClient.post('/users/addresses', payload));
  },

  setDefaultAddress(addressId) {
    return safeRequest(() =>
      apiClient.patch(`/users/addresses/${encodeURIComponent(addressId)}/default`)
    );
  },

  deleteAddress(addressId) {
    return safeRequest(() =>
      apiClient.delete(`/users/addresses/${encodeURIComponent(addressId)}`)
    );
  },

  getNotifications() {
    return safeRequest(() => apiClient.get('/notifications'));
  },

  markNotificationRead(id) {
    return safeRequest(() =>
      apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`)
    );
  },
};
