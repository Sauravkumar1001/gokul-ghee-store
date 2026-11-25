import { useEffect, useState } from 'react';
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../data/sampleCatalog';
import { catalogService } from '../services/catalogService';

export function useCatalogData() {
  const [categories, setCategories] = useState(SAMPLE_CATEGORIES);
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [dataSource, setDataSource] = useState('seed');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return;
    let active = true;
    setIsRefreshing(true);

    Promise.all([
      catalogService.fetchCategories(),
      catalogService.fetchProducts({ limit: 48 }),
    ])
      .then(([catRes, prodRes]) => {
        if (!active) return;
        if (catRes.source === 'api' && catRes.categories.length > 0) {
          setCategories(catRes.categories);
        }
        if (prodRes.source === 'api' && prodRes.products.length > 0) {
          setProducts(prodRes.products);
          setDataSource('api');
        }
      })
      .catch(() => {
        // Retain seed fallback gracefully if API is unreachable
      })
      .finally(() => {
        if (active) setIsRefreshing(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { categories, products, dataSource, isRefreshing };
}
