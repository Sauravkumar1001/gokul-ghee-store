import { Award, Clock, MapPin, Sparkles } from 'lucide-react';
import { WHY_CHOOSE_PILLARS } from '../../data/sampleCatalog';
import {
  Container,
  SectionHeading,
  SectionSurface,
  StaggerGroup,
  StaggerItem,
} from '../ui';
import { useLanguage } from '../../context/LanguageContext';

const ICONS = [Sparkles, MapPin, Clock, Award];

export default function WhyChooseSection() {
  const { language, t } = useLanguage();
  const translatedPillars = t('home.whyChoose.items');
  const pillars =
    language === 'en'
      ? WHY_CHOOSE_PILLARS
      : WHY_CHOOSE_PILLARS.map((item, idx) => ({
          ...item,
          title: translatedPillars?.[idx]?.title || item.title,
          description: translatedPillars?.[idx]?.desc || item.description,
        }));

  return (
    <SectionSurface tone="green" withGrain withJaali className="relative overflow-hidden">
      {/* Drifting subtle atmospheric glow in background */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#C9A24B]/15 blur-[85px] animate-blob-1" />
        <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-[#059669]/18 blur-[90px] animate-blob-2" />
      </div>

      <Container className="space-y-6 sm:space-y-8 relative z-10">
        <SectionHeading
          variant="centered"
          dark
          eyebrow={language === 'en' ? 'Our Commitments' : t('home.whyChoose.eyebrow')}
          title={language === 'en' ? 'Why Families Choose Gokul Ghee' : t('home.whyChoose.title')}
          subtitle={
            language === 'en'
              ? 'Built around neighborhood trust in Anand Bazar, Danapur Cantonment — balancing traditional recipes with modern online transparency.'
              : t('home.whyChoose.subtitle')
          }
        />

        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
          {pillars.map((pillar, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            const indexLabel = String(idx + 1).padStart(2, '0');
            return (
              <StaggerItem key={pillar.id} className="h-full">
                <div className="group h-full rounded-[22px] bg-[#0A2B20]/82 hover:bg-[#0E3527] backdrop-blur-md border border-[#C9A24B]/35 hover:border-[#C9A24B]/80 p-6 sm:p-7 flex flex-col justify-between gap-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(201,162,75,0.24)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A24B]/30 to-[#C9A24B]/10 border border-[#C9A24B]/60 flex items-center justify-center text-[#E8D08B] group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="font-editorial text-2xl font-semibold text-[#C9A24B]/55 group-hover:text-[#E8D08B] transition-colors tabular-nums">
                      {indexLabel}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="font-editorial text-[1.4rem] leading-snug font-semibold text-[#FBF7EE] group-hover:text-[#E8D08B] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#FBF7EE]/80 leading-[1.7]">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </Container>
    </SectionSurface>
  );
}
