import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useCatalogData } from '../hooks/useCatalog';
import ProductGrid from '../components/product/ProductGrid';
import { Button, Container, SectionHeading, SectionSurface } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';

const SORT_OPTIONS = [
  { id: 'featured', label: 'Relevance', hiLabel: 'लोकप्रिय', hinglishLabel: 'Relevant' },
  { id: 'price-asc', label: 'Price: Low to High', hiLabel: 'कीमत: कम से ज़्यादा', hinglishLabel: 'Price: Kam se Zyada' },
  { id: 'price-desc', label: 'Price: High to Low', hiLabel: 'कीमत: ज़्यादा से कम', hinglishLabel: 'Price: Zyada se Kam' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const [sortBy, setSortBy] = useState('featured');
  const { categories, products, isRefreshing } = useCatalogData();
  const { language, t, categoryLabel } = useLanguage();
  const prefersReduced = useReducedMotion();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.categorySlug === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const haystack = [
        product.name,
        product.nameHi || '',
        product.categoryName,
        product.shortDescription,
        product.description,
        ...(product.tags || []),
        ...(product.variants || []).map((v) => v.label),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });

    const sorted = [...matched];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.variants[0].price - b.variants[0].price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.variants[0].price - a.variants[0].price);
    }
    return sorted;
  }, [products, query, selectedCategory, sortBy]);

  const updateParams = (nextQ, nextCategory) => {
    const params = {};
    if (nextQ.trim()) params.q = nextQ;
    if (nextCategory && nextCategory !== 'all') params.category = nextCategory;
    setSearchParams(params);
  };

  const resetSearch = () => {
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <SectionSurface tone="cream" padding="compact" className="min-h-[75vh]">
      <Container className="space-y-6 sm:space-y-8">
        <div className="space-y-5">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-[#5A554C] flex items-center justify-center gap-2"
          >
            <Link to="/" className="hover:text-[#0F3D2E] transition-colors">
              {t('nav.home')}
            </Link>
            <span aria-hidden="true" className="text-[#C9A24B]">/</span>
            <span className="text-[#0F3D2E] font-semibold">
              {isHi ? 'खोज' : 'Search'}
            </span>
          </nav>

          <SectionHeading
            as="h1"
            variant="centered"
            eyebrow={isHi ? 'कैटलॉग खोज' : isHinglish ? 'Store Search' : 'Catalog Search'}
            title={language === 'en' ? 'Search Gokul Ghee' : t('pages.search.title')}
            subtitle={
              isHi
                ? 'ताज़ा देसी घी, मिठाई, समोसा, नमकीन और त्योहार पैक तुरंत खोजें।'
                : 'Search across small-batch Desi Ghee, festive Mithai, Anand Bazar snacks, and gift hampers.'
            }
          />

          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search
                className="w-4 h-4 text-[#7A7468] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => updateParams(e.target.value, selectedCategory)}
                placeholder={t('pages.search.placeholder')}
                aria-label="Search catalog products"
                className="w-full pl-11 pr-11 py-3.5 rounded-full bg-[#FFFDF8] border border-[#C9A24B]/45 text-sm text-[#1B1B1B] placeholder:text-[#7A7468] gg-shadow-sm focus:outline-none focus:border-[#0F3D2E] focus:ring-2 focus:ring-[#C9A24B]/35"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => updateParams('', selectedCategory)}
                  aria-label="Clear search query"
                  className="absolute right-3 w-7 h-7 rounded-full inline-flex items-center justify-center text-[#5A554C] hover:text-[#0F3D2E] hover:bg-[#F3EAD7]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Filter Chips + Sort Bar */}
        <div className="sticky top-[68px] sm:top-[80px] z-20 rounded-[20px] bg-[#FFFDF8]/94 backdrop-blur-xl border border-[#C9A24B]/30 gg-shadow-sm px-3.5 py-2.5 sm:px-5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <button
              type="button"
              onClick={() => updateParams(query, 'all')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#0F3D2E] text-[#FBF7EE]'
                  : 'bg-[#F3EAD7]/75 text-[#1B1B1B] border border-[#E6DEC9] hover:border-[#C9A24B]'
              }`}
            >
              {t('pages.shop.allCategories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateParams(query, cat.slug)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? 'bg-[#0F3D2E] text-[#FBF7EE]'
                    : 'bg-[#F3EAD7]/75 text-[#1B1B1B] border border-[#E6DEC9] hover:border-[#C9A24B]'
                }`}
              >
                {categoryLabel(cat.slug, cat.name)}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <p className="text-xs text-[#5A554C] tabular-nums">
              {isHi ? 'परिणाम:' : 'Found'}{' '}
              <strong className="text-[#0F3D2E]">{results.length}</strong>{' '}
              {isHi ? 'उत्पाद' : results.length === 1 ? 'item' : 'items'}
              {query ? ` matching "${query}"` : ''}
            </p>

            <select
              aria-label="Sort search results"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-1.5 rounded-full bg-[#FBF7EE] border border-[#0F3D2E]/18 text-[#0F3D2E] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {isHi ? opt.hiLabel : isHinglish ? opt.hinglishLabel : opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <motion.div
          key={`${query}-${selectedCategory}-${sortBy}`}
          initial={prefersReduced ? false : { opacity: 0.65, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ProductGrid
            products={results}
            loading={isRefreshing && products.length === 0}
            columns={4}
            emptyTitle={isHi ? 'कोई उत्पाद नहीं मिला' : 'No products found'}
            emptyMessage={
              isHi
                ? 'कृपया देसी घी, लड्डू, समोसा या मठरी खोजें, अथवा पूरा कैटलॉग देखें।'
                : 'Try searching for Desi Ghee, Laddoo, Samosa, Mathri, or reset filters to browse all offerings.'
            }
            emptyAction={
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="primary" size="md" onClick={resetSearch}>
                  {isHi ? 'खोज रीसेट करें' : 'Reset Filters'}
                </Button>
                <Button variant="secondary" size="md" to="/shop">
                  {isHi ? 'सभी उत्पाद देखें' : 'Browse All Offerings'}
                </Button>
              </div>
            }
          />
        </motion.div>
      </Container>
    </SectionSurface>
  );
}
