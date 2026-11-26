import { ExternalLink } from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';
import { useLanguage } from '../../context/LanguageContext';
import { Container, SectionHeading, SectionSurface, StaggerGroup, StaggerItem } from '../ui';

const GALLERY_TILES = [
  { src: '/images/hero-ghee.jpg', caption: 'Morning light & golden granular ghee' },
  { src: '/images/cat-mithai.jpg', caption: 'Hand-arranged celebration mithai thali' },
  { src: '/images/cat-samosa.jpg', caption: 'Fresh Anand Bazar counter samosas' },
  { src: '/images/cat-namkeen.jpg', caption: 'Small-batch spiced dry-fruit namkeen' },
  { src: '/images/festival-specials.jpg', caption: 'Festive Kesar Pista Gujiya craft' },
  { src: '/images/cat-combos.jpg', caption: 'Heritage green & gold gift hamper' },
];

export default function InstagramSection() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  return (
    <SectionSurface tone="white" className="border-t border-[#E6DEC9]">
      <Container className="space-y-6 sm:space-y-8">
        <SectionHeading
          variant="centered"
          eyebrow={language === 'en' ? 'Visual Journal' : t('home.instagram.eyebrow')}
          title={language === 'en' ? 'From Our Kitchen & Counter' : t('home.instagram.title')}
          subtitle={
            language === 'en'
              ? 'A glimpse of fresh morning batches, festive gift boxes, and daily counter classics from our Anand Bazar storefront.'
              : t('home.instagram.subtitle')
          }
          actionLabel={
            isHi
              ? 'स्टोर प्रोफ़ाइल देखें'
              : isHinglish
                ? 'Store Profile Dekhein'
                : 'View Store Profile'
          }
          actionHref={STORE_CONFIG.googleBusinessUrl}
          actionRightIcon={<ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />}
        />

        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {GALLERY_TILES.map((tile) => (
            <StaggerItem key={tile.src}>
              <div className="group relative aspect-square rounded-[18px] overflow-hidden border border-[#E6DEC9] hover:border-[#C9A24B] bg-[#F3EAD7] gg-shadow-sm hover:shadow-[0_12px_30px_rgba(201,162,75,0.28)] hover:-translate-y-1 transition-all duration-300">
                <img
                  src={tile.src}
                  alt={tile.caption}
                  loading="lazy"
                  className="w-full h-full object-cover scale-100 group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2B20]/92 via-[#0F3D2E]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex items-end">
                  <p className="text-[11px] font-semibold text-[#FBF7EE] leading-snug">
                    {tile.caption}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </SectionSurface>
  );
}
