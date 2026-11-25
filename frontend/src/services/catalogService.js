import apiClient, { normalizeApiError } from './apiClient';
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../data/sampleCatalog';

export const catalogService = {
  async fetchCategories() {
    try {
      const { data } = await apiClient.get('/categories');
      if (data?.success && Array.isArray(data.categories) && data.categories.length > 0) {
        return { source: 'api', categories: data.categories };
      }
      return { source: 'seed', categories: SAMPLE_CATEGORIES };
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.isNetworkError) {
        return { source: 'seed', categories: SAMPLE_CATEGORIES };
      }
      throw error;
    }
  },

  async fetchProducts(params = {}) {
    try {
      const { data } = await apiClient.get('/products', { params });
      if (data?.success && Array.isArray(data.products)) {
        return {
          source: 'api',
          products: data.products,
          pagination: data.pagination,
        };
      }
      return { source: 'seed', products: SAMPLE_PRODUCTS };
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.isNetworkError) {
        return { source: 'seed', products: SAMPLE_PRODUCTS };
      }
      throw error;
    }
  },

  async fetchProductBySlug(slug) {
    try {
      const { data } = await apiClient.get(`/products/${encodeURIComponent(slug)}`);
      if (data?.success && data.product) {
        return {
          source: 'api',
          product: data.product,
          reviews: data.reviews || [],
          relatedProducts: data.relatedProducts || [],
        };
      }
      return { source: 'seed', product: SAMPLE_PRODUCTS.find((p) => p.slug === slug) || null };
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.isNetworkError) {
        return {
          source: 'seed',
          product: SAMPLE_PRODUCTS.find((p) => p.slug === slug) || null,
          reviews: [],
          relatedProducts: [],
        };
      }
      throw error;
    }
  },
};
