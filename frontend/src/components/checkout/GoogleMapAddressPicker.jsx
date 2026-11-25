import { useCallback, useEffect, useRef, useState } from 'react';
import { Compass, LocateFixed, MapPin, Search } from 'lucide-react';
import { mapsService } from '../../services/mapsService';
import { loadGoogleMapsScript } from '../../utils/googleMapsLoader';
import { useLanguage } from '../../context/LanguageContext';

// Default camera viewport centered over Danapur/Patna purely for Google Map rendering when no pin is picked yet
const PATNA_DANAPUR_VIEWPORT = { lat: 25.635, lng: 85.041 };

function parseJsGeocoderResult(result) {
  const components = result.address_components || [];
  const pick = (types) => {
    for (const t of types) {
      const m = components.find((c) => Array.isArray(c.types) && c.types.includes(t));
      if (m) return m.long_name || '';
    }
    return '';
  };

  const streetNumber = pick(['street_number', 'premise']);
  const route = pick(['route', 'sublocality_level_2']);
  const locality = pick(['sublocality_level_1', 'sublocality', 'neighborhood']);
  const landmark = pick(['point_of_interest', 'establishment', 'landmark']);
  const city = pick(['locality', 'administrative_area_level_2']) || 'Patna';
  const state = pick(['administrative_area_level_1']) || 'Bihar';
  const pincode = pick(['postal_code']);

  return {
    formattedAddress: result.formatted_address || '',
    houseNumber: streetNumber || '',
    street: [route, locality].filter(Boolean).join(', ') || locality || route || '',
    landmark: landmark || '',
    city,
    state,
    pincode: /^[1-9][0-9]{5}$/.test(pincode) ? pincode : '',
    coordinates:
      result.geometry?.location
        ? {
            lat: Number(result.geometry.location.lat()),
            lng: Number(result.geometry.location.lng()),
          }
        : null,
  };
}

