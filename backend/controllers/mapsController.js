import { env } from '../config/env.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { DEFAULT_STORE_SETTINGS } from './storeController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function extractAddressComponent(components = [], types = []) {
  for (const type of types) {
    const match = components.find((c) => Array.isArray(c.types) && c.types.includes(type));
    if (match) return match.long_name || '';
  }
  return '';
}

function normalizeGoogleGeocodeResult(result) {
  const components = result.address_components || [];
  const streetNumber = extractAddressComponent(components, ['street_number', 'premise']);
  const route = extractAddressComponent(components, ['route', 'sublocality_level_2']);
  const locality = extractAddressComponent(components, [
    'sublocality_level_1',
    'sublocality',
    'neighborhood',
  ]);
  const landmark = extractAddressComponent(components, [
    'point_of_interest',
    'establishment',
    'landmark',
  ]);
  const city =
    extractAddressComponent(components, ['locality', 'administrative_area_level_2']) || 'Patna';
  const state =
    extractAddressComponent(components, ['administrative_area_level_1']) || 'Bihar';
  const postalCode = extractAddressComponent(components, ['postal_code']);

  const streetParts = [route, locality].filter(Boolean);

  return {
    formattedAddress: result.formatted_address || '',
    houseNumber: streetNumber || '',
    street: streetParts.join(', ') || locality || route || '',
    landmark: landmark || '',
    city,
    state,
    pincode: /^[1-9][0-9]{5}$/.test(postalCode) ? postalCode : '',
    coordinates:
      result.geometry?.location?.lat != null && result.geometry?.location?.lng != null
        ? {
            lat: Number(result.geometry.location.lat),
            lng: Number(result.geometry.location.lng),
          }
        : null,
  };
}

export const getMapsConfig = asyncHandler(async (_req, res) => {
  const settings = await StoreSettings.findOne({ singletonKey: 'PRIMARY_STORE' }).lean();
  const active = settings || DEFAULT_STORE_SETTINGS;

  res.status(200).json({
    success: true,
    serverMapsConfigured: Boolean(env.googleMapsServerApiKey),
    storePlaceId: active.googleMapsPlaceId || DEFAULT_STORE_SETTINGS.googleMapsPlaceId,
  });
});

export const getStorePlaceDetails = asyncHandler(async (_req, res) => {
  const settings = await StoreSettings.findOne({ singletonKey: 'PRIMARY_STORE' }).lean();
  const store = settings || DEFAULT_STORE_SETTINGS;
  const placeId = store.googleMapsPlaceId || DEFAULT_STORE_SETTINGS.googleMapsPlaceId;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${store.businessName}, ${store.address?.fullFormatted || DEFAULT_STORE_SETTINGS.address.fullFormatted}`
  )}&destination_place_id=${encodeURIComponent(placeId)}`;
  const placeSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${store.businessName}, ${store.address?.line2 || ''}, ${store.address?.city || ''}`
  )}&query_place_id=${encodeURIComponent(placeId)}`;

  if (!env.googleMapsServerApiKey) {
    return res.status(200).json({
      success: true,
      resolvedFromPlacesApi: false,
      placeId,
      store,
      coordinates: null,
      directionsUrl,
      placeSearchUrl,
    });
  }

  try {
    const endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=name,formatted_address,geometry,url,opening_hours,business_status&key=${encodeURIComponent(
      env.googleMapsServerApiKey
    )}`;
    const response = await fetch(endpoint);
    const data = await response.json();

    if (response.ok && data?.status === 'OK' && data.result) {
      return res.status(200).json({
        success: true,
        resolvedFromPlacesApi: true,
        placeId,
        store,
        placeDetails: {
          name: data.result.name || store.businessName,
          formattedAddress: data.result.formatted_address || store.address?.fullFormatted,
          businessStatus: data.result.business_status || '',
          googleMapsUrl: data.result.url || placeSearchUrl,
          weekdayText: data.result.opening_hours?.weekday_text || [],
        },
        coordinates:
          data.result.geometry?.location?.lat != null &&
          data.result.geometry?.location?.lng != null
            ? {
                lat: Number(data.result.geometry.location.lat),
                lng: Number(data.result.geometry.location.lng),
              }
            : null,
        directionsUrl,
        placeSearchUrl,
      });
    }
  } catch {
    // Cleanly degrade to official StoreSettings fallback without fabricating coordinates
  }

  return res.status(200).json({
    success: true,
    resolvedFromPlacesApi: false,
    placeId,
    store,
    coordinates: null,
    directionsUrl,
    placeSearchUrl,
  });
});

export const geocodeCustomerAddress = asyncHandler(async (req, res) => {
  const { query = '', lat = null, lng = null } = req.body;

  if (env.googleMapsServerApiKey) {
    try {
      const params = new URLSearchParams({
        key: env.googleMapsServerApiKey,
        region: 'in',
      });
      if (lat != null && lng != null) {
        params.set('latlng', `${lat},${lng}`);
      } else {
        params.set('address', query);
        params.set('components', 'country:IN');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok && data?.status === 'OK' && Array.isArray(data.results) && data.results[0]) {
        const normalized = normalizeGoogleGeocodeResult(data.results[0]);
        const deliveryZone = normalized.pincode
          ? await DeliveryZone.findOne({ pincode: normalized.pincode, isActive: true }).lean()
          : null;

        return res.status(200).json({
          success: true,
          source: 'google_maps_api',
          googleMapsConfigured: true,
          address: normalized,
          deliveryZone: deliveryZone || null,
          message: deliveryZone
            ? `Pin resolved (${normalized.pincode}) — delivery serviceable in ${deliveryZone.areaName}.`
            : normalized.pincode
            ? `Address resolved (${normalized.pincode}). Click Check Delivery to verify serviceability.`
            : 'Location pinned. Please verify your 6-digit pincode and house number.',
        });
      }
    } catch {
      // Fall back cleanly below
    }
  }

  // Honest fallback when Google Maps Geocoding API key is absent or upstream call failed
  const pinMatch = String(query).match(/\b([1-9][0-9]{5})\b/);
  const extractedPin = pinMatch ? pinMatch[1] : '';
  const deliveryZone = extractedPin
    ? await DeliveryZone.findOne({ pincode: extractedPin, isActive: true }).lean()
    : null;

  return res.status(200).json({
    success: true,
    source: 'fallback',
    googleMapsConfigured: Boolean(env.googleMapsServerApiKey),
    address: {
      formattedAddress: query || '',
      houseNumber: '',
      street: deliveryZone?.areaName || '',
      landmark: '',
      city: deliveryZone?.city || 'Patna',
      state: deliveryZone?.state || 'Bihar',
      pincode: extractedPin,
      coordinates:
        lat != null && lng != null ? { lat: Number(lat), lng: Number(lng) } : null,
    },
    deliveryZone: deliveryZone || null,
    message:
      lat != null && lng != null
        ? 'GPS coordinates captured. Google Maps server geocoding key is not configured — please fill/verify street, landmark, and 6-digit pincode.'
        : deliveryZone
        ? `Matched serviceable zone ${deliveryZone.areaName} (${deliveryZone.pincode}). Confirm house number and street below.`
        : 'Google Maps geocoding key is not configured on the server. Enter house number, street, landmark, and 6-digit pincode directly.',
  });
});
