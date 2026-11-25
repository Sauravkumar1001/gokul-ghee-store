import { STORE_CONFIG } from '../config/storeConfig';

/**
 * Format Indian Rupee pricing cleanly with tabular numerals.
 */
export function formatINR(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compute discount percentage between MRP and selling price.
 */
export function getDiscountPercent(mrp, price) {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Build Google Maps Directions URL using exact official business name and Place ID.
 */
export function getStoreDirectionsUrl() {
  const query = encodeURIComponent(
    `${STORE_CONFIG.businessName}, ${STORE_CONFIG.address.fullFormatted}`
  );
  const placeId = encodeURIComponent(STORE_CONFIG.googleMapsPlaceId);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}&destination_place_id=${placeId}`;
}

/**
 * Build Google Maps Place search URL using Place ID fallback.
 */
export function getStorePlaceSearchUrl() {
  const query = encodeURIComponent(
    `${STORE_CONFIG.businessName}, ${STORE_CONFIG.address.line2}, ${STORE_CONFIG.address.city}`
  );
  const placeId = encodeURIComponent(STORE_CONFIG.googleMapsPlaceId);
  return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${placeId}`;
}

/**
 * Build Google Maps Embed iframe URL: uses Embed v1 with Place ID if API key exists,
 * otherwise falls back to standard Google Maps query embed without inventing coordinates.
 */
export function getStoreMapEmbedUrl(apiKey) {
  const placeId = encodeURIComponent(STORE_CONFIG.googleMapsPlaceId);
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
      apiKey
    )}&q=place_id:${placeId}`;
  }
  const query = encodeURIComponent(
    `${STORE_CONFIG.businessName}, ${STORE_CONFIG.address.line1}, ${STORE_CONFIG.address.line2}, ${STORE_CONFIG.address.city}, ${STORE_CONFIG.address.state} ${STORE_CONFIG.address.postalCode}`
  );
  return `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
}