export default function GoogleMapAddressPicker({ value, onChange, onPincodeDetected }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [searchText, setSearchText] = useState('');
  const [mapsReady, setMapsReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const applyResolvedAddress = useCallback(
    (resolved, extraNote = '') => {
      onChange((prev) => ({
        ...prev,
        houseNumber: resolved.houseNumber || prev.houseNumber,
        street: resolved.street || prev.street,
        landmark: resolved.landmark || prev.landmark,
        city: resolved.city || prev.city || 'Patna',
        state: resolved.state || prev.state || 'Bihar',
        pincode: resolved.pincode || prev.pincode,
        formattedAddress: resolved.formattedAddress || prev.formattedAddress || '',
        coordinates: resolved.coordinates || prev.coordinates || null,
      }));

      if (resolved.pincode && /^[1-9][0-9]{5}$/.test(resolved.pincode) && onPincodeDetected) {
        onPincodeDetected(resolved.pincode);
      }

      if (resolved.coordinates && mapRef.current && markerRef.current) {
        markerRef.current.setPosition(resolved.coordinates);
        mapRef.current.panTo(resolved.coordinates);
      }

      if (extraNote) {
        setStatusMessage(extraNote);
      }
    },
    [onChange, onPincodeDetected]
  );

  const reverseGeocodeCoords = useCallback(
    async (lat, lng, originLabel = 'Pin moved') => {
      setErrorMessage('');

      // 1. Try browser Google Maps JS Geocoder first if loaded
      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        try {
          const response = await geocoder.geocode({ location: { lat, lng } });
          const first = response?.results?.[0];
          if (first) {
            const parsed = parseJsGeocoderResult(first);
            parsed.coordinates = { lat, lng };
            applyResolvedAddress(
              parsed,
              `${originLabel}: address fields updated (${parsed.pincode || 'verify pincode'}).`
            );
            return;
          }
        } catch {
          // Fall through cleanly to backend /maps/geocode
        }
      }

      // 2. Fall back cleanly to backend Google Geocoding / Pincode resolver
      const res = await mapsService.geocodeAddress({ lat, lng });
      if (res.ok && res.data?.address) {
        applyResolvedAddress(res.data.address, res.data.message);
      } else {
        onChange((prev) => ({
          ...prev,
          coordinates: { lat, lng },
        }));
        setStatusMessage(
          `${originLabel} at ${lat.toFixed(5)}, ${lng.toFixed(
            5
          )}. Confirm street, landmark, and 6-digit pincode below.`
        );
      }
    },
    [applyResolvedAddress, onChange]
  );

  useEffect(() => {
    let active = true;
    if (!mapsApiKey || !mapContainerRef.current) return undefined;

    loadGoogleMapsScript(mapsApiKey).then((loaded) => {
      if (!active || !loaded || !mapContainerRef.current || !window.google?.maps?.Map) return;

      const initialCenter = value?.coordinates?.lat != null ? value.coordinates : PATNA_DANAPUR_VIEWPORT;
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
      });

      const marker = new window.google.maps.Marker({
        position: initialCenter,
        map,
        draggable: true,
        title: 'Drag to adjust delivery pin',
      });

      marker.addListener('dragend', (event) => {
        const lat = event?.latLng?.lat?.();
        const lng = event?.latLng?.lng?.();
        if (lat != null && lng != null) {
          reverseGeocodeCoords(Number(lat), Number(lng), 'Dragged pin updated');
        }
      });

      map.addListener('click', (event) => {
        const lat = event?.latLng?.lat?.();
        const lng = event?.latLng?.lng?.();
        if (lat != null && lng != null) {
          marker.setPosition({ lat, lng });
          reverseGeocodeCoords(Number(lat), Number(lng), 'Selected map point');
        }
      });

      mapRef.current = map;
      markerRef.current = marker;
      setMapsReady(true);
    });

    return () => {
      active = false;
    };
  }, [mapsApiKey, reverseGeocodeCoords, value?.coordinates?.lat]);

  const handleUseCurrentLocation = () => {
    setErrorMessage('');
    setStatusMessage('');

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setErrorMessage('Browser geolocation is unavailable on this device.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        const lat = Number(pos.coords.latitude);
        const lng = Number(pos.coords.longitude);
        await reverseGeocodeCoords(lat, lng, 'GPS location captured');
      },
      (geoErr) => {
        setLocating(false);
        if (geoErr?.code === 1) {
          setErrorMessage(
            'Location permission denied. Enable browser location access or search/enter your address manually.'
          );
        } else {
          setErrorMessage(
            'Unable to fetch current GPS position. Search your locality or enter your pincode directly.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchAddress = async (e) => {
    if (e) e.preventDefault();
    const query = searchText.trim();
    if (!query) {
      setErrorMessage('Enter a locality, landmark, road, or 6-digit pincode to search.');
      return;
    }

    setErrorMessage('');
    setStatusMessage('');
    setSearching(true);

    if (window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const result = await geocoder.geocode({
          address: query,
          componentRestrictions: { country: 'IN' },
        });
        const first = result?.results?.[0];
        if (first) {
          setSearching(false);
          const parsed = parseJsGeocoderResult(first);
          applyResolvedAddress(
            parsed,
            `Located "${parsed.formattedAddress || query}". Verify your house number below.`
          );
          return;
        }
      } catch {
        // Fall through cleanly to backend resolver
      }
    }

    const res = await mapsService.geocodeAddress({ query });
    setSearching(false);
    if (res.ok && res.data?.address) {
      applyResolvedAddress(res.data.address, res.data.message);
    } else {
      setErrorMessage(
        res.error?.message || 'Unable to search address right now. Enter street and pincode manually.'
      );
    }
  };

  const pinnedCoords = value?.coordinates;
  const hasPinnedCoords =
    pinnedCoords && pinnedCoords.lat != null && pinnedCoords.lng != null;

  return (
    <div className="rounded-[18px] border border-[#C9A24B]/35 bg-[#FBF7EE] p-4 sm:p-5 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-[#0F3D2E]">
          <Compass className="w-4 h-4 text-[#9A7624]" />
          <span>
            {isHi
              ? 'ग्राहक डिलीवरी पिन व पता खोजक'
              : language === 'hinglish'
                ? 'Delivery Pin & Address Finder'
                : 'Delivery Pin & Address Finder'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0F3D2E] text-[#0F3D2E] font-semibold hover:bg-[#0F3D2E] hover:text-[#FBF7EE] disabled:opacity-60 transition-colors"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          <span>
            {locating
              ? isHi
                ? 'लोकेशन खोज रहा है...'
                : 'Locating...'
              : isHi
                ? 'मेरी वर्तमान लोकेशन उपयोग करें'
                : language === 'hinglish'
                  ? 'Current Location Use Karein'
                  : 'Use Current Location'}
          </span>
        </button>
      </div>

      {/* Address / Landmark / Pincode Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#5A554C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchAddress();
              }
            }}
            placeholder={
              isHi
                ? 'मोहल्ला, लैंडमार्क या पिनकोड खोजें (उदा. आनंद बाजार 801503)'
                : language === 'hinglish'
                  ? 'Locality, landmark ya pincode search karein (jaise 801503)'
                  : 'Search locality, landmark, or pincode (e.g. Anand Bazar 801503)'
            }
            aria-label="Search delivery address"
            className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#FFFDF8] border border-[#E6DEC9] text-xs text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
          />
        </div>
        <button
          type="button"
          onClick={handleSearchAddress}
          disabled={searching}
          className="px-4 py-2 rounded-full bg-[#0F3D2E] text-[#FBF7EE] font-semibold hover:bg-[#155742] disabled:opacity-60 transition-colors"
        >
          {searching ? (isHi ? 'खोज रहा है...' : 'Finding...') : isHi ? 'खोजें' : 'Find'}
        </button>
      </div>

      {/* Interactive Google Map Canvas when key exists; silently omit when not configured */}
      {mapsApiKey ? (
        <div className="space-y-1.5">
          <div
            ref={mapContainerRef}
            aria-label="Interactive Delivery Map"
            className="w-full h-52 rounded-[14px] border border-[#E6DEC9] bg-[#F3EAD7]"
          />
          <p className="text-[11px] text-[#5A554C]">
            {mapsReady
              ? 'Drag the pin or click anywhere on the map to adjust your exact delivery spot.'
              : 'Loading interactive map...'}
          </p>
        </div>
      ) : null}

      {hasPinnedCoords && (
        <p className="text-[11px] text-[#0F3D2E] font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#9A7624] shrink-0" />
          <span>
            Customer delivery pin set: {Number(pinnedCoords.lat).toFixed(5)},{' '}
            {Number(pinnedCoords.lng).toFixed(5)} (separate from Anand Bazar store counter).
          </span>
        </p>
      )}

      {statusMessage && (
        <p role="status" className="rounded-[12px] bg-[#E8F1EC] text-[#0F3D2E] px-3 py-2 text-[11px]">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="rounded-[12px] bg-[#FDF1EE] text-[#8C2D19] px-3 py-2 text-[11px]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
