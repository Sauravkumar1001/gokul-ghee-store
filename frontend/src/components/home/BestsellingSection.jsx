import { SAMPLE_PRODUCTS } from '../../data/sampleCatalog';
import SampleNoticeBanner from '../common/SampleNoticeBanner';
import ProductGrid from '../product/ProductGrid';
import { Container, SectionHeading, SectionSurface } from '../ui';
import { useLanguage } from '../../context/LanguageContext';

export default function BestsellingSection() {
  const { language, t } = useLanguage();
  const bestsellers = SAMPLE_PRODUCTS.filter((item) => item.isBestseller).slice(0, 6);

  return (
    <SectionSurface tone="sand" className="border-y border-[#E6DEC9]">
      <Container className="space-y-8 sm:space-y-10">
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

        <ProductGrid products={bestsellers} />
      </Container>
    </SectionSurface>
  );
}
