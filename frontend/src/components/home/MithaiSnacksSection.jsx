import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../data/sampleCatalog';
import ProductGrid from '../product/ProductGrid';
import { Container, SectionHeading, SectionSurface } from '../ui';
import { useLanguage } from '../../context/LanguageContext';

export default function MithaiSnacksSection() {
  const [activeTab, setActiveTab] = useState('all');
  const { language, t, categoryLabel } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  const tabs = [
    {
      key: 'all',
      label: isHi ? 'सभी मिठाई व स्नैक्स' : isHinglish ? 'Saari Mithai & Snacks' : 'All Mithai & Snacks',
    },
    { key: 'mithai', label: categoryLabel('mithai', 'Mithai') },
    { key: 'samosa', label: categoryLabel('samosa', 'Samosa') },
    { key: 'namkeen', label: categoryLabel('namkeen', 'Namkeen') },
    { key: 'traditional-snacks', label: categoryLabel('traditional-snacks', 'Traditional Snacks') },
  ];

  const mithaiAndSnacks = SAMPLE_PRODUCTS.filter((item) =>
    ['mithai', 'samosa', 'namkeen', 'traditional-snacks'].includes(item.categorySlug)
  );

  const visibleProducts =
    activeTab === 'all'
      ? mithaiAndSnacks
      : mithaiAndSnacks.filter((item) => item.categorySlug === activeTab);

  return (
    <SectionSurface tone="cream" withGrain className="border-t border-[#E6DEC9]/70 relative">
      <Container className="space-y-8 relative z-10">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF8]/90 border border-[#C9A24B]/40 text-[#9C7725] text-xs font-bold tracking-wider uppercase backdrop-blur-sm shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span>
              {isHi
                ? 'आनंद बाजार की ताज़ा मिठास • प्रतिदिन ताजा तैयार'
                : 'Fresh Counter Craft • Handcrafted Daily'}
            </span>
          </div>

          <SectionHeading
            variant="centered"
            eyebrow={language === 'en' ? 'Counter & Pantry Delicacies' : t('home.mithaiSnacks.eyebrow')}
            title={
              language === 'en'
                ? 'Mithai & Traditional Snacks Showcase'
                : t('home.mithaiSnacks.title')
            }
            subtitle={
              language === 'en'
                ? 'Celebrate everyday hospitality with golden Motichoor Laddoo, Kaju Katli, fresh Samosas, and crunchy artisanal Namkeen.'
                : t('home.mithaiSnacks.subtitle')
            }
            actionLabel={language === 'en' ? 'Explore Mithai' : t('home.mithaiSnacks.mithaiCta')}
            actionTo="/shop/mithai"
          />
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
          role="tablist"
          aria-label="Filter Mithai and Snacks"
        >
          {tabs.map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full min-h-[40px] text-xs sm:text-sm font-semibold transition-all duration-300 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] ${
                  selected
                    ? 'bg-gradient-to-r from-[#0F3D2E] via-[#124B38] to-[#0F3D2E] text-[#E8D08B] border-[#C9A24B] shadow-[0_6px_20px_rgba(201,162,75,0.28)] -translate-y-0.5'
                    : 'bg-[#FFFDF8]/90 backdrop-blur-sm text-[#1B1B1B] border-[#E6DEC9] hover:border-[#C9A24B]/70 hover:text-[#0F3D2E] hover:shadow-xs'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Ambient golden halo behind products grid */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.09)_0%,transparent_72%)]"
          />
          <ProductGrid products={visibleProducts} />
        </div>
      </Container>
    </SectionSurface>
  );
}
