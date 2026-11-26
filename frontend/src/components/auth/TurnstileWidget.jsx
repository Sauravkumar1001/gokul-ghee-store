import { useEffect, useRef, useState } from 'react';
import CaptchaWidget from './CaptchaWidget';

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export default function TurnstileWidget({
  onChange,
  resetTrigger = 0,
  error = '',
}) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(Boolean(window.turnstile));
  const [loadFailed, setLoadFailed] = useState(false);

  // If site key is missing or Turnstile script failed to load, fall back to text captcha
  if (!siteKey || loadFailed) {
    return (
      <CaptchaWidget
        onChange={onChange}
        resetTrigger={resetTrigger}
        error={error}
      />
    );
  }

  // Load Cloudflare Turnstile script dynamically if not already present
  useEffect(() => {
    if (window.turnstile) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    if (existingScript) {
      const handleLoad = () => setScriptLoaded(true);
      const handleError = () => setLoadFailed(true);
      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);
      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setLoadFailed(true);
    document.head.appendChild(script);
  }, []);

  // Render Turnstile widget once script and container are ready
  useEffect(() => {
    if (!scriptLoaded || !window.turnstile || !containerRef.current) return;

    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // ignore
      }
      widgetIdRef.current = null;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: (token) => {
          if (onChange) {
            onChange({
              captchaToken: token,
              turnstileToken: token,
              captchaAnswer: 'TURNSTILE',
            });
          }
        },
        'expired-callback': () => {
          if (onChange) {
            onChange({
              captchaToken: '',
              turnstileToken: '',
              captchaAnswer: '',
            });
          }
        },
        'error-callback': () => {
          setLoadFailed(true);
        },
      });
    } catch {
      setLoadFailed(true);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [scriptLoaded, siteKey, onChange]);

  // Reset Turnstile widget on failed submission
  useEffect(() => {
    if (resetTrigger > 0 && widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // ignore
      }
    }
  }, [resetTrigger]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-2 min-h-[66px]">
      <div ref={containerRef} className="w-full flex justify-center" />
      {error && (
        <p className="text-xs text-[#B91C1C] font-medium mt-1 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
