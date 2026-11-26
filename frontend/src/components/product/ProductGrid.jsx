import { SearchX } from 'lucide-react';
import ProductCard from './ProductCard';
import { Card, ProductCardSkeleton, StaggerGroup, StaggerItem } from '../ui';
import { useLanguage } from '../../context/LanguageContext';

export default function ProductGrid({
  products,
  loading = false,
  skeletonCount = 6,
  columns = 3,
  emptyTitle,
  emptyMessage,
  emptyAction = null,
  className = '',
}) {
  const { t } = useLanguage();

  const gridColsClass =
    columns === 4
      ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-2 md:grid-cols-3';

  if (loading) {
    return (
      <div
        aria-label="Loading products"
        className={`grid ${gridColsClass} gap-3 sm:gap-5 lg:gap-6 items-stretch ${className}`.trim()}
      >
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card
        variant="sand"
        radius="xl"
        padding="lg"
        className="text-center border border-dashed border-[#C9A24B]/55 py-12 px-6 space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-[#0F3D2E] text-[#E8D08B] mx-auto flex items-center justify-center gg-shadow-sm">
          <SearchX className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <p className="font-editorial text-2xl sm:text-3xl font-semibold text-[#0F3D2E]">
            {emptyTitle || t('product.noMatchTitle')}
          </p>
          <p className="text-sm text-[#5A554C] leading-relaxed">
            {emptyMessage || t('product.noMatchText')}
          </p>
        </div>
        {emptyAction && <div className="pt-2 flex justify-center">{emptyAction}</div>}
      </Card>
    );
  }

  return (
    <StaggerGroup
      staggerDelay={0.07}
      delayChildren={0.04}
      className={`grid ${gridColsClass} gap-3 sm:gap-5 lg:gap-6 items-stretch ${className}`.trim()}
    >
      {products.map((product) => (
        <StaggerItem
          key={product.id || product._id || product.slug}
          distance={20}
          className="h-full"
        >
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
