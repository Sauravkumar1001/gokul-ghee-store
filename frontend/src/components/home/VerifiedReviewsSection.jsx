import { ExternalLink, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';
import { useLanguage } from '../../context/LanguageContext';
import {
  Badge,
  Button,
  Card,
  Container,
  FadeUp,
  JaaliPattern,
  SectionHeading,
  SectionSurface,
} from '../ui';

const STARS = [0, 1, 2, 3, 4];

export default function VerifiedReviewsSection() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const { score, reviewCount } = STORE_CONFIG.googleRating;

  const reviewCountLabel = isHi
    ? `${reviewCount} Google समीक्षाएं`
    : isHinglish
      ? `${reviewCount} Google reviews`
      : `${reviewCount} Google reviews`;

  return (
    <SectionSurface tone="sand" className="border-y border-[#E6DEC9]/70 relative">
      <Container className="space-y-10 relative z-10">
        <SectionHeading
          variant="centered"
          eyebrow={language === 'en' ? 'Verified Sources Only' : t('home.verifiedReviews.eyebrow')}
          title={
            language === 'en' ? 'Customer Reviews & Store Reputation' : t('home.verifiedReviews.title')
          }
          subtitle={
            language === 'en'
              ? 'We never publish fabricated or unverified testimonials. Every customer impression reflects real visits and authentic feedback.'
              : t('home.verifiedReviews.subtitle')
          }
        />

        <FadeUp className="max-w-3xl mx-auto">
          <Card
            variant="green"
            radius="xl"
            padding="lg"
            className="group relative overflow-hidden border-[#C9A24B]/50 hover:border-[#C9A24B]/80 hover:shadow-[0_25px_60px_rgba(201,162,75,0.24)] bg-gradient-to-br from-[#0F3D2E] via-[#0C3326] to-[#082219] text-center transition-all duration-300"
          >
            {/* Ambient golden halo behind review card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(201,162,75,0.22)_0%,transparent_70%)] blur-lg"
            />

            <JaaliPattern variant="tile" opacity={0.055} />
            <JaaliPattern
              variant="mandala"
              opacity={0.075}
              className="absolute -right-20 -bottom-20 w-80 h-80"
            />
            <JaaliPattern
              variant="mandala"
              opacity={0.05}
              className="absolute -left-20 -top-20 w-64 h-64"
            />

            <div className="relative z-10 flex flex-col items-center space-y-5 py-2 sm:py-4">
              <Badge
                variant="gold-solid"
                size="md"
                icon={<ShieldCheck className="w-3.5 h-3.5 text-[#0F3D2E]" aria-hidden="true" />}
              >
                {isHi ? 'जीरो नकली समीक्षा नीति' : 'Zero Fake Reviews Policy'}
              </Badge>

              <div className="space-y-2">
                <div className="inline-flex items-baseline justify-center gap-3">
                  <span
                    className="font-serif text-6xl sm:text-7xl font-semibold tracking-tight text-[#FBF7EE] leading-none"
                    aria-label={`${score.toFixed(1)} out of 5 stars`}
                  >
                    {score.toFixed(1)}
                  </span>
                  <span className="text-4xl sm:text-5xl text-[#E8D08B] leading-none drop-shadow-[0_2px_10px_rgba(201,162,75,0.5)]" aria-hidden="true">
                    ★
                  </span>
                </div>

                <div
                  className="flex items-center justify-center gap-1.5 pt-1"
                  aria-hidden="true"
                >
                  {STARS.map((idx) => (
                    <Star
                      key={idx}
                      className="w-5 h-5 text-[#E8D08B] fill-[#E8D08B] drop-shadow-[0_1px_4px_rgba(201,162,75,0.4)]"
                    />
                  ))}
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E8D08B] pt-1">
                  {reviewCountLabel}
                </p>
              </div>

              <p className="gg-body text-[#FBF7EE]/84 max-w-xl">
                {isHi
                  ? `${STORE_CONFIG.locationIdentity} के ग्राहकों की वास्तविक रेटिंग और अनुभव सीधे हमारी आधिकारिक Google Business प्रोफ़ाइल पर पढ़ें।`
                  : isHinglish
                    ? `${STORE_CONFIG.locationIdentity} ke customers ki asli ratings aur reviews seedhe hamari official Google Business profile par dekhein.`
                    : `Read verified neighborhood ratings and candid feedback directly on the official Google profile for ${STORE_CONFIG.locationIdentity}`}
              </p>

              <div className="pt-1">
                <Button
                  href={STORE_CONFIG.googleBusinessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="lg"
                  dark
                  rightIcon={<ExternalLink className="w-4 h-4" aria-hidden="true" />}
                >
                  {isHi
                    ? 'Google समीक्षाएं देखें'
                    : isHinglish
                      ? 'Google Reviews Dekhein'
                      : 'View Google Reviews'}
                </Button>
              </div>
            </div>
          </Card>
        </FadeUp>
      </Container>
    </SectionSurface>
  );
}
