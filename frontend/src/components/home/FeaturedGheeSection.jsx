import { ArrowRight } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../data/sampleCatalog';
import ProductCard from '../product/ProductCard';
import {
  Button,
  Card,
  Container,
  JaaliPattern,
  Reveal,
  SectionHeading,
  SectionSurface,
} from '../ui';
import { useLanguage } from '../../context/LanguageContext';

export default function FeaturedGheeSection() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const gheeProducts = SAMPLE_PRODUCTS.filter((p) => p.categorySlug === 'desi-ghee');

  return (
    <SectionSurface tone="white">
      <Container className="space-y-10">
        <SectionHeading
          variant="centered"
          eyebrow={language === 'en' ? 'The Heart of Gokul Ghee' : t('home.featuredGhee.eyebrow')}
          title={
            language === 'en' ? 'Featured Desi Ghee Collection' : t('home.featuredGhee.title')
          }
          subtitle={
            language === 'en'
              ? 'Granular, golden, and slow-clarified for sacred rituals, festive halwas, and everyday household nourishment.'
              : t('home.featuredGhee.subtitle')
          }
          actionLabel={t('home.featuredGhee.cta')}
          actionTo="/shop/desi-ghee"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* Editorial Spotlight Card */}
          <Reveal direction="left" className="lg:col-span-5 flex">
            <Card
              variant="green"
              radius="lg"
              padding="none"
              className="relative w-full overflow-hidden flex flex-col border-[#C9A24B]/35"
            >
              <div className="relative overflow-hidden">
                <img
                  src="/images/ghee-pour.jpg"
                  alt="Pouring golden Desi Ghee from hammered brass ladle"
                  loading="lazy"
                  className="w-full aspect-[16/10] object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0F3D2E] via-[#0F3D2E]/55 to-transparent"
                />
              </div>

              <div className="relative overflow-hidden p-6 sm:p-7 flex-1 flex flex-col justify-between gap-6">
                <JaaliPattern
                  variant="mandala"
                  opacity={0.075}
                  className="absolute -right-14 -bottom-14 w-64 h-64"
                />

                <div className="relative z-10 space-y-3">
                  <span className="gg-eyebrow text-[#E8D08B] block">
                    {isHi
                      ? 'दानेदार खुशबू और शुद्ध बनावट'
                      : isHinglish
                        ? 'Danedar Khushboo & Texture'
                        : 'Danedar Aroma & Texture'}
                  </span>
                  <h3 className="gg-h3 text-[#FBF7EE]">
                    {isHi
                      ? 'शुद्ध स्वाद को महत्व देने वाले घरों की पहली पसंद'
                      : isHinglish
                        ? 'Shuddh Swaad Pasand Karne Wale Gharon ke Liye'
                        : 'Crafted for Kitchens That Value Pure Taste'}
                  </h3>
                  <p className="text-sm text-[#FBF7EE]/82 leading-[1.7]">
                    {isHi
                      ? 'चाहे गरम रोटी पर लगाना हो, दाल में तड़का देना हो या पूजा-पाठ के लिए — हमारे सभी देसी घी पैक शुद्धता के साथ तैयार हैं।'
                      : isHinglish
                        ? 'Chahe garam roti par lagana ho, dal mein tadka dena ho ya puja ke liye — hamare desi ghee packs har zaroorat ke liye ready hain.'
                        : 'Whether drizzled warm over rotis, tempered onto dals, or used in ceremonial offerings, choose from sealed 250g, 500g, and 1kg jars packed fresh at our Danapur kitchen.'}
                  </p>
                </div>

                <div className="relative z-10">
                  <Button
                    to="/shop/desi-ghee"
                    variant="primary"
                    size="md"
                    dark
                    rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
                  >
                    {isHi
                      ? 'सभी घी पैक देखें'
                      : isHinglish
                        ? 'Saare Ghee Packs Dekhein'
                        : 'Browse Ghee Variants'}
                  </Button>
                </div>
              </div>
            </Card>
          </Reveal>

          {/* Ghee Product Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
            {gheeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </Container>
    </SectionSurface>
  );
}
