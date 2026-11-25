import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { STORE_CONFIG } from '../config/storeConfig';
import { WHY_CHOOSE_PILLARS } from '../data/sampleCatalog';
import { useLanguage } from '../context/LanguageContext';
import {
  Badge,
  Button,
  Card,
  Container,
  JaaliPattern,
  SectionHeading,
  SectionSurface,
} from '../components/ui';

export default function AboutPage() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const translatedPillars = t('home.whyChoose.items');
  const pillars =
    language === 'en'
      ? WHY_CHOOSE_PILLARS
      : WHY_CHOOSE_PILLARS.map((p, idx) => ({
          ...p,
          title: translatedPillars?.[idx]?.title || p.title,
          description: translatedPillars?.[idx]?.desc || p.description,
        }));

  return (
    <div className="bg-[#FBF7EE] py-8 sm:py-12 lg:py-16 space-y-12 sm:space-y-16">
      <Container className="space-y-10 sm:space-y-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-[#5A554C] flex flex-wrap items-center gap-2"
        >
          <Link to="/" className="hover:text-[#0F3D2E] transition-colors">
            {t('nav.home')}
          </Link>
          <span aria-hidden="true" className="text-[#C9A24B]">/</span>
          <span className="text-[#0F3D2E] font-semibold">
            {isHi ? 'हमारी विरासत' : isHinglish ? 'Hamari Kahani' : 'Our Story'}
          </span>
        </nav>

        {/* Hero Narrative Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
                {isHi ? 'हमारी विरासत व परंपरा' : isHinglish ? 'Hamari Virasat' : 'Heritage & Craftsmanship'}
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F3D2E] leading-[1.12]">
                {isHi ? t('common.brandFull') : STORE_CONFIG.businessName}
              </h1>
              <p className="text-base sm:text-lg font-editorial italic text-[#9A7624] pt-1">
                “{STORE_CONFIG.tagline}”
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#5A554C] leading-relaxed">
              <p>
                {isHi ? (
                  <>
                    दानापुर कैंटोनमेंट के ऐतिहासिक आनंद बाजार में, मठ रोड पर हिंदू सोसाइटी मंदिर के समीप स्थित,{' '}
                    <strong className="text-[#0F3D2E] font-semibold">{STORE_CONFIG.businessName}</strong> वर्षों से
                    पटना और दानापुर के परिवारों में शुद्धता, विश्वास और स्वाद का प्रतीक रहा है।
                  </>
                ) : isHinglish ? (
                  <>
                    Danapur Cantonment ke Anand Bazar mein, Math Road par Hindu Society Mandir ke paas,{' '}
                    <strong className="text-[#0F3D2E] font-semibold">{STORE_CONFIG.businessName}</strong> saalon se
                    har ghar mein shuddhata aur behtareen taste ka bharosa bana hua hai.
                  </>
                ) : (
                  <>
                    Nestled in the bustling heart of Anand Bazar, Danapur Cantonment along Math Road near
                    Hindu Society Mandir, <strong className="text-[#0F3D2E] font-semibold">{STORE_CONFIG.businessName}</strong> represents
                    everyday trust built across neighborhood kitchens, auspicious ceremonies, and heartfelt Bihari hospitality.
                  </>
                )}
              </p>
              <p>
                {isHi ? (
                  <>
                    हमारी डिजिटल रसोई से आप पारंपरिक बिलोना गाय व भैंस का दानेदार देसी घी, ताज़ी खोया मिठाइयां,
                    काउंटर के गरमा-गरम समोसे और खस्ता नमकीन सीधे अपने दरवाजे तक मंगा सकते हैं।
                  </>
                ) : isHinglish ? (
                  <>
                    Hamari digital rasoi se aap traditional Bilona Desi Ghee, taazi Khoya mithaiyan,
                    garma-garam samosa aur namkeen directly apne doorstep par order kar sakte hain.
                  </>
                ) : (
                  <>
                    Our digital storefront brings the authentic aroma of our kitchen to your home — offering
                    slow-clarified granular Bilona Ghee, fresh celebration Mithai, golden Samosas, and crunchy
                    artisanal Namkeen with transparent doorstep serviceability.
                  </>
                )}
              </p>
            </div>

            {/* Quick Proof Pills */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <Badge variant="gold" size="sm" icon={<Award className="w-3.5 h-3.5 text-[#9A7624]" />}>
                100% Pure Danapur Desi Ghee
              </Badge>
              <Badge variant="forest" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5 text-[#E8D08B]" />}>
                4.9 ★ (169 Google Reviews)
              </Badge>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                as={Link}
                to="/shop"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4 text-[#0F3D2E]" />}
              >
                {isHi ? 'हमारे उत्पाद देखें' : 'Explore Products'}
              </Button>
              <Button
                as={Link}
                to="/contact"
                variant="secondary"
                size="md"
                leftIcon={<MapPin className="w-4 h-4 text-[#0F3D2E]" />}
              >
                {isHi ? 'स्टोर पर आएं' : 'Visit Our Store'}
              </Button>
            </div>
          </div>

          {/* Right Image Showcase with Jaali Accent */}
          <div className="lg:col-span-6">
            <div className="relative rounded-[28px] overflow-hidden border border-[#C9A24B]/35 bg-[#F3EAD7] gg-shadow-elevated">
              <img
                src="/images/story-heritage.jpg"
                alt="Traditional ghee simmering craftsmanship at Gokul Ghee"
                className="w-full aspect-[4/3] object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/70 via-transparent to-transparent pointer-events-none"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-[20px] bg-[#FFFDF8]/90 backdrop-blur-md border border-[#E6DEC9] text-[#0F3D2E] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9A7624]">
                    Danapur Kitchen
                  </p>
                  <p className="text-xs sm:text-sm font-semibold truncate">
                    Math Road, Near Hindu Society Mandir
                  </p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#0F3D2E] text-[#FBF7EE] text-[11px] font-semibold">
                  Open 9 AM – 9 PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="pt-6 space-y-6">
          <SectionHeading
            variant="centered"
            eyebrow={isHi ? 'हमारी विशेषता' : isHinglish ? 'Hamari Khasiyat' : 'Why Families Choose Us'}
            title={isHi ? 'शुद्धता और विश्वास के चार आधार स्तंभ' : 'Four Pillars of Everyday Kitchen Trust'}
            subtitle={
              isHi
                ? 'गुणवत्ता, प्रामाणिकता और दानापुर के स्वाद का अटूट वादा।'
                : 'Every jar, mithai box, and savory snack honors traditional preparation standards.'
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar) => (
              <Card
                key={pillar.id}
                variant="elevated"
                radius="lg"
                padding="md"
                className="space-y-3 border-[#E6DEC9] hover:border-[#C9A24B]/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/30 flex items-center justify-center text-[#9A7624]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-editorial text-xl font-semibold text-[#0F3D2E] leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5A554C] leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
