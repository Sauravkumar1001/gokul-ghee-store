import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'gokul_ghee_recently_viewed_slugs';
const MAX_ITEMS = 4;

export function useRecentlyViewed(currentSlug) {
  const [recentSlugs, setRecentSlugs] = useState([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setRecentSlugs(parsed);
      }
    } catch {
      setRecentSlugs([]);
    }
  }, []);

  const recordView = useCallback((slug) => {
    if (!slug) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const prev = raw ? JSON.parse(raw) : [];
      const filtered = Array.isArray(prev) ? prev.filter((item) => item !== slug) : [];
      const updated = [slug, ...filtered].slice(0, MAX_ITEMS + 1);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentSlugs(updated);
    } catch {
      // Ignore storage failures cleanly
    }
  }, []);

  const visibleSlugs = recentSlugs.filter((slug) => slug !== currentSlug).slice(0, MAX_ITEMS);

  return { visibleSlugs, recordView };
}
