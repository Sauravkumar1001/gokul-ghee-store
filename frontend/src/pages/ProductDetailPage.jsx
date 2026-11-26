import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  ExternalLink,
  Heart,
  Info,
  Lock,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Zap,
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../data/sampleCatalog';
import { STORE_CONFIG } from '../config/storeConfig';
import { formatINR, getDiscountPercent } from '../utils/formatters';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { analyticsService } from '../services/analyticsService';
import { catalogService } from '../services/catalogService';
import PincodeCheckerCard from '../components/checkout/PincodeCheckerCard';
import ProductGallery from '../components/product/ProductGallery';
import ProductAccordions from '../components/product/ProductAccordions';
import FrequentlyBoughtTogether from '../components/product/FrequentlyBoughtTogether';
import ProductGrid from '../components/product/ProductGrid';
import RecentlyViewedSection from '../components/product/RecentlyViewedSection';
import {
  Badge,
  Button,
  Card,
  Container,
  SectionHeading,
  SectionSurface,
} from '../components/ui';
import { useLanguage } from '../context/LanguageContext';

function cleanCustomerLabel(raw = '') {
  return String(raw)
    .replace(/\s*\(Sample\)\s*/gi, ' ')
    .replace(/\bSample\s+/gi, '')
    .replace(/\s+Sample\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language, t, categoryLabel } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  const seedProduct = SAMPLE_PRODUCTS.find((item) => item.slug === slug) || null;
  const [product, setProduct] = useState(seedProduct);
  const [reviews, setReviews] = useState([]);
  const [apiRelatedProducts, setApiRelatedProducts] = useState([]);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartFeedback, setCartFeedback] = useState('');

  const { visibleSlugs, recordView } = useRecentlyViewed(slug);
  const { addItem, pincode, setPincode, setDrawerOpen } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    let active = true;
    const initialSeed = SAMPLE_PRODUCTS.find((item) => item.slug === slug) || null;
    setProduct(initialSeed);
    setReviews([]);
    setApiRelatedProducts([]);
    setSelectedVariantIndex(0);
    setQuantity(1);
    setCartFeedback('');

    if (initialSeed) {
      recordView(initialSeed.slug);
    }

    if (import.meta.env.MODE === 'test' || !slug) {
      return () => {
        active = false;
      };
    }

    catalogService
      .fetchProductBySlug(slug)
      .then((result) => {
        if (!active || !result) return;
        if (result.product) {
          setProduct(result.product);
          recordView(result.product.slug);
          analyticsService.trackEvent({
            eventType: 'PRODUCT_VIEW',
            productId: result.product._id || null,
            metadata: { slug: result.product.slug, name: result.product.name },
          });
        } else if (result.source === 'api') {
          setProduct(null);
        }
        setReviews(Array.isArray(result.reviews) ? result.reviews : []);
        setApiRelatedProducts(
          Array.isArray(result.relatedProducts) ? result.relatedProducts : []
        );
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [slug, recordView]);

  if (!product) {
    return (
      <SectionSurface tone="cream" className="min-h-[65vh] flex items-center">
        <Container size="narrow" className="text-center space-y-5">
          <h1 className="gg-h1 text-[#0F3D2E]">
            {isHi ? 'उत्पाद उपलब्ध नहीं है' : 'Product Not Found'}
          </h1>
          <p className="gg-body text-[#5A554C]">
            {isHi
              ? 'यह उत्पाद वर्तमान संग्रह में नहीं मिला।'
              : 'The requested item could not be located in the current catalog.'}
          </p>
          <Button to="/shop" variant="primary" size="md">
            {isHi ? 'दुकान पर वापस जाएं' : 'Return to Shop'}
          </Button>
        </Container>
      </SectionSurface>
    );
  }

  const productId = product.id || product._id;
  const activeVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const discount = getDiscountPercent(activeVariant.mrp, activeVariant.price);
  const rawName = isHi && product.nameHi ? product.nameHi : product.name;
  const displayName = cleanCustomerLabel(rawName);
  const displayDescription = product.shortDescription || product.description;
  const wishlisted = isWishlisted(product.slug);

  const ratingScore =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length
        ).toFixed(1)
      : STORE_CONFIG.googleRating.score.toFixed(1);

  const relatedProducts =
    apiRelatedProducts.length > 0
      ? apiRelatedProducts.slice(0, 3)
      : SAMPLE_PRODUCTS.filter(
          (item) =>
            (item.id || item._id) !== productId && item.categorySlug === product.categorySlug
        )
          .concat(
            SAMPLE_PRODUCTS.filter(
              (item) =>
                (item.id || item._id) !== productId &&
                item.categorySlug !== product.categorySlug
            )
          )
          .slice(0, 3);

  const handleAddToCart = () => {
    addItem(product, activeVariant, quantity);
    setCartFeedback(
      `Added ${quantity} × ${product.name} (${activeVariant.label}) to your Cart.`
    );
  };

  const handleBuyNow = () => {
    addItem(product, activeVariant, quantity);
    setDrawerOpen(false);
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.slug);
    setCartFeedback(
      wishlisted
        ? `Removed ${displayName} from your Wishlist.`
        : `Saved ${displayName} to your Wishlist.`
    );
  };

  return (
    <div className="bg-[#FBF7EE] pb-20 lg:pb-0">
      <SectionSurface tone="cream" padding="compact">
        <Container className="space-y-6 sm:space-y-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-[#5A554C] flex flex-wrap items-center gap-2"
          >
            <Link to="/" className="hover:text-[#0F3D2E] transition-colors">
              {t('nav.home')}
            </Link>
            <span aria-hidden="true" className="text-[#C9A24B]">/</span>
            <Link to="/shop" className="hover:text-[#0F3D2E] transition-colors">
              {t('nav.shop')}
            </Link>
            <span aria-hidden="true" className="text-[#C9A24B]">/</span>
            <Link
              to={`/shop/${product.categorySlug}`}
              className="hover:text-[#0F3D2E] transition-colors"
            >
              {categoryLabel(product.categorySlug, product.categoryName)}
            </Link>
            <span aria-hidden="true" className="text-[#C9A24B]">/</span>
            <span className="text-[#0F3D2E] font-semibold truncate max-w-[200px] sm:max-w-none">
              {displayName}
            </span>
          </nav>

          {/* Primary Product Split: Left Gallery + Right Sticky Buy Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-6 space-y-6">
              <ProductGallery
                key={product.slug}
                images={product.images}
                productName={displayName}
                sampleLabel={
                  STORE_CONFIG.showSampleBadge && product.isSampleData ? t('common.sampleTag') : ''
                }
              />

              {/* Accordions on desktop below gallery for balanced vertical rhythm */}
              <div className="hidden lg:block">
                <ProductAccordions product={product} />
              </div>
            </div>

            {/* Sticky Buy Box Column */}
            <div className="lg:col-span-6 lg:sticky lg:top-24 self-start space-y-5">
              <Card variant="elevated" radius="xl" padding="lg" className="space-y-5 border-[#C9A24B]/30">
                {/* Category Eyebrow + Subtle Tag + Rating */}
                <div className="space-y-3 border-b border-[#0F3D2E]/10 pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/shop/${product.categorySlug}`}
                        className="gg-eyebrow text-[#9C7725] hover:text-[#0F3D2E] transition-colors"
                      >
                        {categoryLabel(product.categorySlug, product.categoryName)}
                      </Link>
                    </div>

                    <a
                      href="#product-reviews"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F3D2E] hover:text-[#9C7725] transition-colors"
                    >
                      <span className="inline-flex items-center gap-0.5 text-[#C9A24B]">
                        <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      </span>
                      <span className="tabular-nums">{ratingScore}</span>
                      <span className="text-[#5A554C] font-normal">
                        ({reviews.length > 0 ? reviews.length : STORE_CONFIG.googleRating.reviewCount})
                      </span>
                    </a>
                  </div>

                  <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold text-[#0F3D2E] leading-[1.14]">
                    {displayName}
                  </h1>

                  <p className="text-sm sm:text-[15px] text-[#5A554C] leading-[1.65]">
                    {displayDescription}
                  </p>

                  {/* Price + Strike-through + % Off Pill */}
                  <div className="pt-1 flex flex-wrap items-center gap-3 tabular-nums">
                    <span className="text-3xl font-semibold text-[#0F3D2E]">
                      {formatINR(activeVariant.price)}
                    </span>
                    {activeVariant.mrp > activeVariant.price && (
                      <>
                        <span className="text-base text-[#7A7468] line-through">
                          {formatINR(activeVariant.mrp)}
                        </span>
                        <Badge variant="saffron-solid" size="md">
                          {isHi ? `${discount}% बचत` : `Save ${discount}%`}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Weight / Pack Selector Chips */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-[0.16em] text-[#0F3D2E]">
                      {language === 'en' ? 'Select Pack Size' : t('pages.product.selectPack')}
                    </span>
                    <span className="text-[#5A554C] font-medium tabular-nums">
                      {activeVariant.stock > 0
                        ? isHi
                          ? `${activeVariant.stock} पैक उपलब्ध`
                          : `${activeVariant.stock} packs available`
                        : t('common.outOfStock')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((variant, idx) => {
                      const selected = idx === selectedVariantIndex;
                      const cleanPackLabel = cleanCustomerLabel(variant.label);
                      return (
                        <button
                          key={variant.id || variant._id}
                          type="button"
                          aria-label={`${variant.label} (${formatINR(variant.price)})`}
                          aria-pressed={selected}
                          onClick={() => {
                            setSelectedVariantIndex(idx);
                            setQuantity(1);
                          }}
                          className={`px-4 py-2.5 rounded-[14px] border text-xs sm:text-sm transition-all tabular-nums cursor-pointer ${
                            selected
                              ? 'bg-[#0F3D2E] text-[#FBF7EE] border-[#0F3D2E] font-semibold ring-2 ring-[#C9A24B]/45'
                              : 'bg-[#FBF7EE] text-[#1B1B1B] border-[#0F3D2E]/18 hover:border-[#C9A24B]'
                          }`}
                        >
                          <span>{cleanPackLabel}</span>
                          <span className="ml-2 text-xs opacity-80">
                            {formatINR(variant.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity Stepper + Gold Add to Cart + Buy Now + Wishlist */}
                <div className="space-y-3.5 pt-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center border border-[#0F3D2E]/20 rounded-full bg-[#FBF7EE]">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="w-10 h-11 inline-flex items-center justify-center text-[#0F3D2E] hover:bg-[#F3EAD7] rounded-l-full transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-[#0F3D2E] tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(activeVariant.stock || 10, q + 1))
                        }
                        aria-label="Increase quantity"
                        className="w-10 h-11 inline-flex items-center justify-center text-[#0F3D2E] hover:bg-[#F3EAD7] rounded-r-full transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={handleAddToCart}
                      leftIcon={<ShoppingBag className="w-4 h-4" aria-hidden="true" />}
                      className="flex-1 min-w-[190px]"
                    >
                      {t('pages.product.addToCart')} • {formatINR(activeVariant.price * quantity)}
                    </Button>

                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      aria-label={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      aria-pressed={wishlisted}
                      className={`w-12 h-12 rounded-full border inline-flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        wishlisted
                          ? 'bg-[#0F3D2E] text-[#E8D08B] border-[#C9A24B]'
                          : 'border-[#0F3D2E]/20 bg-[#FBF7EE] text-[#0F3D2E] hover:border-[#C9A24B]'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="forest"
                    size="md"
                    fullWidth
                    onClick={handleBuyNow}
                    leftIcon={<Zap className="w-4 h-4 text-[#E8D08B]" aria-hidden="true" />}
                  >
                    {isHi ? 'अभी खरीदें (चेकआउट)' : isHinglish ? 'Abhi Khareedein' : 'Buy Now'}
                  </Button>

                  {cartFeedback && (
                    <div
                      role="status"
                      className="rounded-[14px] bg-[#E9F3EC] border border-[#0F3D2E]/20 px-4 py-3 text-xs text-[#0F3D2E] flex items-start gap-2 font-medium"
                    >
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#9C7725]" />
                      <span>{cartFeedback}</span>
                    </div>
                  )}
                </div>

                {/* Local Delivery Pincode Checker */}
                <PincodeCheckerCard
                  compact
                  pincode={pincode}
                  subtotal={activeVariant.price * quantity}
                  onPincodeResolved={(pin) => setPincode(pin)}
                />

                {/* Ghee Usage & Purity Quick Guide Pill */}
                {(product?.categorySlug === 'desi-ghee' || product?.slug?.includes('ghee')) && (
                  <Link
                    to="/ghee-meter"
                    className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#155742] to-[#0A2B20] border border-[#C9A24B]/40 text-[#FBF7EE] shadow-sm hover:border-[#E8D08B] transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#E8D08B] text-[#0A261B] flex items-center justify-center font-bold text-xs shrink-0">
                        ⚖️
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#E8D08B] leading-tight">
                          {isHi ? 'कितना घी लगेगा? स्मार्ट कैलकुलेटर' : 'How Much Ghee Do You Need?'}
                        </p>
                        <p className="text-[11px] text-[#FBF7EE]/80">
                          {isHi ? 'परिवार व पूजा अनुसार गणना + 4 शुद्धता टेस्ट' : 'Calculate family quota & test purity at home'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#E8D08B] group-hover:translate-x-1 transition-transform shrink-0" />
                  </Link>
                )}

                {/* Trust Row */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#0F3D2E]/10">
                  <div className="rounded-[14px] bg-[#FBF7EE] border border-[#E6DEC9] px-2.5 py-2.5 text-center space-y-1">
                    <Award className="w-4 h-4 text-[#9C7725] mx-auto" aria-hidden="true" />
                    <p className="text-[11px] font-semibold text-[#0F3D2E] leading-tight">
                      {isHi ? 'FSSAI मानक' : 'FSSAI Standard'}
                    </p>
                  </div>
                  <div className="rounded-[14px] bg-[#FBF7EE] border border-[#E6DEC9] px-2.5 py-2.5 text-center space-y-1">
                    <PackageCheck className="w-4 h-4 text-[#9C7725] mx-auto" aria-hidden="true" />
                    <p className="text-[11px] font-semibold text-[#0F3D2E] leading-tight">
                      {isHi ? 'ताज़ा बैच पैक्ड' : 'Batch-Packed Fresh'}
                    </p>
                  </div>
                  <div className="rounded-[14px] bg-[#FBF7EE] border border-[#E6DEC9] px-2.5 py-2.5 text-center space-y-1">
                    <Lock className="w-4 h-4 text-[#9C7725] mx-auto" aria-hidden="true" />
                    <p className="text-[11px] font-semibold text-[#0F3D2E] leading-tight">
                      {isHi ? 'सुरक्षित भुगतान' : 'Secure Payment'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Accordions on mobile/tablet right after Buy Box */}
              <div className="lg:hidden">
                <ProductAccordions product={product} />
              </div>
            </div>
          </div>
        </Container>
      </SectionSurface>

      {/* Frequently Bought Together */}
      <FrequentlyBoughtTogether
        key={product.slug}
        currentProduct={product}
        activeVariant={activeVariant}
      />

      {/* Verified Product Reviews */}
      <SectionSurface id="product-reviews" tone="white" padding="compact" className="border-t border-[#E6DEC9]">
        <Container>
          <Card
            variant="sand"
            radius="xl"
            padding="lg"
            className="border-[#C9A24B]/35 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 gg-eyebrow text-[#9C7725]">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>{isHi ? 'सत्यापित ग्राहक समीक्षाएं' : 'Verified Product Reviews'}</span>
                </div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#0F3D2E]">
                  {isHi
                    ? 'ग्राहक प्रतिक्रिया (केवल सत्यापित ऑर्डर)'
                    : 'Customer Feedback (Verified Orders Only)'}
                </h2>
              </div>

              <Button
                href={STORE_CONFIG.googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="sm"
                rightIcon={<ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                {isHi ? 'Google समीक्षाएं देखें' : 'Check Store Google Reviews'}
              </Button>
            </div>

            {reviews.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-4 rounded-[16px] border border-[#E6DEC9] bg-[#FFFDF8] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-[#5A554C]">
                      <span className="font-semibold text-[#0F3D2E]">
                        {review.user?.name || 'Verified Customer'}
                      </span>
                      <span className="font-semibold text-[#9C7725] tabular-nums">
                        {review.rating} / 5 ★
                      </span>
                    </div>
                    {review.title && (
                      <p className="text-sm font-semibold text-[#0F3D2E]">{review.title}</p>
                    )}
                    <p className="text-sm text-[#5A554C] leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#5A554C] leading-relaxed">
                {isHi
                  ? `हम नकली समीक्षाएं नहीं दिखाते। आप ${STORE_CONFIG.googleRating.reviewCount} वास्तविक ग्राहक रेटिंग हमारी Google Business प्रोफ़ाइल पर देख सकते हैं।`
                  : `We only display authentic reviews from verified deliveries alongside our ${STORE_CONFIG.googleRating.score.toFixed(
                      1
                    )} ★ (${STORE_CONFIG.googleRating.reviewCount}) neighborhood rating on Google Business.`}
              </p>
            )}
          </Card>
        </Container>
      </SectionSurface>

      {/* You May Also Like */}
      <SectionSurface tone="white" padding="compact" className="border-t border-[#E6DEC9]">
        <Container className="space-y-9">
          <SectionHeading
            variant="centered"
            eyebrow={isHi ? 'यह भी पसंद आएगा' : 'You May Also Like'}
            title={isHi ? 'संबंधित गोकुल घी संग्रह' : 'Related Gokul Ghee Selections'}
            actionLabel={isHi ? 'पूरा कैटलॉग देखें' : 'Explore Full Catalog'}
            actionTo="/shop"
          />
          <ProductGrid products={relatedProducts} columns={3} />
        </Container>
      </SectionSurface>

      {/* Recently Viewed Products */}
      <RecentlyViewedSection slugs={visibleSlugs} />

      {/* Mobile Sticky Bottom Add to Cart Bar (elevated floating buttons sit above at bottom-[76px]) */}
      <div
        aria-label="Mobile quick purchase bar"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFFDF8]/96 backdrop-blur-xl border-t border-[#C9A24B]/40 px-4 py-2.5 gg-shadow-elevated"
      >
        <div className="flex items-center justify-between gap-3 max-w-xl mx-auto">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0F3D2E] truncate">{displayName}</p>
            <p className="text-sm font-bold text-[#0F3D2E] tabular-nums">
              {formatINR(activeVariant.price * quantity)}
              <span className="ml-1.5 text-[11px] font-medium text-[#5A554C]">
                ({cleanCustomerLabel(activeVariant.label)})
              </span>
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            aria-label={`Quick add ${displayName} (${formatINR(activeVariant.price * quantity)})`}
            leftIcon={<ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />}
            className="shrink-0 whitespace-nowrap"
          >
            {isHi ? 'कार्ट में जोड़ें' : isHinglish ? 'Cart Mein Dalein' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}
