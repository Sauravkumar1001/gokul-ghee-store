import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export default function WishlistPage() {
  const { wishlistProducts, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { language, t, categoryLabel } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  const handleMoveToCart = (product) => {
    const defaultVariant = product.variants[0];
    addItem(product, defaultVariant, 1);
    removeFromWishlist(product.slug);
  };

  return (
    <div className="min-h-[80vh] bg-[#FBF7EE] py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6DEC9] pb-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
              {isHi ? 'पसंदीदा संग्रह' : isHinglish ? 'Aapki Wishlist' : 'Saved Favorites'}
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#0F3D2E]">
              {language === 'en' ? 'Your Wishlist' : t('pages.wishlist.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A554C]">
              {wishlistProducts.length === 0
                ? isHi
                  ? 'आपकी विशलिस्ट अभी खाली है।'
                  : 'Your wishlist is currently empty.'
                : isHi
                  ? `${wishlistProducts.length} उत्पाद त्वरित ऑर्डर के लिए सहेजे गए हैं।`
                  : `${wishlistProducts.length} ${
                      wishlistProducts.length === 1 ? 'item' : 'items'
                    } saved for quick ordering.`}
            </p>
          </div>

          {wishlistProducts.length > 0 && (
            <Badge variant="gold" size="md">
              {wishlistProducts.length} Saved
            </Badge>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="rounded-[24px] border border-[#E6DEC9] bg-[#FFFDF8] py-16 px-6 text-center space-y-5 max-w-xl mx-auto gg-shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/40 flex items-center justify-center mx-auto text-[#0F3D2E]">
              <Heart className="w-7 h-7 text-[#9A7624]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#0F3D2E]">
                {language === 'en' ? 'No Saved Items Yet' : t('pages.wishlist.empty')}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A554C] max-w-md mx-auto leading-relaxed">
                {language === 'en'
                  ? 'Tap the heart icon on any pure Desi Ghee jar, festive Mithai box, or crisp snack pack to curate your favorites here.'
                  : t('pages.wishlist.subtitle')}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                to="/shop"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                <span>{language === 'en' ? 'Explore Catalog' : t('pages.wishlist.exploreBtn')}</span>
              </Button>
              <Button to="/shop/desi-ghee" variant="secondary" size="md">
                {isHi ? 'देसी घी देखें' : 'Shop Desi Ghee'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => {
              const variant = product.variants[0];
              return (
                <article
                  key={product.id}
                  className="rounded-[22px] overflow-hidden border border-[#E6DEC9] bg-[#FFFDF8] gg-shadow-sm flex flex-col justify-between hover:gg-shadow-md transition-all duration-300 group"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className="aspect-[4/3] bg-[#F3EAD7] overflow-hidden block relative"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="cream" size="sm">
                        {categoryLabel(product.categorySlug || product.category, product.categoryName)}
                      </Badge>
                    </div>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <Link
                        to={`/product/${product.slug}`}
                        className="block font-editorial text-xl sm:text-2xl font-semibold text-[#0F3D2E] group-hover:text-[#9A7624] transition-colors line-clamp-2 leading-snug"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-base font-bold text-[#0F3D2E] tabular-nums">
                          {formatINR(variant.price)}
                        </span>
                        <span className="text-xs text-[#5A554C]">
                          ({variant.label})
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E6DEC9] flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleMoveToCart(product)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#0F3D2E] text-[#FBF7EE] text-xs font-semibold uppercase tracking-wider hover:bg-[#155742] transition-colors shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#E8D08B]" />
                        <span>Move to Cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.slug)}
                        aria-label={`Remove ${product.name} from wishlist`}
                        className="p-2.5 rounded-full border border-[#E6DEC9] text-[#7A7468] hover:text-[#8C2D19] hover:bg-[#FDF1EE] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
