import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SAMPLE_CATEGORIES } from '../../data/sampleCatalog';
import { useLanguage } from '../../context/LanguageContext';
import {
  Container,
  SectionHeading,
  SectionSurface,
  StaggerGroup,
  StaggerItem,
} from '../ui';

export default function CategoryShowcase() {
  const { language, t, categoryLabel, categoryTagline } = useLanguage();

  return (
    <SectionSurface id="featured-categories" tone="cream">
      <Container className="space-y-6 sm:space-y-8">
        <SectionHeading
          variant="centered"
          eyebrow={
            language === 'en' ? 'Curated Pantry & Counter' : t('home.categoryShowcase.eyebrow')
          }
          title={
            language === 'en' ? 'Explore Our Seven Collections' : t('home.categoryShowcase.title')
          }
          subtitle={
            language === 'en'
              ? 'From slow-simmered Desi Ghee and hand-finished festive Mithai to hot Anand Bazar Samosas and crisp tea-time Namkeen.'
              : t('home.categoryShowcase.subtitle')
          }
          actionLabel={language === 'en' ? 'View Full Catalog' : t('home.bestselling.viewAll')}
          actionTo="/shop"
        />

        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {SAMPLE_CATEGORIES.map((category, idx) => {
            const displayName = categoryLabel(category.slug, category.name);
            const displayDesc =
              language === 'en'
                ? category.description
                : categoryTagline(category.slug, category.description);

            return (
              <StaggerItem
                key={category.id}
                className={idx === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}
              >
                <Link
                  to={`/shop/${category.slug}`}
                  className={`group relative h-full rounded-[22px] overflow-hidden border border-[#E6DEC9] hover:border-[#C9A24B]/80 bg-[#0A2B20] gg-shadow-card flex flex-col justify-end transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(201,162,75,0.24)] ${
                    idx === 0 ? 'min-h-[280px] sm:min-h-[320px]' : 'min-h-[250px] sm:min-h-[270px]'
                  }`}
                >
                  <img
                    src={category.image}
                    alt={displayName}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0A2B20]/95 via-[#0F3D2E]/45 to-transparent"
                  />

                  <div className="relative z-10 p-5 sm:p-6 flex items-end justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E8D08B]">
                        {category.eyebrow}
                      </span>
                      <h3 className="font-editorial text-2xl sm:text-[1.7rem] leading-tight font-semibold text-[#FBF7EE] group-hover:text-[#FDE68A] transition-colors">
                        {displayName}
                      </h3>
                      <p className="text-xs text-[#FBF7EE]/82 line-clamp-2 max-w-md leading-relaxed">
                        {displayDesc}
                      </p>
                    </div>

                    <span className="shrink-0 w-10 h-10 rounded-full border border-[#C9A24B]/65 bg-[#0A2B20]/80 text-[#E8D08B] flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#C9A24B] group-hover:to-[#E8D08B] group-hover:text-[#0F3D2E] group-hover:border-[#E8D08B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
                      <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </Container>
    </SectionSurface>
  );
}
