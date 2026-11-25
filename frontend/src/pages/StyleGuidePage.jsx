import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Flame,
  Heart,
  Mail,
  MapPin,
  Search,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import {
  Badge,
  Button,
  Card,
  Container,
  FadeUp,
  Input,
  JaaliPattern,
  ProductCardSkeleton,
  Reveal,
  SectionHeading,
  SectionSurface,
  StaggerGroup,
  StaggerItem,
  TextBlockSkeleton,
  Textarea,
} from '../components/ui';
import { useLanguage } from '../context/LanguageContext';

const COLOR_TOKENS = [
  {
    name: 'Deep Forest Green',
    token: '--color-forest',
    hex: '#0F3D2E',
    role: 'Primary brand surface & dark ink',
    lightText: true,
  },
  {
    name: 'Emerald Hover',
    token: '--color-emerald',
    hex: '#155742',
    role: 'Interactive hover & secondary depth',
    lightText: true,
  },
  {
    name: 'Warm Gold',
    token: '--color-gold',
    hex: '#C9A24B',
    role: 'Primary CTA highlight & brass trim',
    lightText: false,
  },
  {
    name: 'Ivory Cream',
    token: '--gg-surface-cream',
    hex: '#FBF7EE',
    role: 'Default archival canvas background',
    lightText: false,
  },
  {
    name: 'Soft Sand',
    token: '--gg-surface-sand',
    hex: '#F3EAD7',
    role: 'Alternating warm editorial band',
    lightText: false,
  },
  {
    name: 'Warm White',
    token: '--gg-surface-white',
    hex: '#FFFFFF',
    role: 'Clean high-contrast product band',
    lightText: false,
  },
  {
    name: 'Saffron Offer',
    token: '--color-saffron',
    hex: '#D96B27',
    role: 'Festive offer pills & scarcity cues',
    lightText: true,
  },
  {
    name: 'Charcoal Ink',
    token: '--color-charcoal',
    hex: '#1B1B1B',
    role: 'Primary readable body ink',
    lightText: true,
  },
];

const SPACING_STEPS = [
  { label: '1 unit (8px)', px: '8px', widthClass: 'w-2' },
  { label: '2 units (16px)', px: '16px', widthClass: 'w-4' },
  { label: '3 units (24px)', px: '24px', widthClass: 'w-6' },
  { label: '4 units (32px)', px: '32px', widthClass: 'w-8' },
  { label: '6 units (48px)', px: '48px', widthClass: 'w-12' },
  { label: '7 units (56px mobile section)', px: '56px', widthClass: 'w-14' },
  { label: '12 units (96px desktop section)', px: '96px', widthClass: 'w-24' },
  { label: '14 units (112px hero/editorial)', px: '112px', widthClass: 'w-28' },
];

