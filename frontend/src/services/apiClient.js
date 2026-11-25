import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Normalize Axios errors into consistent UI-friendly messages, clearly
 * distinguishing unreachable backend servers (pre-Phase 3) from API errors.
 */
export function normalizeApiError(error) {
  if (!error.response) {
    return {
      isNetworkError: true,
      status: 0,
      message:
        'Backend API server is not connected yet. Live authentication and database persistence activate in Phase 3.',
    };
  }

  return {
    isNetworkError: false,
    status: error.response.status,
    message:
      error.response.data?.message ||
      'An unexpected server error occurred. Please try again.',
  };
}

export default apiClient;
