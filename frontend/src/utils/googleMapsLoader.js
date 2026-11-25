let loaderPromise = null;

/**
 * Dynamically load Google Maps JavaScript SDK with the Places library once.
 * Returns false cleanly if VITE_GOOGLE_MAPS_API_KEY is not configured or in non-browser/test envs.
 */
export function loadGoogleMapsScript(apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
  if (typeof window === 'undefined' || import.meta.env.MODE === 'test') {
    return Promise.resolve(false);
  }
  if (!apiKey) {
    return Promise.resolve(false);
  }
  if (window.google?.maps?.Map) {
    return Promise.resolve(true);
  }
  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-gokul-google-maps="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.google?.maps?.Map)));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.gokulGoogleMaps = '1';
    script.onload = () => resolve(Boolean(window.google?.maps?.Map));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return loaderPromise;
}
