import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { Badge, Button, Card } from '../ui';
import { STORE_CONFIG } from '../../config/storeConfig';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { getDiscountPercent, formatINR } from '../../utils/formatters';

function cleanCustomerLabel(raw = '') {
  return String(raw)
    .replace(/\s*\(Sample\)\s*/gi, ' ')
    .replace(/\bSample\s+/gi, '')
    .replace(/\s+Sample\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { language, t, categoryLabel } = useLanguage();

  if (!product) return null;

  const defaultVariant = product.variants?.[0];
  if (!defaultVariant) return null;

  const discount = getDiscountPercent(defaultVariant.mrp, defaultVariant.price);
  const wishlisted = isWishlisted(product.slug);

  const rawName = language === 'hi' && product.nameHi ? product.nameHi : product.name;
  const displayName = cleanCustomerLabel(rawName);
  const displayWeight = cleanCustomerLabel(defaultVariant.label);

  const displayShortDesc =
    language === 'hi' && (product.shortDescriptionHi || product.shortDescHi)
      ? product.shortDescriptionHi || product.shortDescHi
      : language === 'hinglish' && (product.shortDescriptionHinglish || product.shortDescHinglish)
        ? product.shortDescriptionHinglish || product.shortDescHinglish
        : product.shortDescription || product.shortDesc || '';

  const resolvedCategory = categoryLabel(product.categorySlug, product.categoryName);

  const cleanOfferBadge = cleanCustomerLabel(product.offerBadge || '');
  const subtleTagLabel = t('product.sampleTag');
  const bestsellerLabel = t('product.bestseller');
  const addLabel = t('product.add');
  const optionsLabel = t('product.options');
  const offLabel = t('product.off');

  const highlightBadge = cleanOfferBadge
    ? { label: cleanOfferBadge, variant: 'saffron-solid' }
    : product.isBestseller
      ? { label: bestsellerLabel, variant: 'forest' }
      : null;

  const showSampleChip = STORE_CONFIG.showSampleBadge && product.isSampleData;

  return (
    <Card
      as="article"
      variant="elevated"
      radius="md"
      padding="none"
      interactive
      className="group h-full flex flex-col overflow-hidden"
    >
      {/* Image Frame */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F3EAD7]">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images[0]}
            alt={displayName}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0F3D2E]/25 via-transparent to-transparent pointer-events-none"
          />
        </Link>

        {/* Single highlight badge top-left */}
        {highlightBadge && (
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 pointer-events-none">
            <Badge variant={highlightBadge.variant} size="sm" className="shadow-xs">
              {highlightBadge.label}
            </Badge>
          </div>
        )}

        {/* Tiny subtle corner chip bottom-left controlled via STORE_CONFIG.showSampleBadge */}
        {showSampleChip && (
          <span className="absolute bottom-2 left-2.5 sm:bottom-2.5 sm:left-3 pointer-events-none px-2 py-0.5 rounded-full bg-[#FBF7EE]/88 backdrop-blur-xs text-[#5A554C] text-[10px] font-medium tracking-wide">
            {subtleTagLabel}
          </span>
        )}

        {/* Wishlist Toggle */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-label={
            wishlisted ? `Remove ${displayName} from wishlist` : `Save ${displayName} to wishlist`
          }
          className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border backdrop-blur-xs transition-all duration-200 cursor-pointer ${
            wishlisted
              ? 'bg-[#0F3D2E] text-[#E8D08B] border-[#C9A24B]'
              : 'bg-[#FBF7EE]/92 text-[#1B1B1B] border-[#E6DEC9] hover:border-[#C9A24B] hover:text-[#0F3D2E]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-5 flex flex-col gap-2.5">
        {/* Category + Title + 1-2 line Description */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.12em] text-[#9A7624] font-semibold">
            <span className="truncate">{resolvedCategory}</span>
            <span className="text-[#5A554C] font-medium tabular-nums shrink-0">
              {displayWeight}
            </span>
          </div>

          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-editorial text-[15px] sm:text-[1.25rem] md:text-[1.32rem] leading-[1.24] font-semibold text-[#1B1B1B] group-hover:text-[#0F3D2E] transition-colors line-clamp-2">
              {displayName}
            </h3>
          </Link>

          {displayShortDesc && (
            <p className="text-[11.5px] sm:text-[13px] text-[#5A554C] leading-[1.45] line-clamp-2">
              {displayShortDesc}
            </p>
          )}
        </div>

        {/* Pack Chips immediately below description */}
        <div className="hidden sm:flex items-center justify-between gap-2 pt-0.5">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {product.variants.slice(0, 3).map((variant) => (
              <span
                key={variant.id || variant._id}
                className="px-2 py-0.5 rounded-full bg-[#F3EAD7]/70 border border-[#E6DEC9] text-[10px] font-medium text-[#5A554C] tabular-nums whitespace-nowrap"
              >
                {cleanCustomerLabel(variant.label)}
              </span>
            ))}
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#0F3D2E] hover:text-[#9A7624] transition-colors shrink-0 whitespace-nowrap"
          >
            <span>{optionsLabel}</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>

        {/* Single-row Price & Add CTA pinned cleanly at bottom */}
        <div className="mt-auto pt-3 border-t border-[#E6DEC9]/90 flex items-center justify-between gap-1.5 sm:gap-2 flex-nowrap">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-nowrap tabular-nums">
            <span className="text-sm sm:text-[1.0625rem] font-semibold text-[#0F3D2E] whitespace-nowrap">
              {formatINR(defaultVariant.price)}
            </span>
            {defaultVariant.mrp > defaultVariant.price && (
              <>
                <span className="hidden sm:inline text-[11px] text-[#7A7468] line-through whitespace-nowrap">
                  {formatINR(defaultVariant.mrp)}
                </span>
                <Badge
                  variant="saffron"
                  size="sm"
                  className="whitespace-nowrap shrink-0 text-[9px] sm:text-[10px] px-1.5 sm:px-2"
                >
                  {discount}
                  {offLabel}
                </Badge>
              </>
            )}
          </div>

          <Button
            variant="forest"
            size="sm"
            radius="pill"
            onClick={() => addItem(product, defaultVariant, 1)}
            leftIcon={<ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E8D08B]" />}
            className="shrink-0 whitespace-nowrap px-2.5 py-1 text-[11px] sm:px-3.5 sm:py-1.5 sm:text-xs"
          >
            {addLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
