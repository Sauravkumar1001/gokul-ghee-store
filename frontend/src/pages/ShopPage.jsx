import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useCatalogData } from '../hooks/useCatalog';
import SampleNoticeBanner from '../components/common/SampleNoticeBanner';
import ProductGrid from '../components/product/ProductGrid';
import { Button, Card, Container, SectionHeading, SectionSurface } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', hiLabel: 'सभी कीमतें', hinglishLabel: 'Saari Prices', min: 0, max: Infinity },
  { id: 'under-250', label: 'Under ₹250', hiLabel: '₹250 से कम', hinglishLabel: '₹250 se Kam', min: 0, max: 250 },
  { id: '250-600', label: '₹250 – ₹600', hiLabel: '₹250 – ₹600', hinglishLabel: '₹250 – ₹600', min: 250, max: 600 },
  { id: '600-1200', label: '₹600 – ₹1,200', hiLabel: '₹600 – ₹1,200', hinglishLabel: '₹600 – ₹1,200', min: 600, max: 1200 },
  { id: 'above-1200', label: 'Above ₹1,200', hiLabel: '₹1,200 से ऊपर', hinglishLabel: '₹1,200 se Upar', min: 1200, max: Infinity },
];

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured', hiLabel: 'लोकप्रिय', hinglishLabel: 'Popular' },
  { id: 'price-asc', label: 'Price: Low to High', hiLabel: 'कीमत: कम से ज़्यादा', hinglishLabel: 'Price: Kam se Zyada' },
  { id: 'price-desc', label: 'Price: High to Low', hiLabel: 'कीमत: ज़्यादा से कम', hinglishLabel: 'Price: Zyada se Kam' },
  { id: 'name-asc', label: 'Name: A to Z', hiLabel: 'नाम: A से Z', hinglishLabel: 'Naam: A se Z' },
];

const PAGE_SIZE = 6;

