import { ArrowRight, Clock, Tag } from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';
import { SPECIAL_OFFER_BANNERS } from '../../data/sampleCatalog';
import { useLanguage } from '../../context/LanguageContext';
import {
  Badge,
  Button,
  Card,
  Container,
  JaaliPattern,
  SectionHeading,
  SectionSurface,
  StaggerGroup,
  StaggerItem,
} from '../ui';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getFestiveDaysRemaining(closeDateIso) {
  const targetMs = new Date(closeDateIso).getTime();
  if (!Number.isFinite(targetMs)) return 0;
  const diff = Math.ceil((targetMs - Date.now()) / MS_PER_DAY);
  return Math.max(0, diff);
}

const OFFER_IMAGES = {
  'offer-ghee-combo': {
    src: '/images/cat-combos.jpg',
    alt: 'Heritage Kitchen Pairing festive desi ghee and mithai gift hamper',
  },
  'offer-festive': {
    src: '/images/festival-specials.jpg',
    alt: 'Diwali and Chhath handcrafted Kesar Pista Gujiya and festive offerings',
  },
};

export default function SpecialOffersSection() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const daysLeft = getFestiveDaysRemaining(STORE_CONFIG.festivePreOrder.closeDateIso);

  const countdownLabel =
    daysLeft > 0
      ? isHi
        ? `दिवाली / छठ प्री-ऑर्डर ${daysLeft} दिनों में बंद होंगे`
        : isHinglish
          ? `Diwali/Chhath pre-orders ${daysLeft} dino mein close honge`
          : `Diwali/Chhath pre-orders close in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`
      : isHi
        ? 'ताज़ा त्योहार बैच प्री-ऑर्डर खुले हैं'
        : isHinglish
          ? 'Fresh festival batch pre-orders abhi open hain'
          : 'Fresh festival batch pre-orders open now';

  const localizedOffers = SPECIAL_OFFER_BANNERS.map((offer, idx) => {
    if (language === 'en') return offer;
    if (idx === 0) {
      return {
        ...offer,
        eyebrow: isHi ? 'पर्व उपहार संग्रह' : 'Festive Gift Boxes',
        badge: isHi ? 'पर्व कॉम्बो' : 'Combo Savings',
        title: isHi ? 'परिवार व त्योहार गिफ्ट हैम्पर्स' : 'Family & Festive Gift Hampers',
        subtitle: isHi
          ? 'शुद्ध देसी घी जार और चुनिंदा मिठाई से सजे उपहार बॉक्स।'
          : 'Shuddh Desi Ghee jars aur handpicked Mithai se saje gift hampers.',
        ctaLabel: t('home.specialOffers.cta'),
      };
    }
    return {
      ...offer,
      eyebrow: isHi ? 'मौसमी विशेष' : 'Seasonal Specials',
      badge: isHi ? 'ताज़ा बैच' : 'Fresh Batch',
      title: isHi ? 'छठ, होली और दिवाली विशेष' : 'Chhath, Holi & Diwali Specials',
      subtitle: isHi
        ? 'परंपरागत केसर गुजिया, ठेकुआ और त्योहार के नमकीन पैक।'
        : 'Paramparik Kesar Gujiya, Thekua aur festive namkeen assortments.',
      ctaLabel: isHi ? 'पर्व संग्रह देखें' : 'Festival Collection Dekhein',
    };
  });

  return (
    <SectionSurface tone="white">
      <Container className="space-y-10">
        <SectionHeading
          variant="centered"
          eyebrow={language === 'en' ? 'Seasonal & Gifting' : t('home.specialOffers.eyebrow')}
          title={
            language === 'en' ? 'Special Offers & Curated Hampers' : t('home.specialOffers.title')
          }
          subtitle={
            language === 'en'
              ? 'Curated kitchen pairings, festival hampers, and seasonal savings crafted for family celebrations across Danapur & Patna.'
              : t('home.specialOffers.subtitle')
          }
        />

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {localizedOffers.map((offer, idx) => {
            const isPrimary = idx === 0;
            const visual = OFFER_IMAGES[offer.id] || OFFER_IMAGES['offer-ghee-combo'];
            return (
              <StaggerItem key={offer.id} className="h-full">
                <Card
                  variant={isPrimary ? 'green' : 'sand'}
                  radius="xl"
                  padding="lg"
                  className={`relative h-full overflow-hidden flex flex-col justify-between gap-6 ${
                    isPrimary
                      ? 'border-[#C9A24B]/40 bg-gradient-to-br from-[#0F3D2E] via-[#0C3527] to-[#072017]'
                      : 'border-[#C9A24B]/40 bg-gradient-to-br from-[#FFFDF7] via-[#F7EDD4] to-[#EED9A9]'
                  }`}
                >
                  <JaaliPattern variant="tile" opacity={isPrimary ? 0.055 : 0.04} />
                  <JaaliPattern
                    variant="mandala"
                    opacity={isPrimary ? 0.08 : 0.06}
                    className="absolute -right-14 -bottom-14 w-64 h-64"
                  />

                  <div className="relative z-10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`gg-eyebrow ${isPrimary ? 'text-[#E8D08B]' : 'text-[#9C7725]'}`}
                      >
                        {offer.eyebrow}
                      </span>
                      <Badge
                        variant={isPrimary ? 'gold-solid' : 'saffron'}
                        size="sm"
                        icon={<Tag className="w-3 h-3" aria-hidden="true" />}
                      >
                        {offer.badge}
                      </Badge>
                    </div>

                    <div
                      className={`relative rounded-[16px] overflow-hidden border aspect-[16/9] ${
                        isPrimary
                          ? 'border-[#C9A24B]/35 bg-[#08241B]'
                          : 'border-[#C9A24B]/35 bg-[#EFE4CC]'
                      }`}
                    >
                      <img
                        src={visual.src}
                        alt={visual.alt}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0A2B20]/65 to-transparent"
                      />
                    </div>

                    {!isPrimary && (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F3D2E] text-[#FBF7EE] border border-[#C9A24B]/45 text-xs font-semibold gg-shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-[#E8D08B] shrink-0" aria-hidden="true" />
                        <span>{countdownLabel}</span>
                      </div>
                    )}

                    <h3 className={`gg-h3 ${isPrimary ? 'text-[#FBF7EE]' : 'text-[#0F3D2E]'}`}>
                      {offer.title}
                    </h3>

                    <p
                      className={`text-sm leading-[1.7] ${
                        isPrimary ? 'text-[#FBF7EE]/82' : 'text-[#4B4438]'
                      }`}
                    >
                      {offer.subtitle}
                    </p>
                  </div>

                  <div className="relative z-10 pt-1">
                    <Button
                      to={offer.ctaLink}
                      variant={isPrimary ? 'primary' : 'forest'}
                      size="md"
                      dark={isPrimary}
                      rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
                    >
                      {offer.ctaLabel}
                    </Button>
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </Container>
    </SectionSurface>
  );
}
