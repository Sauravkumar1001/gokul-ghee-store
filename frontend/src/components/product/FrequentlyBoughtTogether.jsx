import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBag } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../data/sampleCatalog';
import { formatINR } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { Badge, Button, Card, Container, SectionHeading, SectionSurface } from '../ui';

function cleanTitle(raw = '') {
  return String(raw).replace(/\s*\(Sample\)\s*/gi, '').trim();
}

export default function FrequentlyBoughtTogether({ currentProduct, activeVariant }) {
  const { addItem } = useCart();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const companions = useMemo(() => {
    if (!currentProduct) return [];
    const currentId = currentProduct.id || currentProduct._id;
    const differentCat = SAMPLE_PRODUCTS.filter(
      (p) => (p.id || p._id) !== currentId && p.categorySlug !== currentProduct.categorySlug
    );
    const sameCat = SAMPLE_PRODUCTS.filter(
      (p) => (p.id || p._id) !== currentId && p.categorySlug === currentProduct.categorySlug
    );
    return [...differentCat, ...sameCat].slice(0, 2);
  }, [currentProduct]);

  const [selectedSlugs, setSelectedSlugs] = useState(() => companions.map((p) => p.slug));
  const [bundleAdded, setBundleAdded] = useState(false);

  if (!currentProduct || !activeVariant || companions.length === 0) return null;

  const toggleCompanion = (slug) => {
    setBundleAdded(false);
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  };

  const activeCompanions = companions.filter((p) => selectedSlugs.includes(p.slug));
  const bundleTotal =
    activeVariant.price +
    activeCompanions.reduce((sum, p) => sum + (p.variants?.[0]?.price || 0), 0);
  const bundleMrp =
    (activeVariant.mrp || activeVariant.price) +
    activeCompanions.reduce(
      (sum, p) => sum + (p.variants?.[0]?.mrp || p.variants?.[0]?.price || 0),
      0
    );
  const totalSavings = Math.max(0, bundleMrp - bundleTotal);

  const handleAddBundle = () => {
    addItem(currentProduct, activeVariant, 1);
    for (const item of activeCompanions) {
      if (item.variants?.[0]) {
        addItem(item, item.variants[0], 1);
      }
    }
    setBundleAdded(true);
  };

  return (
    <SectionSurface tone="sand" padding="compact" className="border-t border-[#E6DEC9]">
      <Container className="space-y-8">
        <SectionHeading
          variant="centered"
          eyebrow={isHi ? 'पारिवारिक कॉम्बो सुझाव' : 'Complete Your Table'}
          title={isHi ? 'साथ में अक्सर खरीदे जाते हैं' : 'Frequently Bought Together'}
          subtitle={
            isHi
              ? 'दानापुर के परिवारों द्वारा साथ चुनी जाने वाली शुद्ध घी, मिठाई और नमकीन की जोड़ियां।'
              : 'Pair this selection with complementary kitchen staples or festive treats in a single click.'
          }
        />

        <Card variant="elevated" radius="xl" padding="lg" className="border-[#C9A24B]/35 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5 sm:gap-3">
              {/* Current Item */}
              <div className="min-w-0 w-full rounded-[16px] border border-[#0F3D2E]/20 bg-[#FBF7EE] p-3 flex items-center gap-2.5">
                <img
                  src={currentProduct.images[0]}
                  alt={cleanTitle(currentProduct.name)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-[10px] object-cover shrink-0 bg-[#F3EAD7]"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9C7725] block">
                    {isHi ? 'चयनित उत्पाद' : 'This item'}
                  </span>
                  <p className="font-editorial text-sm sm:text-base font-semibold text-[#0F3D2E] truncate">
                    {cleanTitle(currentProduct.name)}
                  </p>
                  <p className="text-xs font-semibold text-[#1B1B1B] tabular-nums">
                    {formatINR(activeVariant.price)}
                  </p>
                </div>
              </div>

              {companions.map((comp) => {
                const checked = selectedSlugs.includes(comp.slug);
                const compVariant = comp.variants?.[0];
                if (!compVariant) return null;

                return (
                  <div key={comp.slug} className="contents">
                    <span
                      aria-hidden="true"
                      className="justify-self-center w-7 h-7 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/45 text-[#0F3D2E] flex items-center justify-center shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </span>

                    <div
                      className={`min-w-0 w-full rounded-[16px] border p-3 flex items-center gap-2.5 transition-colors ${
                        checked
                          ? 'border-[#C9A24B] bg-[#FFFDF8] shadow-xs'
                          : 'border-[#E6DEC9] bg-[#FBF7EE]/65 opacity-65'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCompanion(comp.slug)}
                        aria-label={`Include ${cleanTitle(comp.name)} in bundle`}
                        className="accent-[#0F3D2E] w-4 h-4 shrink-0 cursor-pointer"
                      />
                      <img
                        src={comp.images[0]}
                        alt={cleanTitle(comp.name)}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-[10px] object-cover shrink-0 bg-[#F3EAD7]"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/product/${comp.slug}`}
                          className="font-editorial text-sm sm:text-base font-semibold text-[#0F3D2E] hover:text-[#9C7725] block truncate"
                        >
                          {cleanTitle(comp.name)}
                        </Link>
                        <p className="text-xs font-semibold text-[#1B1B1B] tabular-nums">
                          {formatINR(compVariant.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bundle Price & CTA */}
            <div className="lg:col-span-4 rounded-[18px] bg-[#0F3D2E] text-[#FBF7EE] p-5 space-y-3.5 border border-[#C9A24B]/40">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-[0.16em] text-[#E8D08B] font-semibold">
                  {isHi
                    ? `${1 + activeCompanions.length} उत्पाद`
                    : `Bundle Total (${1 + activeCompanions.length} ${
                        activeCompanions.length === 0 ? 'item' : 'items'
                      })`}
                </span>
                {totalSavings > 0 && (
                  <Badge variant="gold-solid" size="sm">
                    Save {formatINR(totalSavings)}
                  </Badge>
                )}
              </div>

              <div className="flex items-baseline gap-2.5 tabular-nums">
                <span className="text-3xl font-semibold text-[#FBF7EE]">
                  {formatINR(bundleTotal)}
                </span>
                {bundleMrp > bundleTotal && (
                  <span className="text-sm text-[#FBF7EE]/60 line-through">
                    {formatINR(bundleMrp)}
                  </span>
                )}
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                dark
                fullWidth
                onClick={handleAddBundle}
                leftIcon={<ShoppingBag className="w-4 h-4" aria-hidden="true" />}
              >
                {bundleAdded
                  ? isHi
                    ? 'कॉम्बो कार्ट में जोड़ा गया'
                    : 'Bundle Added to Cart'
                  : isHi
                    ? 'चयनित कॉम्बो कार्ट में जोड़ें'
                    : `Add ${1 + activeCompanions.length} Items to Cart`}
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    </SectionSurface>
  );
}
