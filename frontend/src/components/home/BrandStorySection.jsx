import { ArrowRight, MapPin } from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Container, Reveal, SectionHeading, SectionSurface } from '../ui';

export default function BrandStorySection() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  return (
    <SectionSurface tone="cream" className="relative overflow-hidden">
      {/* Subtle warm golden ambient backdrop glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(201,162,75,0.12)_0%,rgba(251,247,238,0)_70%)]"
      />

      <Container className="space-y-10 relative z-10">
        <SectionHeading
          variant="centered"
          eyebrow={language === 'en' ? 'Rooted in Danapur' : t('home.brandStory.eyebrow')}
          title={
            language === 'en'
              ? 'From Anand Bazar’s Counter to Your Family Table'
              : t('home.brandStory.title')
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <Reveal direction="left" className="lg:col-span-6">
            <div className="relative rounded-[28px] overflow-hidden border border-[#C9A24B]/40 gg-shadow-elevated bg-[#0A2B20] shadow-[0_20px_50px_rgba(0,0,0,0.16)] group">
              <img
                src="/images/story-heritage.jpg"
                alt="Traditional slow-simmered golden ghee preparation"
                loading="lazy"
                className="w-full aspect-[4/3] object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0A2B20]/90 via-[#0F3D2E]/30 to-transparent"
              />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FBF7EE]/95 backdrop-blur-md border border-[#C9A24B]/50 text-xs font-bold text-[#0F3D2E] shadow-md">
                <MapPin className="w-3.5 h-3.5 text-[#9C7725] shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {isHi ? 'आनंद बाजार, दानापुर रसोई • शुद्धता की परंपरा' : 'Anand Bazar, Danapur Kitchen • Authentic Heritage'}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.06} className="lg:col-span-6 space-y-6">
            {language === 'en' ? (
              <div className="space-y-4 gg-body text-[#5A554C]">
                <p>
                  Situated on Math Road near Hindu Society Mandir in Anand Bazar,{' '}
                  <strong className="text-[#0F3D2E] font-semibold">
                    {STORE_CONFIG.businessName}
                  </strong>{' '}
                  serves neighbors across Danapur Cantonment and Patna with honest ingredients, warm
                  counter service, and unmistakable traditional flavor.
                </p>
                <p>
                  Whether families drop in for evening samosas, festival mithai trays, or jars of
                  aromatic desi ghee for daily kitchens and rituals, every batch is crafted for
                  purity, freshness, and consistent taste.
                </p>
              </div>
            ) : (
              <p className="gg-body text-[#5A554C]">{t('home.brandStory.body')}</p>
            )}

            <div className="pt-2 flex flex-wrap gap-3.5">
              <Button
                to="/about"
                variant="forest"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4 text-[#E8D08B]" aria-hidden="true" />}
              >
                {t('home.brandStory.primaryCta')}
              </Button>
              <Button to="/contact" variant="secondary" size="md">
                {isHi
                  ? 'हमारा स्टोर देखें'
                  : language === 'hinglish'
                    ? t('home.brandStory.secondaryCta')
                    : 'Visit Our Storefront'}
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </SectionSurface>
  );
}
