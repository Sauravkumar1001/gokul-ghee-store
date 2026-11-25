import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Sparkles, Trash2, Truck, X } from 'lucide-react';
import { Badge, Button, JaaliPattern } from '../ui';
import { useCart } from '../../context/CartContext';
import { STORE_CONFIG } from '../../config/storeConfig';
import { formatINR } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    totalSavings,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart();
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  const freeDeliveryThreshold = STORE_CONFIG.freeDeliveryThreshold || 499;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(
    100,
    Math.round((subtotal / freeDeliveryThreshold) * 100)
  );
  const unlockedFreeDelivery = subtotal >= freeDeliveryThreshold;

  if (!isDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      {/* Backdrop */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-[#0A2B20]/60 backdrop-blur-xs"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.aside
        initial={shouldReduceMotion ? false : { x: '100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md bg-[#FBF7EE] text-[#1B1B1B] h-full flex flex-col border-l border-[#E6DEC9] shadow-2xl"
      >
            {/* Header */}
            <div className="relative overflow-hidden px-6 py-4 bg-[#0F3D2E] text-[#FBF7EE] flex items-center justify-between border-b border-[#C9A24B]/30">
              <JaaliPattern variant="tile" opacity={0.06} />
              <div className="relative z-10 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-[#155742] border border-[#C9A24B]/50 flex items-center justify-center text-[#E8D08B]">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="font-editorial text-xl font-semibold leading-none tracking-wide">
                    {language === 'en' ? 'Your Basket' : t('pages.cart.drawerTitle')}
                  </h2>
                  <p className="text-[11px] text-[#E8D08B]/85 mt-1 tabular-nums">
                    {itemCount}{' '}
                    {isHi ? 'आइटम' : itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                aria-label={t('common.close', 'Close cart drawer')}
                className="relative z-10 w-9 h-9 rounded-full inline-flex items-center justify-center text-[#FBF7EE]/85 hover:text-[#E8D08B] hover:bg-[#155742] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Delivery Progress Bar */}
            {items.length > 0 && (
              <div
                aria-label="Free delivery progress"
                className="px-5 sm:px-6 py-3 bg-[#F3EAD7]/75 border-b border-[#E6DEC9] space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#0F3D2E]">
                    <Truck className="w-3.5 h-3.5 text-[#9A7624] shrink-0" aria-hidden="true" />
                    <span>
                      {unlockedFreeDelivery
                        ? isHi
                          ? 'मुफ़्त लोकल डिलीवरी अनलॉक हो गई!'
                          : isHinglish
                            ? 'Free local delivery unlock ho gayi hai!'
                            : 'You unlocked FREE local delivery!'
                        : isHi
                          ? `मुफ़्त डिलीवरी के लिए ${formatINR(remainingForFreeDelivery)} और जोड़ें`
                          : isHinglish
                            ? `Free delivery ke liye ${formatINR(remainingForFreeDelivery)} aur jodein`
                            : `Add ${formatINR(remainingForFreeDelivery)} more for free delivery`}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#9A7624] tabular-nums shrink-0">
                    {freeDeliveryProgress}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#E6DEC9] overflow-hidden">
                  <div
                    role="progressbar"
                    aria-valuenow={freeDeliveryProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{ width: `${freeDeliveryProgress}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      unlockedFreeDelivery
                        ? 'bg-[#0F3D2E]'
                        : 'bg-gradient-to-r from-[#C9A24B] to-[#9A7624]'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="py-12 px-2 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/40 flex items-center justify-center mx-auto text-[#0F3D2E]">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                      {language === 'en' ? 'Your Basket is Empty' : t('pages.cart.emptyTitle')}
                    </p>
                    <p className="text-xs text-[#5A554C] max-w-xs mx-auto leading-relaxed">
                      {language === 'en'
                        ? 'Explore pure Desi Ghee, festive Mithai, crisp Samosas, and traditional snacks from our kitchen.'
                        : t('pages.cart.emptySubtitle')}
                    </p>
                  </div>
                  <div className="pt-1 flex flex-col items-center gap-2.5">
                    <Button
                      to="/shop"
                      variant="primary"
                      size="md"
                      onClick={closeDrawer}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {isHi ? 'दुकान देखें' : isHinglish ? 'Shop Dekhein' : 'Browse Shop'}
                    </Button>
                    <p className="text-[11px] text-[#7A7468]">
                      {isHi
                        ? `${formatINR(freeDeliveryThreshold)}+ पर दानापुर/आनंद बाजार में मुफ़्त डिलीवरी`
                        : `Free Anand Bazar & Danapur delivery above ${formatINR(freeDeliveryThreshold)}`}
                    </p>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.variantId}
                    className="rounded-[16px] border border-[#E6DEC9] bg-[#FFFDF8] p-3.5 flex items-start gap-3.5 gg-shadow-sm"
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      onClick={closeDrawer}
                      className="w-20 h-20 rounded-[12px] overflow-hidden bg-[#F3EAD7] shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={closeDrawer}
                            className="font-editorial text-[17px] font-semibold text-[#0F3D2E] hover:text-[#9A7624] line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>
                          <p className="text-[11px] text-[#5A554C] mt-0.5">{item.variantLabel}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          aria-label={`Remove ${item.name}`}
                          className="p-1.5 rounded-full text-[#7A7468] hover:text-[#B84A24] hover:bg-[#F3EAD7]/70 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center border border-[#E6DEC9] rounded-full bg-[#FBF7EE] p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-[#0F3D2E] hover:bg-[#F3EAD7] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold tabular-nums text-[#1B1B1B]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-[#0F3D2E] hover:bg-[#F3EAD7] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-[#0F3D2E] tabular-nums">
                          {formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-[#FFFDF8] border-t border-[#E6DEC9] space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5A554C] font-medium">
                      {language === 'en' ? 'Subtotal' : t('pages.cart.subtotal')}
                    </span>
                    <span className="text-lg font-semibold text-[#0F3D2E] tabular-nums">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5A554C]">
                        {isHi ? 'कुल बचत' : isHinglish ? 'Aapki Bachat' : 'Your Savings'}
                      </span>
                      <Badge variant="saffron" size="sm" icon={<Sparkles className="w-2.5 h-2.5" />}>
                        -{formatINR(totalSavings)}
                      </Badge>
                    </div>
                  )}
                  <p className="text-[11px] text-[#7A7468] leading-relaxed">
                    {language === 'en'
                      ? 'Delivery charges & promo offers are calculated by pincode at Checkout.'
                      : t('pages.cart.shippingNote')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    to="/cart"
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={closeDrawer}
                  >
                    {language === 'en' ? 'View Cart' : t('pages.cart.viewFullCart')}
                  </Button>
                  <Button
                    to="/checkout"
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={closeDrawer}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    {language === 'en' ? 'Checkout' : t('pages.cart.proceedCheckout')}
                  </Button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
  );
}
