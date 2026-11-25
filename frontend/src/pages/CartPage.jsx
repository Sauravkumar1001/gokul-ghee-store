import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { STORE_CONFIG } from '../config/storeConfig';
import { formatINR } from '../utils/formatters';
import PincodeCheckerCard from '../components/checkout/PincodeCheckerCard';
import { useLanguage } from '../context/LanguageContext';

export default function CartPage() {
  const { language, t, categoryLabel } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const {
    items,
    itemCount,
    subtotal,
    mrpTotal,
    totalSavings,
    couponCode,
    setCouponCode,
    pincode,
    setPincode,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [couponNotice, setCouponNotice] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryCheck, setDeliveryCheck] = useState(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const freeDeliveryThreshold = STORE_CONFIG.freeDeliveryThreshold || 499;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(
    100,
    Math.round((subtotal / freeDeliveryThreshold) * 100)
  );
  const unlockedFreeDelivery = subtotal >= freeDeliveryThreshold;

  const handleCouponCheck = async (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponNotice(
        isHi ? 'कृपया मान्य कूपन कोड दर्ज करें।' : 'Please enter a coupon code to apply.'
      );
      return;
    }

    setCheckingCoupon(true);
    const res = await orderService.validateCoupon({ code, subtotal });
    setCheckingCoupon(false);

    if (res.ok && res.data?.applied) {
      setCouponCode(res.data.code);
      setCouponDiscount(res.data.discountAmount || 0);
      setCouponNotice(res.data.message);
    } else if (res.error?.isNetworkError) {
      console.warn('[Cart] Coupon service temporarily unreachable:', res.error);
      setCouponCode(code);
      setCouponDiscount(0);
      setCouponNotice(
        isHi
          ? `कूपन "${code}" सेव हो गया है। चेकआउट पर लागू छूट अपने आप सत्यापित होगी।`
          : isHinglish
            ? `Coupon "${code}" save ho gaya hai. Checkout par discount automatically verify ho jayega.`
            : `Code "${code}" saved. Your discount is verified automatically at checkout.`
      );
    } else {
      setCouponCode('');
      setCouponDiscount(0);
      setCouponNotice(res.error?.message || `Coupon "${code}" could not be applied.`);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponInput('');
    setCouponDiscount(0);
    setCouponNotice('');
  };

  const estimatedDeliveryFee =
    deliveryCheck && deliveryCheck.serviceable ? deliveryCheck.deliveryCharge : 0;
  const estimatedTotal = Math.max(0, subtotal - couponDiscount + estimatedDeliveryFee);

  return (
    <div className={`py-8 lg:py-14 bg-[#FBF7EE] min-h-[75vh] ${items.length > 0 ? 'pb-24 lg:pb-14' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6DEC9] pb-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
              {isHi ? 'चयन की समीक्षा करें' : isHinglish ? 'Order Review Karein' : 'Review Selection'}
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#0F3D2E]">
              {language === 'en' ? 'Your Shopping Cart' : t('pages.cart.title')}
            </h1>
            <p className="text-sm text-[#5A554C]">
              {itemCount}{' '}
              {isHi
                ? 'उत्पाद आपके बैग में चुने गए हैं।'
                : `${itemCount === 1 ? 'item' : 'items'} selected from our kitchen.`}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="self-start text-xs font-semibold uppercase tracking-wider text-[#5A554C] hover:text-[#8C2D19] transition-colors"
            >
              {t('pages.cart.clearCart')}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-[24px] border border-[#E6DEC9] bg-[#FFFDF8] gg-shadow-sm py-16 px-6 text-center space-y-5 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/45 flex items-center justify-center mx-auto text-[#0F3D2E]">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="font-editorial text-3xl font-semibold text-[#0F3D2E]">
                {language === 'en' ? 'Your Cart Is Currently Empty' : t('pages.cart.emptyTitle')}
              </h2>
              <p className="text-sm text-[#5A554C] max-w-md mx-auto leading-relaxed">
                {language === 'en'
                  ? 'Add pure Desi Ghee jars, festive Mithai boxes, crisp Samosas, or traditional Namkeen to start your order.'
                  : t('pages.cart.emptySubtitle')}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button
                to="/shop"
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('pages.cart.continueShopping')}
              </Button>
              <Button to="/shop/desi-ghee" variant="secondary" size="lg">
                {isHi ? 'देसी घी देखें' : 'Shop Desi Ghee'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Line Items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Delivery Progress Banner */}
              <div className="rounded-[18px] border border-[#C9A24B]/40 bg-[#FFFDF8] p-4 sm:px-5 space-y-2.5 gg-shadow-sm">
                <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <span className="inline-flex items-center gap-2 font-medium text-[#0F3D2E]">
                    <Truck className="w-4 h-4 text-[#9A7624] shrink-0" aria-hidden="true" />
                    <span>
                      {unlockedFreeDelivery
                        ? isHi
                          ? 'मुफ़्त लोकल डिलीवरी अनलॉक हो गई!'
                          : isHinglish
                            ? 'Free local delivery unlock ho gayi!'
                            : 'You have unlocked FREE local Anand Bazar & Danapur delivery!'
                        : isHi
                          ? `मुफ़्त डिलीवरी के लिए ${formatINR(remainingForFreeDelivery)} का सामान और जोड़ें`
                          : isHinglish
                            ? `Free delivery ke liye ${formatINR(remainingForFreeDelivery)} aur add karein`
                            : `Add ${formatINR(remainingForFreeDelivery)} more for free local delivery`}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-[#9A7624] tabular-nums shrink-0">
                    {freeDeliveryProgress}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EFE7D6] overflow-hidden">
                  <div
                    role="progressbar"
                    aria-label="Free delivery progress"
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

              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="rounded-[20px] border border-[#E6DEC9] bg-[#FFFDF8] p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center gg-shadow-sm transition-shadow hover:gg-shadow-md"
                >
                  <Link
                    to={`/product/${item.slug}`}
                    className="w-full sm:w-28 aspect-[4/3] rounded-[14px] overflow-hidden bg-[#F3EAD7] shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A7624]">
                      {categoryLabel(item.categorySlug, item.categoryName)}
                    </span>
                    <Link
                      to={`/product/${item.slug}`}
                      className="block font-editorial text-xl sm:text-2xl font-semibold text-[#0F3D2E] hover:text-[#9A7624] line-clamp-2 leading-snug"
                    >
                      {item.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A554C] tabular-nums pt-0.5">
                      <Badge variant="cream" size="sm">
                        {item.variantLabel}
                      </Badge>
                      <span>•</span>
                      <span>{formatINR(item.price)} each</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E6DEC9]">
                    <div className="inline-flex items-center border border-[#E6DEC9] rounded-full bg-[#FBF7EE] p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#0F3D2E] hover:bg-[#F3EAD7] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums text-[#1B1B1B]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#0F3D2E] hover:bg-[#F3EAD7] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-[#0F3D2E] tabular-nums">
                        {formatINR(item.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="p-1.5 rounded-full text-[#7A7468] hover:text-[#8C2D19] hover:bg-[#FDF1EE] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <aside className="lg:col-span-4 rounded-[22px] border border-[#E6DEC9] bg-[#FFFDF8] p-6 space-y-5 lg:sticky lg:top-24 gg-shadow-md">
              <div className="flex items-center justify-between border-b border-[#E6DEC9] pb-3.5">
                <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                  {isHi ? 'ऑर्डर सारांश' : 'Order Summary'}
                </h2>
                <Badge variant="gold" size="sm">
                  {itemCount} {itemCount === 1 ? 'pack' : 'packs'}
                </Badge>
              </div>

              <PincodeCheckerCard
                compact
                pincode={pincode}
                subtotal={subtotal}
                onPincodeResolved={(pin, data) => {
                  setPincode(pin);
                  setDeliveryCheck(data);
                }}
              />

              {/* Coupon Box */}
              <form onSubmit={handleCouponCheck} className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A554C] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#9A7624]" />
                  <span>Promo / Coupon Code</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon (e.g. GOKULSAMPLE)"
                    aria-label="Coupon code"
                    className="flex-1 min-w-0 px-3.5 py-2 rounded-full bg-[#FBF7EE] border border-[#E6DEC9] text-sm uppercase text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
                  />
                  {couponCode ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 rounded-full border border-[#8C2D19] text-[#8C2D19] text-xs font-semibold uppercase tracking-wider hover:bg-[#FDF1EE] transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={checkingCoupon}
                      className="px-4 py-2 rounded-full border border-[#0F3D2E] text-[#0F3D2E] text-xs font-semibold uppercase tracking-wider hover:bg-[#0F3D2E] hover:text-[#FBF7EE] disabled:opacity-60 transition-colors shrink-0"
                    >
                      {checkingCoupon ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponNotice && (
                  <p role="status" className="text-[11px] text-[#0F3D2E] leading-relaxed">
                    {couponNotice}
                  </p>
                )}
              </form>

              <div className="space-y-3 pt-4 border-t border-[#E6DEC9] text-sm tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#5A554C]">MRP Total</span>
                  <span className="text-[#1B1B1B]">{formatINR(mrpTotal)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-[#9A7624] font-medium">
                    <span>Pack Discount</span>
                    <span>-{formatINR(totalSavings)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#0F3D2E] font-medium">
                    <span>Coupon ({couponCode})</span>
                    <span>-{formatINR(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#5A554C]">Delivery Fee</span>
                  <span className="text-xs font-medium text-[#0F3D2E]">
                    {deliveryCheck?.serviceable
                      ? deliveryCheck.deliveryCharge === 0
                        ? 'FREE'
                        : formatINR(deliveryCheck.deliveryCharge)
                      : 'Checked by pincode'}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#E6DEC9] flex justify-between text-base font-semibold text-[#0F3D2E]">
                  <span>Estimated Total</span>
                  <span className="text-lg">{formatINR(estimatedTotal)}</span>
                </div>
              </div>

              <div className="rounded-[14px] bg-[#F3EAD7]/75 p-3.5 text-xs text-[#0F3D2E] space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#9A7624] shrink-0 mt-0.5" />
                  <span>Your order is confirmed by our team before dispatch.</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#5A554C]">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0F3D2E]" />
                    Secure Checkout
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#0F3D2E]" />
                    Fresh Local Dispatch
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <Button
                  to="/checkout"
                  variant="gold"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Checkout
                </Button>
                <Button to="/shop" variant="secondary" size="md" fullWidth>
                  Continue Shopping
                </Button>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Sticky Mobile Checkout Bar */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-t border-[#E6DEC9] px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_24px_rgba(15,61,46,0.1)]">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-[#5A554C] font-medium">
              {isHi ? 'अनुमानित कुल' : 'Estimated Total'}
            </p>
            <p className="text-base font-bold text-[#0F3D2E] tabular-nums">
              {formatINR(estimatedTotal)}
            </p>
          </div>
          <Button
            to="/checkout"
            variant="gold"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isHi ? 'चेकआउट करें' : `Checkout (${itemCount})`}
          </Button>
        </div>
      )}
    </div>
  );
}
