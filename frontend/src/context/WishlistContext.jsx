import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SAMPLE_PRODUCTS } from '../data/sampleCatalog';

const WISHLIST_STORAGE_KEY = 'gokul_ghee_wishlist_v1';

const WishlistContext = createContext(null);

function readStoredWishlist() {
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [slugs, setSlugs] = useState(readStoredWishlist);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      // Ignore storage quota errors
    }
  }, [slugs]);

  const isWishlisted = useCallback((slug) => slugs.includes(slug), [slugs]);

  const toggleWishlist = useCallback((slug) => {
    if (!slug) return;
    setSlugs((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [slug, ...prev]
    );
  }, []);

  const removeFromWishlist = useCallback((slug) => {
    setSlugs((prev) => prev.filter((item) => item !== slug));
  }, []);

  const wishlistProducts = useMemo(
    () =>
      slugs
        .map((slug) => SAMPLE_PRODUCTS.find((p) => p.slug === slug))
        .filter(Boolean),
    [slugs]
  );

  const value = useMemo(
    () => ({
      slugs,
      wishlistProducts,
      wishlistCount: wishlistProducts.length,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
    }),
    [slugs, wishlistProducts, isWishlisted, toggleWishlist, removeFromWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