export default function StyleGuidePage() {
  const { language, setLanguage } = useLanguage();
  const prefersReduced = useReducedMotion();
  const [motionKey, setMotionKey] = useState(0);
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);
  const [sampleEmail, setSampleEmail] = useState('');
  const [showSkeletonPreview, setShowSkeletonPreview] = useState(true);

  const handleLoadingDemo = () => {
    setIsLoadingBtn(true);
    window.setTimeout(() => setIsLoadingBtn(false), 1200);
  };

  return (
    <div className="min-h-screen">
      {/* 1. Hero Header — Deep Forest Green + Jaali Mandala + Grain */}
      <SectionSurface tone="green" spacing="hero" withGrain withJaali>
        <JaaliPattern
          variant="mandala"
          opacity={0.06}
          className="hidden md:block absolute -right-24 -top-20 w-[420px] h-[420px]"
        />

        <Container>
          <FadeUp inView={false} className="max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="outline" size="md" dot>
                Phase 1 Design System
              </Badge>
              <Badge variant="saffron-solid" size="md" icon={<Flame className="w-3 h-3" />}>
                D2C Editorial System
              </Badge>
            </div>

            <h1 className="gg-display text-[#FBF7EE]">
              Anil Ji Ka Gokul Ghee — Visual Language &amp; Tokens
            </h1>

            <p className="gg-body text-[#FBF7EE]/85 max-w-2xl">
              Crafted on an 8px spacing rhythm pairing deep forest green, warm gold gradients,
              archival ivory surfaces, fluid Cormorant Garamond headings, and automatic
              Devanagari typography when Hindi is active.
            </p>

            {/* Quick Language Switcher Specimen inside Style Guide */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  const el = document.getElementById('sg-components');
                  el?.scrollIntoView?.({ behavior: 'smooth' });
                }}
              >
                Explore Components
              </Button>
              <Button variant="secondary" dark size="lg" to="/shop">
                Return to Storefront
              </Button>
            </div>

            <div className="pt-4 border-t border-[#C9A24B]/20 flex flex-wrap items-center gap-3 text-xs text-[#E8D08B]">
              <span className="uppercase tracking-[0.18em] font-semibold">
                Test Live Typography Mode:
              </span>
              {(['en', 'hi', 'hinglish']).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                    language === code
                      ? 'bg-[#C9A24B] text-[#0F3D2E] border-[#C9A24B] font-semibold'
                      : 'border-[#C9A24B]/40 text-[#FBF7EE] hover:border-[#C9A24B]'
                  }`}
                >
                  {code === 'en' ? 'English' : code === 'hi' ? 'हिन्दी (Devanagari)' : 'Hinglish'}
                </button>
              ))}
            </div>
          </FadeUp>
        </Container>
      </SectionSurface>

      {/* 2. Palette & Alternating Section Surfaces — Cream Canvas */}
      <SectionSurface tone="cream" withGrain>
        <Container className="space-y-12">
          <SectionHeading
            variant="split"
            eyebrow="01 • Color Architecture"
            title="Heritage Forest, Warm Gold & Four Alternating Surfaces"
            subtitle="Designed so sections alternate rhythmically across cream, crisp white, soft sand, and deep jaali green without visual fatigue."
          />

          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COLOR_TOKENS.map((swatch) => (
              <StaggerItem key={swatch.hex}>
                <Card padding="none" radius="md" className="overflow-hidden">
                  <div
                    className={`h-28 p-4 flex flex-col justify-between ${
                      swatch.lightText ? 'text-[#FBF7EE]' : 'text-[#1B1B1B]'
                    } border-b border-[#0F3D2E]/10`}
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <span className="text-[11px] font-mono opacity-85">{swatch.token}</span>
                    <span className="text-lg font-semibold tracking-wide font-mono">
                      {swatch.hex}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="font-editorial text-xl font-semibold text-[#0F3D2E]">
                      {swatch.name}
                    </p>
                    <p className="text-xs text-[#5A554C] leading-relaxed">{swatch.role}</p>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {/* Gold Gradient & Surface Alternation Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-[16px] p-5 bg-[#FBF7EE] border border-[#0F3D2E]/12 space-y-1">
              <span className="gg-eyebrow text-[#9C7725]">Surface 01</span>
              <p className="font-editorial text-xl font-semibold text-[#0F3D2E]">Cream (#FBF7EE)</p>
              <p className="text-xs text-[#5A554C]">Primary editorial canvas</p>
            </div>
            <div className="rounded-[16px] p-5 bg-white border border-[#0F3D2E]/12 space-y-1">
              <span className="gg-eyebrow text-[#9C7725]">Surface 02</span>
              <p className="font-editorial text-xl font-semibold text-[#0F3D2E]">White (#FFFFFF)</p>
              <p className="text-xs text-[#5A554C]">Clean catalog clarity</p>
            </div>
            <div className="rounded-[16px] p-5 bg-[#F3EAD7] border border-[#0F3D2E]/12 space-y-1">
              <span className="gg-eyebrow text-[#9C7725]">Surface 03</span>
              <p className="font-editorial text-xl font-semibold text-[#0F3D2E]">Soft Sand (#F3EAD7)</p>
              <p className="text-xs text-[#5A554C]">Warm story & trust highlight</p>
            </div>
            <div className="rounded-[16px] p-5 bg-[#0F3D2E] gg-jaali-pattern text-[#FBF7EE] border border-[#C9A24B]/30 space-y-1">
              <span className="gg-eyebrow text-[#E8D08B]">Surface 04</span>
              <p className="font-editorial text-xl font-semibold">Deep Green + Jaali</p>
              <p className="text-xs text-[#FBF7EE]/75">Hero, commitments & footer</p>
            </div>
          </div>
        </Container>
      </SectionSurface>

      {/* 3. Fluid Typography & Devanagari Pairing — Warm White */}
      <SectionSurface tone="white">
        <Container className="space-y-10">
          <SectionHeading
            variant="editorial"
            eyebrow="02 • Typography"
            title="Cormorant Garamond × Plus Jakarta Sans × Devanagari"
            subtitle="Fluid clamp() headings keep tight 1.06–1.20 leading, body copy stays airy at 1.7, and Hindi mode automatically shifts to Tiro Devanagari Hindi & Noto Sans Devanagari."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card variant="elevated" radius="lg" padding="lg" className="lg:col-span-7 space-y-6">
              <div className="space-y-1.5 pb-5 border-b border-[#0F3D2E]/10">
                <span className="gg-eyebrow text-[#9C7725]">Display • .gg-display</span>
                <p className="gg-display text-[#0F3D2E]">Tradition in Every Taste.</p>
              </div>
              <div className="space-y-1.5 pb-5 border-b border-[#0F3D2E]/10">
                <span className="gg-eyebrow text-[#9C7725]">Heading 1 • .gg-h1</span>
                <h1 className="gg-h1 text-[#0F3D2E]">Slow-Churned Bilona Cow Ghee</h1>
              </div>
              <div className="space-y-1.5 pb-5 border-b border-[#0F3D2E]/10">
                <span className="gg-eyebrow text-[#9C7725]">Heading 2 • .gg-h2</span>
                <h2 className="gg-h2 text-[#0F3D2E]">Handcrafted Mithai &amp; Savory Snacks</h2>
              </div>
              <div className="space-y-2">
                <span className="gg-eyebrow text-[#9C7725]">Body • 1.7 Line Height</span>
                <p className="gg-body text-[#5A554C]">
                  Every glass jar is simmered patiently over gentle heat in our Anand Bazar
                  kitchen, locking in unmistakable danedar aroma and rich nutty warmth for your
                  family table.
                </p>
              </div>
            </Card>

            <Card variant="green" radius="lg" padding="lg" className="lg:col-span-5 space-y-6">
              <Badge variant="outline" dot>
                Devanagari Pairing Specimen
              </Badge>
              <div className="space-y-3" lang="hi">
                <h3
                  className="text-3xl sm:text-4xl font-semibold text-[#FBF7EE]"
                  style={{ fontFamily: 'var(--font-devanagari-serif)', lineHeight: 1.28 }}
                >
                  हर चम्मच में शुद्धता। हर स्वाद में परंपरा।
                </h3>
                <p
                  className="text-sm sm:text-base text-[#FBF7EE]/85"
                  style={{ fontFamily: 'var(--font-devanagari-sans)', lineHeight: 1.78 }}
                >
                  आनंद बाजार, दानापुर कैंटोनमेंट की हमारी पारंपरिक रसोई में रोज़ाना ताज़ा बने शुद्ध
                  बिलोना देसी घी, खोया मिठाई और कुरकुरे समोसे का असली स्वाद पाएं।
                </p>
              </div>
              <div className="pt-4 border-t border-[#C9A24B]/20 text-xs text-[#E8D08B] space-y-1">
                <p>
                  Active Document Language:{' '}
                  <strong className="text-[#FBF7EE] uppercase">{language}</strong>
                </p>
                <p className="text-[#FBF7EE]/70">
                  Automatic CSS rules apply Tiro Devanagari Hindi + Noto Sans Devanagari whenever
                  language switches to <code className="text-[#E8D08B]">hi</code>.
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </SectionSurface>

      {/* 4. Spacing, Radii, Shadows & Heritage Textures — Soft Sand */}
      <SectionSurface tone="sand" withGrain>
        <Container className="space-y-12">
          <SectionHeading
            variant="centered"
            eyebrow="03 • Elevation, Radii & Spacing"
            title="8px Rhythm, 16–24px Radii & Layered Depth"
            subtitle="Generous whitespace (56px mobile / 96–112px desktop sections) paired with tactile paper grain and subtle shadow tiers."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="white" radius="lg" padding="lg" className="space-y-4">
              <h3 className="gg-h3 text-[#0F3D2E]">8px Spacing Grid</h3>
              <div className="space-y-3">
                {SPACING_STEPS.map((step) => (
                  <div key={step.label} className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-[#5A554C] font-medium">{step.label}</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-3 rounded-full bg-[#0F3D2E] ${step.widthClass}`}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-[#0F3D2E] w-11 text-right">{step.px}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-[16px] bg-[#FFFDF8] p-6 border border-[#0F3D2E]/10 gg-shadow-sm flex flex-col justify-between min-h-[150px]">
                <Badge variant="cream">16px Radius</Badge>
                <div>
                  <p className="font-editorial text-xl font-semibold text-[#0F3D2E]">
                    Standard Card
                  </p>
                  <p className="text-xs text-[#5A554C]">Subtle elevation • gg-shadow-sm</p>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#FFFDF8] p-6 border border-[#C9A24B]/30 gg-shadow-card flex flex-col justify-between min-h-[150px]">
                <Badge variant="gold">20px Radius</Badge>
                <div>
                  <p className="font-editorial text-xl font-semibold text-[#0F3D2E]">
                    Featured Card
                  </p>
                  <p className="text-xs text-[#5A554C]">Layered ambient • gg-shadow-card</p>
                </div>
              </div>

              <div className="sm:col-span-2 rounded-[24px] bg-[#0F3D2E] gg-jaali-pattern text-[#FBF7EE] p-6 border border-[#C9A24B]/35 gg-shadow-elevated flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <Badge variant="outline">24px Radius • Hero &amp; Jaali</Badge>
                  <p className="font-editorial text-2xl font-semibold">
                    Indian Jaali Lattice Overlay (5.5% Opacity)
                  </p>
                  <p className="text-xs text-[#FBF7EE]/75">
                    Pure inline vector pattern — zero network lag, crisp at 1x and 3x retina.
                  </p>
                </div>
                <JaaliPattern variant="mandala" opacity={0.35} className="w-20 h-20 shrink-0" />
              </div>
            </div>
          </div>
        </Container>
      </SectionSurface>

      {/* 5. Reusable Component Library — Cream */}
      <SectionSurface tone="cream" id="sg-components">
        <Container className="space-y-14">
          <SectionHeading
            variant="minimal"
            eyebrow="04 • Component Primitives"
            title="Buttons, Badges, Inputs, Section Headings & Skeletons"
            subtitle="Built for effortless thumb reach on 360px phones and crisp precision on 1920px displays."
          />

          {/* Buttons & Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card variant="elevated" radius="lg" padding="lg" className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <h3 className="gg-h3 text-[#0F3D2E]">Button Variants &amp; Sizes</h3>
                <p className="text-xs text-[#5A554C]">
                  Minimum 44px mobile touch height on primary controls, subtle gold gradient for
                  conversion CTAs.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Primary Gold CTA
                </Button>
                <Button variant="forest" leftIcon={<ShoppingBag className="w-4 h-4" />}>
                  Add to Cart
                </Button>
                <Button variant="saffron" leftIcon={<Flame className="w-4 h-4" />}>
                  Festive Offer
                </Button>
                <Button variant="secondary">Secondary Outline</Button>
                <Button variant="ghost" leftIcon={<Heart className="w-4 h-4" />}>
                  Save Wishlist
                </Button>
              </div>

              <div className="pt-3 border-t border-[#0F3D2E]/10 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">
                  Small (36px)
                </Button>
                <Button variant="primary" size="md">
                  Default (44px)
                </Button>
                <Button variant="primary" size="lg">
                  Large Hero (50px)
                </Button>
                <Button variant="forest" loading={isLoadingBtn} onClick={handleLoadingDemo}>
                  {isLoadingBtn ? 'Processing...' : 'Test Loading State'}
                </Button>
              </div>

              <div className="rounded-[16px] bg-[#0F3D2E] p-4 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">
                  Gold on Green
                </Button>
                <Button variant="secondary" dark size="sm">
                  Light Outline
                </Button>
                <Button variant="ghost" dark size="sm">
                  Ghost on Green
                </Button>
              </div>
            </Card>

            <Card variant="elevated" radius="lg" padding="lg" className="lg:col-span-5 space-y-6">
              <div className="space-y-1">
                <h3 className="gg-h3 text-[#0F3D2E]">Badges &amp; Offer Accents</h3>
                <p className="text-xs text-[#5A554C]">
                  Warm saffron &amp; terracotta accents draw attention to festive batches and offers.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Badge variant="gold" dot>
                  Slow-Churned Bilona
                </Badge>
                <Badge variant="gold-solid" icon={<Sparkles className="w-3 h-3" />}>
                  Bestseller
                </Badge>
                <Badge variant="forest" icon={<Check className="w-3 h-3" />}>
                  Same-Day Dispatch
                </Badge>
                <Badge variant="saffron" icon={<Flame className="w-3 h-3" />}>
                  Save ₹120 Festive Pack
                </Badge>
                <Badge variant="saffron-solid">Limited Diwali Batch</Badge>
                <Badge variant="cream">500ml Glass Jar</Badge>
              </div>

              <div className="rounded-[16px] bg-[#0F3D2E] p-4 flex flex-wrap gap-2.5">
                <Badge variant="outline" dot>
                  Danapur Cantonment
                </Badge>
                <Badge variant="gold-solid">100% Pure Cow Ghee</Badge>
              </div>
            </Card>
          </div>

          {/* SectionHeading 4 Variations */}
          <Card variant="white" radius="xl" padding="lg" className="space-y-10">
            <div className="space-y-1 border-b border-[#0F3D2E]/10 pb-4">
              <h3 className="gg-h3 text-[#0F3D2E]">SectionHeading Variations (4 Patterns)</h3>
              <p className="text-xs text-[#5A554C]">
                Prevents every section on the storefront from looking structurally identical.
              </p>
            </div>

            <div className="space-y-10 divide-y divide-[#0F3D2E]/10">
              <SectionHeading
                variant="editorial"
                eyebrow="Variation 01 • Editorial"
                title="Pure Ghee Craftsmanship"
                subtitle="Left-aligned serif hierarchy paired with a right-aligned View All pill CTA."
                actionLabel="View All"
                actionTo="/shop"
              />

              <div className="pt-8">
                <SectionHeading
                  variant="centered"
                  eyebrow="Variation 02 • Centered Ornamental"
                  title="Why Danapur Families Trust Us"
                  subtitle="Centered serif stack anchored by a delicate gold diamond ornament."
                />
              </div>

              <div className="pt-8">
                <SectionHeading
                  variant="split"
                  eyebrow="Variation 03 • Asymmetric Split"
                  title="Handcrafted Mithai for Weddings & Festivals"
                  subtitle="Split 12-column arrangement balancing bold editorial headlines against concise narrative context."
                  actionLabel="Explore Gift Boxes"
                  actionTo="/shop/special-combos"
                />
              </div>

              <div className="pt-8">
                <SectionHeading
                  variant="minimal"
                  eyebrow="Variation 04 • Minimal Rail"
                  title="Recently Viewed Delicacies"
                  subtitle="Compact hairline accent ideal for product carousels."
                />
              </div>
            </div>
          </Card>

          {/* Inputs & Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card variant="elevated" radius="lg" padding="lg" className="lg:col-span-6 space-y-5">
              <h3 className="gg-h3 text-[#0F3D2E]">Accessible Inputs</h3>
              <Input
                label="Search Catalog"
                placeholder="Search Bilona ghee, kaju katli, samosa..."
                leftIcon={<Search className="w-4 h-4" />}
              />
              <Input
                label="Newsletter Email"
                type="email"
                value={sampleEmail}
                onChange={(e) => setSampleEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                hint="Receive Diwali, Holi & Chhath fresh batch reminders."
              />
              <Input
                label="Delivery Pincode (Error State)"
                defaultValue="999999"
                leftIcon={<MapPin className="w-4 h-4" />}
                error="We currently deliver only to verified Danapur & Patna pincodes."
              />
              <Textarea
                label="Gift Note (Optional)"
                rows={3}
                placeholder="Write a warm festive message for your hamper..."
              />
            </Card>

            <div className="lg:col-span-6 space-y-5">
              <Card variant="elevated" radius="lg" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="gg-h3 text-[#0F3D2E]">Loading Skeletons</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowSkeletonPreview((prev) => !prev)}
                  >
                    {showSkeletonPreview ? 'Show Text Skeleton' : 'Show Product Skeleton'}
                  </Button>
                </div>

                {showSkeletonPreview ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ProductCardSkeleton />
                    <ProductCardSkeleton className="hidden sm:block" />
                  </div>
                ) : (
                  <div className="space-y-5 py-4">
                    <TextBlockSkeleton lines={4} />
                    <TextBlockSkeleton lines={2} />
                  </div>
                )}
              </Card>

              {/* Framer Motion Interactive Showcase */}
              <Card variant="green" radius="lg" padding="lg" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="gg-h3 text-[#FBF7EE]">Framer Motion Helpers</h3>
                    <p className="text-xs text-[#FBF7EE]/75">
                      Reduced motion preference:{' '}
                      <strong className="text-[#E8D08B]">
                        {prefersReduced ? 'Reduced (Instant Opacity)' : 'Standard Smooth'}
                      </strong>
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setMotionKey((k) => k + 1)}
                  >
                    Replay Motion
                  </Button>
                </div>

                <StaggerGroup
                  key={motionKey}
                  inView={false}
                  staggerDelay={0.09}
                  className="grid grid-cols-3 gap-3 pt-1"
                >
                  {['FadeUp', 'StaggerItem', 'Reveal'].map((label) => (
                    <StaggerItem key={label}>
                      <div className="rounded-[12px] bg-[#0F3D2E] border border-[#C9A24B]/35 p-3 text-center">
                        <p className="text-xs font-semibold text-[#E8D08B]">{label}</p>
                        <p className="text-[11px] text-[#FBF7EE]/70 mt-0.5">0.5s ease</p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>

                <Reveal key={`rev-${motionKey}`} direction="left" className="text-xs text-[#FBF7EE]/80">
                  Smooth editorial entrance respecting system accessibility settings.
                </Reveal>
              </Card>
            </div>
          </div>
        </Container>
      </SectionSurface>
    </div>
  );
}
