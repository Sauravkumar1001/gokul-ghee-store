import { Link } from 'react-router-dom';
import { Clock, ExternalLink, MapPin, Navigation, Phone } from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';
import { SAMPLE_CATEGORIES } from '../../data/sampleCatalog';
import { getStoreDirectionsUrl } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import Container from '../ui/Container';
import JaaliPattern from '../ui/JaaliPattern';
import Button from '../ui/Button';

export default function Footer() {
  const directionsUrl = getStoreDirectionsUrl();
  const { language, t, categoryLabel } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  const footerPurityNote = isHi
    ? 'आनंद बाजार, दानापुर कैंटोनमेंट, पटना में रोज़ाना ताज़ा तैयार।'
    : isHinglish
      ? 'Anand Bazar, Danapur Cantonment, Patna mein rozana taaza taiyaar.'
      : 'Crafted fresh daily in Anand Bazar, Danapur Cantonment, Patna.';

  return (
    <footer className="relative overflow-hidden bg-[#0F3D2E] text-[#FBF7EE] gg-paper-grain border-t border-[#C9A24B]/40">
      {/* Drifting ambient aurora glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#C9A24B]/14 blur-[90px] animate-blob-1" />
        <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-[#059669]/16 blur-[95px] animate-blob-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E8D08B]/5 blur-[120px]" />
      </div>

      <JaaliPattern variant="tile" />
      <JaaliPattern
        variant="mandala"
        opacity={0.045}
        className="hidden lg:block absolute -left-24 -bottom-24 w-80 h-80"
      />
      <div className="h-px w-full gold-hairline relative z-10" aria-hidden="true" />

      <Container className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <p className="font-editorial text-3xl sm:text-4xl font-bold tracking-[0.06em] text-[#FBF7EE]">
                {isHi ? t('common.brandShort') : STORE_CONFIG.brandDisplayName}
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-[#E8D08B] mt-1.5 font-semibold">
                {STORE_CONFIG.tagline}
              </p>
            </div>
            <p className="text-sm text-[#FBF7EE]/80 leading-[1.7] max-w-sm">
              {language === 'en' ? (
                <>
                  Official digital storefront of{' '}
                  <strong className="font-semibold text-[#FBF7EE]">
                    {STORE_CONFIG.businessName}
                  </strong>
                  . Pure Bilona Desi Ghee, handcrafted Mithai, crisp Samosas, and artisanal Namkeen
                  from Anand Bazar, Danapur Cantonment, Patna.
                </>
              ) : (
                t('footer.tagline')
              )}
            </p>
            <div className="pt-1">
              <a
                href={STORE_CONFIG.googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#C9A24B]/35 bg-[#0A2B20]/70 text-xs font-medium text-[#E8D08B] hover:border-[#C9A24B] hover:text-[#FBF7EE] transition-colors"
              >
                <span>
                  {isHi
                    ? 'सत्यापित Google बिज़नेस लिस्टिंग'
                    : 'Verified Google Business Listing'}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Categories Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D08B]">
              {t('footer.categoriesHeading')}
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FBF7EE]/80">
              {SAMPLE_CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/shop/${category.slug}`}
                    className="hover:text-[#E8D08B] transition-colors inline-block py-0.5"
                  >
                    {categoryLabel(category.slug, category.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information & Policies */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D08B]">
              {t('footer.storeCareHeading')}
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FBF7EE]/80">
              <li>
                <Link to="/about" className="hover:text-[#E8D08B] transition-colors inline-block py-0.5">
                  {language === 'en' ? 'Brand Story' : t('footer.links.ourStory')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#E8D08B] transition-colors inline-block py-0.5">
                  {language === 'en' ? 'Visit Our Shop' : t('footer.links.contact')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#E8D08B] transition-colors inline-block py-0.5">
                  {t('footer.links.faq')}
                </Link>
              </li>
              <li>
                <Link
                  to="/account/orders"
                  className="hover:text-[#E8D08B] transition-colors inline-block py-0.5"
                >
                  {isHi ? 'ऑर्डर ट्रैक करें' : isHinglish ? 'Orders Track Karein' : 'Track Orders'}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-[#E8D08B] transition-colors inline-block py-0.5"
                >
                  {t('footer.links.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#E8D08B] transition-colors inline-block py-0.5">
                  {language === 'en' ? 'Terms of Use' : t('footer.links.terms')}
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="hover:text-[#E8D08B] transition-colors inline-block py-0.5"
                >
                  {t('footer.links.refund')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Architectural Store Location Card */}
          <div className="lg:col-span-4">
            <div className="rounded-[20px] bg-[#0A2B20]/90 border border-[#C9A24B]/30 p-6 space-y-4 gg-shadow-card">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D08B]">
                  {t('footer.visitHeading')}
                </span>
                <span className="text-[11px] text-[#FBF7EE]/65">
                  {isHi ? 'दानापुर, पटना' : 'Danapur, Patna'}
                </span>
              </div>

              <p className="font-editorial text-2xl font-semibold text-[#FBF7EE]">
                {isHi ? t('common.brandFull') : STORE_CONFIG.businessName}
              </p>

              <div className="space-y-2.5 text-xs text-[#FBF7EE]/85 leading-relaxed">
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A24B] shrink-0 mt-0.5" />
                  <span>{isHi ? t('storeCard.address') : STORE_CONFIG.address.fullFormatted}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#C9A24B] shrink-0" />
                  <span>{language === 'en' ? STORE_CONFIG.hours : t('storeCard.timingsValue')}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C9A24B] shrink-0" />
                  <a
                    href={STORE_CONFIG.phoneHref}
                    className="hover:text-[#E8D08B] transition-colors tabular-nums font-medium"
                  >
                    {STORE_CONFIG.phone}
                  </a>
                </p>
              </div>

              <div className="pt-2 flex flex-col min-[380px]:flex-row flex-wrap gap-2.5">
                <Button
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="sm"
                  dark
                  className="w-full min-[380px]:w-auto min-h-[44px] justify-center"
                  leftIcon={<Navigation className="w-3.5 h-3.5" />}
                >
                  {t('storeCard.getDirections')}
                </Button>
                <Button
                  to="/contact"
                  variant="secondary"
                  size="sm"
                  dark
                  className="w-full min-[380px]:w-auto min-h-[44px] justify-center"
                >
                  {isHi ? 'स्टोर विवरण' : 'Store Details'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-7 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] sm:pb-28 lg:pb-12 border-t border-[#FBF7EE]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#FBF7EE]/70">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} {STORE_CONFIG.businessName} ({STORE_CONFIG.brandDisplayName}).{' '}
            {t('footer.copyright')}
          </p>
          <p className="leading-relaxed text-[#FBF7EE]/60">{footerPurityNote}</p>
        </div>
      </Container>
    </footer>
  );
}
