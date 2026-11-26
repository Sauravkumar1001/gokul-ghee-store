import { MapPin } from 'lucide-react';
import StoreLocationMapCard from '../common/StoreLocationMapCard';
import { Container, SectionHeading, SectionSurface } from '../ui';
import { useLanguage } from '../../context/LanguageContext';

export default function StoreLocationPreview() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  return (
    <SectionSurface tone="cream" withGrain className="border-t border-[#E6DEC9]/70 relative">
      <Container className="space-y-6 sm:space-y-8 relative z-10">
        <SectionHeading
          variant="centered"
          eyebrow={language === 'en' ? 'Visit Us in Person' : t('home.storePreview.eyebrow')}
          title={
            language === 'en'
              ? 'Anil Ji Ka Gokul Ghee — Anand Bazar, Danapur'
              : t('home.storePreview.title')
          }
          subtitle={
            language === 'en'
              ? 'Experience our ghee, freshly prepared mithai, and hot snacks at our Math Road storefront near Hindu Society Mandir.'
              : t('home.storePreview.subtitle')
          }
          actionLabel={
            isHi
              ? 'पूरा पता और संपर्क पेज'
              : isHinglish
                ? 'Store & Contact Page Dekhein'
                : 'Full Store & Contact Page'
          }
          actionTo="/contact"
        />

        {/* Ambient halo behind map card */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.1)_0%,transparent_72%)]"
          />
          <StoreLocationMapCard compact />
        </div>
      </Container>
    </SectionSurface>
  );
}
