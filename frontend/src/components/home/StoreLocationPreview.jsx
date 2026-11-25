import StoreLocationMapCard from '../common/StoreLocationMapCard';
import { Container, SectionHeading, SectionSurface } from '../ui';
import { useLanguage } from '../../context/LanguageContext';

export default function StoreLocationPreview() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  return (
    <SectionSurface tone="cream" withGrain className="border-t border-[#E6DEC9]">
      <Container className="space-y-10">
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

        <StoreLocationMapCard compact />
      </Container>
    </SectionSurface>
  );
}
