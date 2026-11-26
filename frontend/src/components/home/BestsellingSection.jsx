import { Sparkles } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../data/sampleCatalog';
import SampleNoticeBanner from '../common/SampleNoticeBanner';
import ProductGrid from '../product/ProductGrid';
import { Container, SectionHeading, SectionSurface } from '../ui';
import { useLanguage } from '../../context/LanguageContext';

export default function BestsellingSection() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const bestsellers = SAMPLE_PRODUCTS.filter((item) => item.isBestseller).slice(0, 6);

  return (
    <SectionSurface tone="sand" className="border-y border-[#E6DEC9]/70 relative">
      <Container className="space-y-6 sm:space-y-8 relative z-10">
        <SectionHeading
          variant="centered"
          eyebrow={language === 'en' ? 'Neighborhood Favorites' : t('home.bestselling.eyebrow')}
          title={language === 'en' ? 'Bestselling Products' : t('home.bestselling.title')}
          subtitle={
            language === 'en'
              ? 'Highlighted counter favorites spanning our signature Desi Ghee jars, celebration Mithai, and fresh Samosas.'
              : t('home.bestselling.subtitle')
          }
          actionLabel={language === 'en' ? 'Shop All Bestsellers' : t('home.bestselling.viewAll')}
          actionTo="/shop"
        />

        <SampleNoticeBanner compact />

        {/* Ambient golden halo behind products grid */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.11)_0%,transparent_72%)]"
          />
          <ProductGrid products={bestsellers} />
        </div>
      </Container>
    </SectionSurface>
  );
}
