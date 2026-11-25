import { describe, expect, it } from 'vitest';
import { STORE_CONFIG } from '../config/storeConfig';
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../data/sampleCatalog';
import {
  formatINR,
  getDiscountPercent,
  getStoreDirectionsUrl,
  getStoreMapEmbedUrl,
  getStorePlaceSearchUrl,
} from '../utils/formatters';

describe('Official Store Configuration & Sample Seed Integrity', () => {
  it('retains exact official business identity and Google Maps Place ID', () => {
    expect(STORE_CONFIG.businessName).toBe('Anil Ji Ka Gokul Ghee');
    expect(STORE_CONFIG.brandDisplayName).toBe('GOKUL GHEE');
    expect(STORE_CONFIG.tagline).toBe('Tradition in Every Taste.');
    expect(STORE_CONFIG.phone).toBe('+91 89863 65592');
    expect(STORE_CONFIG.hours).toBe('9:00 AM – 9:00 PM daily');
    expect(STORE_CONFIG.googleMapsPlaceId).toBe('ChIJ53Oz9XZX7TkRW_5zLDQrlaI');
    expect(STORE_CONFIG.googleBusinessUrl).toBe(
      'https://www.google.com/search?q=gokul+ghee+anand+bazar+danapur'
    );
    expect(STORE_CONFIG.address.fullFormatted).toContain('Math Road');
    expect(STORE_CONFIG.address.fullFormatted).toContain('Near Hindu Society Mandir');
    expect(STORE_CONFIG.address.fullFormatted).toContain('Anand Bazar, Danapur Cantonment');
    expect(STORE_CONFIG.address.fullFormatted).toContain('801503');
  });

  it('builds Google Maps directions, place search, and fallback embed URLs using Place ID', () => {
    const dirUrl = getStoreDirectionsUrl();
    const searchUrl = getStorePlaceSearchUrl();
    const embedWithoutKey = getStoreMapEmbedUrl('');
    const embedWithKey = getStoreMapEmbedUrl('TEST_KEY');

    expect(dirUrl).toContain('destination_place_id=ChIJ53Oz9XZX7TkRW_5zLDQrlaI');
    expect(searchUrl).toContain('query_place_id=ChIJ53Oz9XZX7TkRW_5zLDQrlaI');
    expect(embedWithoutKey).toContain('maps.google.com/maps?q=');
    expect(embedWithKey).toContain('place_id:ChIJ53Oz9XZX7TkRW_5zLDQrlaI');
  });

  it('includes all 7 required product categories and flags every seed record as sample data', () => {
    const categoryNames = SAMPLE_CATEGORIES.map((c) => c.name);
    expect(categoryNames).toEqual([
      'Desi Ghee',
      'Mithai',
      'Samosa',
      'Namkeen',
      'Traditional Snacks',
      'Special Combos',
      'Festival Specials',
    ]);

    for (const cat of SAMPLE_CATEGORIES) {
      expect(cat.isSampleData).toBe(true);
    }
    for (const prod of SAMPLE_PRODUCTS) {
      expect(prod.isSampleData).toBe(true);
      expect(prod.variants.length).toBeGreaterThan(0);
    }
  });

  it('formats INR amounts and discount percentages accurately', () => {
    expect(formatINR(1190)).toContain('1,190');
    expect(getDiscountPercent(1000, 800)).toBe(20);
    expect(getDiscountPercent(500, 500)).toBe(0);
  });
});
