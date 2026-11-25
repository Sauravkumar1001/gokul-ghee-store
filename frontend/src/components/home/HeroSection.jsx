import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';
import { useLanguage } from '../../context/LanguageContext';
import {
  Badge,
  Button,
  Container,
  FadeUp,
  Reveal,
  SectionSurface,
} from '../ui';

export default function HeroSection() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  return (
    <SectionSurface tone="green" spacing="hero" withGrain withJaali>
      {/* Subtle warm radial glow behind hero visual */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-10%] w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(201,162,75,0.16)_0%,rgba(15,61,46,0)_70%)]"
      />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Brand Introduction & CTAs */}
          <FadeUp
            inView={false}
            distance={18}
            duration={0.55}
            className="lg:col-span-6 space-y-6 sm:space-y-7 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A2B20]/85 border border-[#C9A24B]/45 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#E8D08B] shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#C9A24B] shrink-0" aria-hidden="true" />
              <span>
                {isHi
                  ? 'आनंद बाजार, दानापुर कैंटोनमेंट • पटना'
                  : 'Anand Bazar, Danapur Cantonment • Patna'}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="gg-h1 text-[#FBF7EE]">
                {language === 'en' ? 'Tradition in Every Taste.' : t('hero.title')}
              </h1>
              <p className="gg-body-lg text-[#FBF7EE]/85 max-w-xl">
                {language === 'en' ? (
                  <>
                    Welcome to{' '}
                    <strong className="font-semibold text-[#E8D08B]">
                      {STORE_CONFIG.businessName}
                    </strong>{' '}
                    — Danapur&apos;s trusted kitchen for granular Bilona Desi Ghee, heritage
                    Mithai, crisp Anand Bazar Samosas, and artisanal Namkeen.
                  </>
                ) : (
                  t('hero.subtitle')
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1">
              <Button
                to="/shop"
                variant="primary"
                size="lg"
                dark
                rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
              >
                {t('hero.primaryCta')}
              </Button>

              <Button
                href="#featured-categories"
                variant="secondary"
                size="lg"
                dark
              >
                {t('hero.secondaryCta')}
              </Button>
            </div>

            <div className="pt-5 border-t border-[#FBF7EE]/15 grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 text-xs">
              <div>
                <p className="text-[#E8D08B] font-semibold uppercase tracking-[0.14em] text-[10px]">
                  {language === 'en' ? 'Store Hours' : t('storeCard.timingsLabel')}
                </p>
                <p className="text-[#FBF7EE]/90 mt-1 font-medium">
                  {language === 'en' ? STORE_CONFIG.hours : t('storeCard.timingsValue')}
                </p>
              </div>

              <div>
                <p className="text-[#E8D08B] font-semibold uppercase tracking-[0.14em] text-[10px]">
                  {isHi ? 'प्रमुख पहचान' : 'Landmark'}
                </p>
                <p className="text-[#FBF7EE]/90 mt-1 font-medium">
                  {isHi ? 'हिंदू सोसाइटी मंदिर के पास' : 'Near Hindu Society Mandir'}
                </p>
              </div>

              <div className="min-[420px]:col-span-2 sm:col-span-1">
                <p className="text-[#E8D08B] font-semibold uppercase tracking-[0.14em] text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B]" aria-hidden="true" />
                  <span>{isHi ? 'शुद्धता का वादा' : isHinglish ? 'Shuddhata Promise' : 'Kitchen Promise'}</span>
                </p>
                <p className="text-[#FBF7EE]/90 mt-1 font-medium">
                  {isHi
                    ? 'ताज़ा बिलोना घी व शुद्ध मिठाई'
                    : isHinglish
                      ? 'Taaza Bilona Ghee & Shuddh Mithai'
                      : 'Small-Batch Bilona Purity'}
                </p>
              </div>
            </div>
          </FadeUp>

          {/* Cinematic Hero Photography */}
          <Reveal direction="right" delay={0.08} className="lg:col-span-6 relative">
            <div className="relative rounded-[24px] overflow-hidden border border-[#C9A24B]/40 gg-shadow-elevated bg-[#0A2B20]">
              <img
                src="/images/hero-ghee.jpg"
                alt="Golden granular Desi Ghee in glass jar with brass spoon — Gokul Ghee"
                fetchPriority="high"
                decoding="async"
                className="w-full aspect-[4/3] lg:aspect-[16/11] object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0A2B20]/90 via-[#0F3D2E]/20 to-transparent"
              />

              {/* Subtle Top-Right Medallion on Tablet/Desktop */}
              <div className="hidden md:flex absolute top-4 right-4 items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A2B20]/85 backdrop-blur-md border border-[#C9A24B]/45 text-[11px] font-semibold text-[#E8D08B]">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" aria-hidden="true" />
                <span>{isHi ? '100% शुद्ध बिलोना घी' : '100% Pure Cow & Bilona'}</span>
              </div>

              {/* Bottom Caption Card */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-5 sm:left-5 sm:right-5 rounded-[16px] bg-[#0A2B20]/78 backdrop-blur-md border border-[#C9A24B]/30 px-4 py-3 sm:px-5 sm:py-4 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <Badge variant="gold-solid" size="sm" className="mb-1.5">
                    {isHi ? 'विरासत रसोई की पहचान' : isHinglish ? 'Signature Parampara' : 'Heritage Craft'}
                  </Badge>
                  <p className="font-editorial text-lg sm:text-2xl text-[#FBF7EE] leading-snug">
                    {isHi
                      ? 'शुद्ध खुशबू, दानेदार स्वाद और पारंपरिक मिठास'
                      : isHinglish
                        ? 'Shuddh Khushboo, Danedar Swaad & Mithas'
                        : 'Pure Aroma, Granular Warmth & Sweets'}
                  </p>
                </div>

                <Link
                  to="/contact"
                  className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-full bg-[#FBF7EE] text-[#0F3D2E] text-xs font-semibold hover:bg-[#E8D08B] transition-colors whitespace-nowrap"
                >
                  <span>
                    {isHi ? 'स्टोर पधारें' : isHinglish ? 'Danapur Shop' : 'Visit Store'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </SectionSurface>
  );
}
