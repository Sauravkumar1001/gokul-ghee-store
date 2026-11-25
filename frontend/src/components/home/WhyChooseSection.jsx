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
    <SectionSurface tone="green" withGrain withJaali>
      <Container className="space-y-12">
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
                <div className="h-full rounded-[20px] bg-[#0A2B20]/78 backdrop-blur-xs border border-[#C9A24B]/30 hover:border-[#C9A24B]/65 p-6 sm:p-7 flex flex-col justify-between gap-5 transition-colors duration-300">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C9A24B]/25 to-[#C9A24B]/10 border border-[#C9A24B]/50 flex items-center justify-center text-[#E8D08B]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="font-editorial text-2xl font-semibold text-[#C9A24B]/55 tabular-nums">
                      {indexLabel}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="font-editorial text-[1.4rem] leading-snug font-semibold text-[#FBF7EE]">
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
