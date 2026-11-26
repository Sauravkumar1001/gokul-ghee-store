import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { STORE_CONFIG } from '../../config/storeConfig';
import { useLanguage } from '../../context/LanguageContext';
import JaaliPattern from '../ui/JaaliPattern';
import {
  Badge,
  Button,
  Container,
  FadeUp,
  Reveal,
  SectionSurface,
} from '../ui';

const SPARKLE_PARTICLES = [
  { left: 8, bottom: 18, size: 4, dur: 7.2, delay: 0 },
  { left: 22, bottom: 28, size: 5, dur: 8.5, delay: 1.2 },
  { left: 35, bottom: 12, size: 3.5, dur: 6.8, delay: 2.1 },
  { left: 52, bottom: 25, size: 4.5, dur: 9.1, delay: 0.5 },
  { left: 66, bottom: 16, size: 4, dur: 7.8, delay: 1.8 },
  { left: 78, bottom: 32, size: 5, dur: 8.2, delay: 2.8 },
  { left: 88, bottom: 14, size: 3.5, dur: 6.5, delay: 0.9 },
  { left: 94, bottom: 24, size: 4, dur: 7.5, delay: 3.1 },
];

export default function HeroSection() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const reducedMotion = useReducedMotion();

  return (
    <SectionSurface tone="green" spacing="hero" withGrain withJaali className="relative overflow-hidden">
      {/* Divine Gokul Krishna Forest Background Atmosphere */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src="/images/krishna-gokul.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_60%] scale-105 filter blur-[12px] opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#031B12]/96 via-[#092B20]/82 to-[#031B12]/94" />

        {/* Drifting Soft Gold & Emerald Atmospheric Light Orbs */}
        {!reducedMotion && (
          <>
            <div className="absolute -top-16 -left-16 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#C9A24B]/22 blur-[85px] animate-blob-1" />
            <div className="absolute -bottom-20 -right-20 w-96 sm:w-[450px] h-96 sm:h-[450px] rounded-full bg-[#059669]/26 blur-[90px] animate-blob-2" />
            <div className="absolute top-1/2 -right-12 w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-[#D97706]/18 blur-[80px] animate-blob-3" />
          </>
        )}

        {/* Slowly rotating Vedic mandala watermark */}
        <motion.div
          className="absolute -right-20 -top-20 w-[580px] h-[580px] pointer-events-none opacity-10"
          animate={reducedMotion ? {} : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 180, ease: 'linear' }}
        >
          <JaaliPattern variant="mandala" opacity={1} />
        </motion.div>

        {/* Floating Diya Sparkles */}
        {!reducedMotion && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {SPARKLE_PARTICLES.map((p, idx) => (
              <span
                key={idx}
                className="absolute rounded-full bg-gradient-to-t from-[#C9A24B] to-[#FDE68A] shadow-[0_0_8px_rgba(201,162,75,0.7)]"
                style={{
                  left: `${p.left}%`,
                  bottom: `${p.bottom}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animation: `gg-sparkle-float-up ${p.dur}s ease-in-out infinite`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
          {/* Brand Introduction & CTAs */}
          <FadeUp
            inView={false}
            distance={18}
            duration={0.55}
            className="lg:col-span-6 space-y-6 sm:space-y-7 relative z-10"
          >
            {/* Live Kitchen Freshness Beacon & Landmark Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#155742]/90 border border-[#E8D08B]/45 text-[11px] font-semibold text-[#FDE68A] shadow-[0_4px_16px_rgba(201,162,75,0.2)]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8D08B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8D08B]" />
                </span>
                <span>{isHi ? 'ताज़ा बिलोना घानी चालू' : 'Live Kitchen Batch Active'}</span>
              </motion.div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A2B20]/85 border border-[#C9A24B]/45 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#E8D08B] shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-[#C9A24B] shrink-0" aria-hidden="true" />
                <span>
                  {isHi
                    ? 'आनंद बाजार, दानापुर कैंट • पटना'
                    : 'Anand Bazar, Danapur Cantt • Patna'}
                </span>
              </div>
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

          {/* Cinematic Hero Photography with Floating Badges */}
          <Reveal direction="right" delay={0.08} className="lg:col-span-6 relative">
            <motion.div
              animate={reducedMotion ? {} : { y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Floating Badge Top-Left: Bilona Churn */}
              <motion.div
                animate={reducedMotion ? {} : { y: [4, -4, 4] }}
                transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
                className="absolute -top-3.5 -left-2 sm:-left-3.5 z-20 px-3.5 py-1.5 rounded-full bg-[#031911]/90 backdrop-blur-md border border-[#E8D08B]/60 shadow-[0_8px_20px_rgba(201,162,75,0.3)] flex items-center gap-1.5 text-[11px] font-bold text-[#FDE68A]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E8D08B] animate-pulse" />
                <span>{isHi ? '१००% शुद्ध बिलोना मथाई' : '100% Traditional Bilona'}</span>
              </motion.div>

              {/* Floating Badge Top-Right: Google 4.9 Rating */}
              <motion.div
                animate={reducedMotion ? {} : { y: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -top-3.5 -right-2 sm:-right-3.5 z-20 px-3.5 py-1.5 rounded-full bg-[#031911]/90 backdrop-blur-md border border-[#E8D08B]/60 shadow-[0_8px_20px_rgba(201,162,75,0.3)] flex items-center gap-1.5 text-[11px] font-bold text-[#FDE68A]"
              >
                <span className="text-[#F59E0B]">★</span>
                <span>4.9 • 169+ {isHi ? 'समीक्षाएं' : 'Google Reviews'}</span>
              </motion.div>

              <div className="relative rounded-[28px] overflow-hidden border border-[#C9A24B]/50 gg-shadow-elevated bg-[#0A2B20] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(201,162,75,0.2)]">
                <img
                  src="/images/hero-ghee.jpg"
                  alt="Golden granular Desi Ghee in glass jar with brass spoon — Gokul Ghee"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full aspect-[4/3] lg:aspect-[16/11] object-cover scale-100 hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2B20]/92 via-[#0F3D2E]/25 to-transparent"
                />

                {/* Bottom Caption Card */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-5 sm:left-5 sm:right-5 rounded-[20px] bg-[#031911]/85 backdrop-blur-md border border-[#C9A24B]/40 px-4 py-3 sm:px-5 sm:py-4 flex items-end justify-between gap-4 shadow-lg">
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
                    className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#C9A24B] to-[#E8D08B] text-[#0F3D2E] text-xs font-bold hover:shadow-md transition-all whitespace-nowrap cursor-pointer"
                  >
                    <span>
                      {isHi ? 'स्टोर पधारें' : isHinglish ? 'Danapur Shop' : 'Visit Store'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </Container>
    </SectionSurface>
  );
}
