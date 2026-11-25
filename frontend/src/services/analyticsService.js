import apiClient from './apiClient';

const VISITOR_KEY = 'gokul_visitor_id_v1';

function getOrCreateVisitorId() {
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

export const analyticsService = {
  trackEvent({ eventType, path = '', productId = null, metadata = {} }) {
    if (import.meta.env.MODE === 'test' || !eventType) return;
    try {
      const visitorId = getOrCreateVisitorId();
      apiClient
        .post('/analytics/events', {
          eventType,
          visitorId,
          path: path || (typeof window !== 'undefined' ? window.location.pathname : ''),
          productId,
          metadata,
        })
        .catch(() => {});
    } catch {
      // Non-blocking analytics
    }
  },
};
