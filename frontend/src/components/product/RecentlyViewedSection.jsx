import { SAMPLE_PRODUCTS } from '../../data/sampleCatalog';
import { Container, SectionHeading, SectionSurface } from '../ui';
import ProductGrid from './ProductGrid';
import { useLanguage } from '../../context/LanguageContext';

export default function RecentlyViewedSection({ slugs }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  if (!slugs || slugs.length === 0) return null;

  const recentProducts = slugs
    .map((slug) => SAMPLE_PRODUCTS.find((p) => p.slug === slug))
    .filter(Boolean);

  if (recentProducts.length === 0) return null;

  return (
    <SectionSurface tone="cream" padding="compact" className="border-t border-[#E6DEC9]">
      <Container className="space-y-8">
        <SectionHeading
          variant="centered"
          eyebrow={isHi ? 'हाल ही में देखे गए' : 'Browsing History'}
          title={isHi ? 'आपके द्वारा देखे गए उत्पाद' : 'Recently Viewed Products'}
          subtitle={
            isHi
              ? 'इस डिवाइस पर पहले देखे गए उत्पादों पर तुरंत वापस जाएं।'
              : 'Quickly return to items you explored earlier on this device.'
          }
        />

        <ProductGrid products={recentProducts} columns={4} />
      </Container>
    </SectionSurface>
  );
}
