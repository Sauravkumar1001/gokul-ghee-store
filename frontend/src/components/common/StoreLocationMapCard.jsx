import { useEffect, useState } from 'react';
import { Clock, ExternalLink, MapPin, Navigation, Phone, ShieldCheck } from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';
import { mapsService } from '../../services/mapsService';
import { useLanguage } from '../../context/LanguageContext';
import { Badge, Button, Card } from '../ui';
import {
  getStoreDirectionsUrl,
  getStoreMapEmbedUrl,
  getStorePlaceSearchUrl,
} from '../../utils/formatters';

export default function StoreLocationMapCard({ compact = false }) {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [livePlace, setLivePlace] = useState(null);

  useEffect(() => {
    let active = true;
    mapsService.getStorePlace().then((res) => {
      if (active && res.ok && res.data) {
        setLivePlace(res.data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const activeStore = livePlace?.store || STORE_CONFIG;
  const placeId = livePlace?.placeId || STORE_CONFIG.googleMapsPlaceId;
  const embedUrl = getStoreMapEmbedUrl(mapsApiKey);
  const directionsUrl = livePlace?.directionsUrl || getStoreDirectionsUrl();
  const placeUrl = livePlace?.placeSearchUrl || getStorePlaceSearchUrl();

  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="none"
      className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden border-[#C9A24B]/30"
    >
      <div
        className={`lg:col-span-5 flex flex-col justify-between bg-[#FFFDF8] ${
          compact ? 'p-6 sm:p-8' : 'p-7 sm:p-10'
        }`}
      >
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="gg-eyebrow text-[#9C7725]">
                {language === 'en' ? 'Official Storefront' : t('storeCard.badge')}
              </span>
              {livePlace?.resolvedFromPlacesApi && (
                <Badge
                  variant="forest"
                  size="sm"
                  icon={<ShieldCheck className="w-3 h-3" aria-hidden="true" />}
                >
                  {isHi ? 'Google Places सत्यापित' : 'Google Places Verified'}
                </Badge>
              )}
            </div>
            <h3 className="gg-h3 text-[#0F3D2E] mt-2">
              {language === 'hi' ? t('storeCard.title') : activeStore.businessName}
            </h3>
            <p className="text-xs text-[#5A554C] mt-1">{STORE_CONFIG.locationIdentity}</p>
          </div>

          <div className="space-y-4 text-sm text-[#1B1B1B]">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[#F3EAD7] border border-[#E6DEC9] flex items-center justify-center text-[#0F3D2E] shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-[#0F3D2E]">
                  {isHi ? 'दुकान का पता' : isHinglish ? 'Shop ka Pata' : 'Shop Address'}
                </p>
                <p className="text-[#5A554C] leading-relaxed mt-0.5">
                  {activeStore.address?.line1 || STORE_CONFIG.address.line1},
                  <br />
                  {activeStore.address?.line2 || STORE_CONFIG.address.line2},
                  <br />
                  {activeStore.address?.city || STORE_CONFIG.address.city},{' '}
                  {activeStore.address?.state || STORE_CONFIG.address.state},{' '}
                  {activeStore.address?.country || STORE_CONFIG.address.country} –{' '}
                  {activeStore.address?.postalCode || STORE_CONFIG.address.postalCode}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[#F3EAD7] border border-[#E6DEC9] flex items-center justify-center text-[#0F3D2E] shrink-0 mt-0.5">
                <Clock className="w-4 h-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-[#0F3D2E]">
                  {language === 'en' ? 'Store Hours' : t('storeCard.timingsLabel')}
                </p>
                <p className="text-[#5A554C] mt-0.5">
                  {language === 'en'
                    ? activeStore.hours || STORE_CONFIG.hours
                    : t('storeCard.timingsValue')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[#F3EAD7] border border-[#E6DEC9] flex items-center justify-center text-[#0F3D2E] shrink-0 mt-0.5">
                <Phone className="w-4 h-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-[#0F3D2E]">
                  {isHi ? 'स्टोर फ़ोन' : 'Store Phone'}
                </p>
                <a
                  href={
                    activeStore.phone
                      ? `tel:${activeStore.phone.replace(/\s+/g, '')}`
                      : STORE_CONFIG.phoneHref
                  }
                  className="text-[#0F3D2E] font-semibold hover:text-[#9C7725] transition-colors tabular-nums"
                >
                  {activeStore.phone || STORE_CONFIG.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E6DEC9] space-y-3.5">
          <div className="flex flex-wrap gap-3">
            <Button
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="forest"
              size="md"
              leftIcon={<Navigation className="w-4 h-4 text-[#E8D08B]" aria-hidden="true" />}
            >
              {t('storeCard.getDirections')}
            </Button>

            <Button
              href={
                activeStore.phone
                  ? `tel:${activeStore.phone.replace(/\s+/g, '')}`
                  : STORE_CONFIG.phoneHref
              }
              variant="secondary"
              size="md"
              leftIcon={<Phone className="w-4 h-4" aria-hidden="true" />}
            >
              {t('storeCard.callNow')}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5A554C]">
            <a
              href={livePlace?.placeDetails?.googleMapsUrl || placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#0F3D2E] underline underline-offset-2"
            >
              <span>
                {isHi
                  ? 'Google Maps पर देखें'
                  : isHinglish
                    ? 'Google Maps par Dekhein'
                    : 'View Place on Google Maps'}
              </span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
            <a
              href={activeStore.googleBusinessUrl || STORE_CONFIG.googleBusinessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#0F3D2E] underline underline-offset-2"
            >
              <span>{isHi ? 'Google बिज़नेस लिस्टिंग' : 'Google Business Listing'}</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 relative min-h-[320px] lg:min-h-[430px] bg-[#F3EAD7]">
        <iframe
          title="Anil Ji Ka Gokul Ghee — Anand Bazar, Danapur Location Map"
          src={embedUrl}
          className="w-full h-full min-h-[320px] lg:min-h-[430px] border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:right-auto sm:max-w-sm bg-[#FFFDF8]/95 backdrop-blur-md border border-[#C9A24B]/35 rounded-[16px] px-4 py-3 gg-shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9C7725]">
            Verified Store Place ID
          </p>
          <p className="text-xs font-semibold text-[#0F3D2E] mt-0.5">
            {activeStore.address?.landmark || STORE_CONFIG.address.landmark}
          </p>
          <p className="text-[11px] text-[#5A554C] font-mono mt-0.5 truncate">
            Place ID: {placeId}
          </p>
        </div>
      </div>
    </Card>
  );
}