export default function ShopPage() {
  const { category: categoryParam } = useParams();
  const navigate = useNavigate();
  const { categories, products, isRefreshing } = useCatalogData();
  const { language, t, categoryLabel, categoryTagline } = useLanguage();
  const prefersReduced = useReducedMotion();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  const [priceRangeId, setPriceRangeId] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeCategory = useMemo(
    () => categories.find((cat) => cat.slug === categoryParam) || null,
    [categories, categoryParam]
  );

  const selectedPriceRange =
    PRICE_RANGES.find((r) => r.id === priceRangeId) || PRICE_RANGES[0];

  const filteredProducts = useMemo(() => {
    const base = activeCategory
      ? products.filter((p) => p.categorySlug === activeCategory.slug)
      : products;

    const byPrice = base.filter((product) => {
      const startingPrice = product.variants[0]?.price ?? 0;
      return (
        startingPrice >= selectedPriceRange.min &&
        startingPrice <= selectedPriceRange.max
      );
    });

    const sorted = [...byPrice];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.variants[0].price - b.variants[0].price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.variants[0].price - a.variants[0].price);
    } else if (sortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }, [activeCategory, products, selectedPriceRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const hasActiveFilter = Boolean(activeCategory) || priceRangeId !== 'all';

  const handleCategoryChange = (slug) => {
    setCurrentPage(1);
    setMobileFiltersOpen(false);
    navigate(slug ? `/shop/${slug}` : '/shop');
  };

  const handlePriceChange = (id) => {
    setPriceRangeId(id);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setPriceRangeId('all');
    setSortBy('featured');
    setCurrentPage(1);
    setMobileFiltersOpen(false);
    navigate('/shop');
  };

  const pageTitle = activeCategory
    ? categoryLabel(activeCategory.slug, activeCategory.name)
    : language === 'en'
      ? 'All Gokul Ghee Offerings'
      : t('pages.shop.title');

  const pageSubtitle = activeCategory
    ? language === 'en'
      ? activeCategory.description
      : categoryTagline(activeCategory.slug, activeCategory.description)
    : language === 'en'
      ? 'Explore small-batch Desi Ghee, authentic Mithai, Anand Bazar counter Samosas, dry-fruit Namkeen, and festive gifting combos.'
      : t('pages.shop.subtitle');

  const pageEyebrow = activeCategory
    ? activeCategory.eyebrow
    : isHi
      ? 'संपूर्ण संग्रह'
      : isHinglish
        ? 'Poora Collection'
        : 'Complete Collection';

  return (
    <SectionSurface tone="cream" padding="compact" className="min-h-[75vh]">
      <Container className="space-y-6 sm:space-y-8">
        {/* Centered Breadcrumb & Page Header consistent with Home Page */}
        <div className="space-y-4">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-[#5A554C] flex flex-wrap items-center justify-center gap-2"
          >
            <Link to="/" className="hover:text-[#0F3D2E] transition-colors">
              {t('nav.home')}
            </Link>
            <span aria-hidden="true" className="text-[#C9A24B]">/</span>
            <Link
              to="/shop"
              className={`hover:text-[#0F3D2E] transition-colors ${
                !activeCategory ? 'text-[#0F3D2E] font-semibold' : ''
              }`}
            >
              {t('nav.shop')}
            </Link>
            {activeCategory && (
              <>
                <span aria-hidden="true" className="text-[#C9A24B]">/</span>
                <span className="text-[#0F3D2E] font-semibold">
                  {categoryLabel(activeCategory.slug, activeCategory.name)}
                </span>
              </>
            )}
          </nav>

          <SectionHeading
            as="h1"
            variant="centered"
            eyebrow={pageEyebrow}
            title={pageTitle}
            subtitle={pageSubtitle}
          />
        </div>

        {/* Show Kitchen Selection banner only on /shop, not category pages */}
        {!activeCategory && <SampleNoticeBanner compact />}

        {/* Sticky Filter / Category Chip / Sort Bar */}
        <div className="sticky top-[68px] sm:top-[80px] z-20 rounded-[20px] bg-[#FFFDF8]/94 backdrop-blur-xl border border-[#C9A24B]/30 gg-shadow-sm px-3.5 py-2.5 sm:px-5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Chips */}
          <div
            role="tablist"
            aria-label="Filter by category"
            className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!activeCategory}
              onClick={() => handleCategoryChange('')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                !activeCategory
                  ? 'bg-[#0F3D2E] text-[#FBF7EE] shadow-xs'
                  : 'bg-[#F3EAD7]/75 text-[#1B1B1B] border border-[#E6DEC9] hover:border-[#C9A24B]'
              }`}
            >
              {t('nav.allProducts')}
            </button>

            {categories.map((cat) => {
              const active = activeCategory?.slug === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#0F3D2E] text-[#FBF7EE] shadow-xs'
                      : 'bg-[#F3EAD7]/75 text-[#1B1B1B] border border-[#E6DEC9] hover:border-[#C9A24B]'
                  }`}
                >
                  {categoryLabel(cat.slug, cat.name)}
                </button>
              );
            })}
          </div>

          {/* Sort + Mobile Bottom-Sheet Trigger */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#0F3D2E]/20 bg-[#FBF7EE] text-xs font-semibold text-[#0F3D2E] hover:border-[#C9A24B] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#9C7725]" aria-hidden="true" />
              <span>{isHi ? 'फ़िल्टर' : 'Filters'}</span>
              {priceRangeId !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-[#C9A24B]" aria-hidden="true" />
              )}
            </button>

            <div className="flex items-center gap-2">
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#9C7725] hover:text-[#0F3D2E] hover:bg-[#F3EAD7] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>{isHi ? 'रीसेट' : 'Reset'}</span>
                </button>
              )}

              <label className="inline-flex items-center gap-2 text-xs text-[#5A554C]">
                <span className="hidden sm:inline font-medium">{t('pages.shop.sortLabel')}:</span>
                <select
                  aria-label="Sort products"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3.5 py-2 rounded-full bg-[#FBF7EE] border border-[#0F3D2E]/18 text-[#0F3D2E] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {isHi ? opt.hiLabel : isHinglish ? opt.hinglishLabel : opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Desktop Price Sidebar + Main Grid (Category navigation stays in sticky chips above) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-start">
          {/* Desktop Price Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-44">
            <Card variant="elevated" radius="lg" padding="md" className="space-y-5">
              {/* Price Range */}
              <div className="space-y-3">
                <h2 className="gg-eyebrow text-[#9C7725]">
                  {isHi ? 'कीमत सीमा' : 'Price Range'}
                </h2>
                <div className="space-y-1.5 text-sm">
                  {PRICE_RANGES.map((range) => {
                    const selected = priceRangeId === range.id;
                    return (
                      <label
                        key={range.id}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-[12px] cursor-pointer transition-colors ${
                          selected
                            ? 'bg-[#F3EAD7] text-[#0F3D2E] font-semibold'
                            : 'hover:bg-[#F3EAD7]/50 text-[#35322C]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="price-range"
                          checked={selected}
                          onChange={() => handlePriceChange(range.id)}
                          className="accent-[#0F3D2E]"
                        />
                        <span>
                          {isHi ? range.hiLabel : isHinglish ? range.hinglishLabel : range.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={resetFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                {language === 'en' ? 'Reset Filters' : t('pages.shop.clearFilters')}
              </Button>
            </Card>
          </aside>

          {/* Product Grid Column */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between text-xs text-[#5A554C] px-1 tabular-nums">
              <p>
                {isHi ? 'दिखा रहे हैं' : 'Showing'}{' '}
                <strong className="text-[#0F3D2E]">{paginatedProducts.length}</strong> /{' '}
                <strong className="text-[#0F3D2E]">{filteredProducts.length}</strong>
              </p>
              {totalPages > 1 && (
                <p>
                  {isHi ? `पेज ${safePage} / ${totalPages}` : `Page ${safePage} of ${totalPages}`}
                </p>
              )}
            </div>

            <motion.div
              key={`${activeCategory?.slug || 'all'}-${priceRangeId}-${sortBy}-${safePage}`}
              initial={prefersReduced ? false : { opacity: 0.65, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              <ProductGrid
                products={paginatedProducts}
                loading={isRefreshing && products.length === 0}
                columns={3}
                emptyTitle={language === 'en' ? 'No products found' : t('pages.shop.noProducts')}
                emptyMessage={
                  isHi
                    ? 'कृपया कीमत सीमा साफ़ करें या सभी श्रेणियों पर वापस जाएं।'
                    : isHinglish
                      ? 'Price range clear karein ya saari categories dekhein.'
                      : 'Try clearing the price range or switching back to all categories.'
                }
                emptyAction={
                  <Button variant="primary" size="md" onClick={resetFilters}>
                    {language === 'en' ? 'Reset Filters' : t('pages.shop.clearFilters')}
                  </Button>
                }
              />
            </motion.div>

            {/* Tidy Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Catalog pagination"
                className="flex items-center justify-center gap-2 pt-4"
              >
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[#0F3D2E]/18 bg-[#FFFDF8] text-xs font-semibold text-[#0F3D2E] hover:border-[#C9A24B] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={pageNum === safePage ? 'page' : undefined}
                    className={`w-9 h-9 rounded-full text-xs font-semibold border transition-colors cursor-pointer tabular-nums ${
                      pageNum === safePage
                        ? 'bg-[#0F3D2E] text-[#FBF7EE] border-[#0F3D2E] shadow-xs'
                        : 'bg-[#FFFDF8] text-[#1B1B1B] border-[#0F3D2E]/15 hover:border-[#C9A24B]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[#0F3D2E]/18 bg-[#FFFDF8] text-xs font-semibold text-[#0F3D2E] hover:border-[#C9A24B] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile Bottom Sheet Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <motion.button
              type="button"
              aria-label="Close filters backdrop"
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-[#0A2B20]/55 backdrop-blur-[2px]"
            />

            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Filter products"
              initial={prefersReduced ? false : { y: '100%' }}
              animate={{ y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 max-h-[82vh] overflow-y-auto rounded-t-[28px] bg-[#FFFDF8] border-t border-[#C9A24B]/45 gg-shadow-elevated p-5 space-y-5"
            >
              <div className="w-10 h-1 rounded-full bg-[#C9A24B]/45 mx-auto" aria-hidden="true" />

              <div className="flex items-center justify-between border-b border-[#0F3D2E]/10 pb-3">
                <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                  {isHi ? 'फ़िल्टर और क्रम' : 'Filter Offerings'}
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#0F3D2E] hover:bg-[#F3EAD7]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                <p className="gg-eyebrow text-[#9C7725]">
                  {isHi ? 'कीमत सीमा' : 'Price Range'}
                </p>
                <div className="grid grid-cols-1 gap-1.5 text-sm">
                  {PRICE_RANGES.map((range) => {
                    const selected = priceRangeId === range.id;
                    return (
                      <label
                        key={range.id}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] cursor-pointer ${
                          selected ? 'bg-[#F3EAD7] text-[#0F3D2E] font-semibold' : 'text-[#35322C]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mobile-price-range"
                          checked={selected}
                          onChange={() => handlePriceChange(range.id)}
                          className="accent-[#0F3D2E]"
                        />
                        <span>
                          {isHi ? range.hiLabel : isHinglish ? range.hinglishLabel : range.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button variant="secondary" size="md" onClick={resetFilters} className="flex-1">
                  {isHi ? 'रीसेट' : 'Reset'}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-[2]"
                >
                  {isHi
                    ? `${filteredProducts.length} उत्पाद देखें`
                    : `Show ${filteredProducts.length} ${
                        filteredProducts.length === 1 ? 'Item' : 'Items'
                      }`}
                </Button>
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </SectionSurface>
  );
}
