import { useState } from 'react';
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
    <SectionSurface tone="cream" withGrain className="border-t border-[#E6DEC9]">
      <Container className="space-y-8">
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

        <div
          className="flex flex-wrap gap-2 sm:gap-2.5"
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
                className={`px-4 py-2 rounded-full min-h-[40px] text-xs sm:text-sm font-medium transition-all duration-200 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] ${
                  selected
                    ? 'bg-[#0F3D2E] text-[#E8D08B] border-[#0F3D2E] gg-shadow-sm'
                    : 'bg-[#FFFDF8] text-[#1B1B1B] border-[#E6DEC9] hover:border-[#C9A24B] hover:text-[#0F3D2E]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <ProductGrid products={visibleProducts} />
      </Container>
    </SectionSurface>
  );
}
