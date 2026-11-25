import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Info,
  Lock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
} from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { analyticsService } from '../services/analyticsService';
import { orderService } from '../services/orderService';
import { STORE_CONFIG } from '../config/storeConfig';
import { formatINR } from '../utils/formatters';
import { loadRazorpayCheckoutScript } from '../utils/razorpayLoader';
import GoogleMapAddressPicker from '../components/checkout/GoogleMapAddressPicker';
import PincodeCheckerCard from '../components/checkout/PincodeCheckerCard';
import { useLanguage } from '../context/LanguageContext';

const INITIAL_ADDRESS_FORM = {
  recipientName: '',
  phone: '',
  houseNumber: '',
  street: '',
  landmark: '',
  city: 'Patna',
  state: 'Bihar',
  pincode: '801503',
  formattedAddress: '',
  coordinates: null,
};

function validateAddressForm(form) {
  const errors = {};
  if (!form.recipientName?.trim() || form.recipientName.trim().length < 2) {
    errors.recipientName = 'Enter the recipient full name.';
  }
  const digits = String(form.phone || '').replace(/\D/g, '');
  if (digits.length < 10) {
    errors.phone = 'Enter a valid 10-digit mobile number.';
  }
  if (!form.houseNumber?.trim()) {
    errors.houseNumber = 'Enter house, flat, or shop number.';
  }
  if (!form.street?.trim()) {
    errors.street = 'Enter street, mohalla, or locality.';
  }
  if (!form.city?.trim()) {
    errors.city = 'Enter city name.';
  }
  if (!/^[1-9][0-9]{5}$/.test(String(form.pincode || '').trim())) {
    errors.pincode = 'Enter a valid 6-digit Indian pincode.';
  }
  return errors;
}

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const {
    items,
    subtotal,
    couponCode,
    setCouponCode,
    pincode,
    setPincode,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [addressForm, setAddressForm] = useState(() => ({
    ...INITIAL_ADDRESS_FORM,
    recipientName: user?.name || '',
    phone: user?.phone || '',
    pincode: pincode || '801503',
  }));
  const [touchedFields, setTouchedFields] = useState({});

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paymentConfig, setPaymentConfig] = useState({
    loaded: false,
    razorpayEnabled: false,
    keyId: null,
  });

  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [couponFeedback, setCouponFeedback] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);

  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePincode = useNewAddress
    ? addressForm.pincode.trim()
    : savedAddresses.find((a) => a._id === selectedAddressId)?.pincode || pincode;

  const addressErrors = useNewAddress ? validateAddressForm(addressForm) : {};
  const addressReady = useNewAddress
    ? Object.keys(addressErrors).length === 0
    : Boolean(selectedAddressId);

  const markFieldTouched = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    if (user) {
      setAddressForm((prev) => ({
        ...prev,
        recipientName: prev.recipientName || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) return;
    analyticsService.trackEvent({
      eventType: 'CHECKOUT_START',
      metadata: { itemCount: items.length, subtotal },
    });
  }, [items.length, subtotal]);

  useEffect(() => {
    let active = true;

    orderService.getPaymentConfig().then((res) => {
      if (!active || !res.ok || !res.data) return;
      setPaymentConfig({
        loaded: true,
        razorpayEnabled: Boolean(res.data.razorpayEnabled),
        keyId: res.data.keyId || null,
      });
    });

    if (isAuthenticated) {
      orderService.getAddresses().then((res) => {
        if (!active || !res.ok || !Array.isArray(res.data?.addresses)) return;
        const list = res.data.addresses;
        setSavedAddresses(list);
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(defaultAddr._id);
          setUseNewAddress(false);
          setPincode(defaultAddr.pincode);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated, setPincode]);

  const refreshCheckoutSummary = useCallback(
    async (targetPin, targetCoupon) => {
      if (items.length === 0 || !/^[1-9][0-9]{5}$/.test(targetPin)) {
        setQuote(null);
        return;
      }
      setIsQuoting(true);
      setQuoteError('');

      const res = await orderService.getCheckoutQuote({
        items: items.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        pincode: targetPin,
        couponCode: targetCoupon || '',
      });

      setIsQuoting(false);
      if (res.ok && res.data?.quote) {
        setQuote(res.data.quote);
      } else if (res.error?.isNetworkError) {
        console.warn('[Checkout] Store quote endpoint unreachable:', res.error);
        setQuote(null);
        setQuoteError(
          isHi
            ? 'हम अभी स्टोर से जुड़ नहीं सके। कृपया कुछ क्षण बाद पुनः प्रयास करें।'
            : isHinglish
              ? 'Store abhi connect nahi ho pa raha hai. Please thodi der baad try karein.'
              : "We couldn't reach the store right now. Please try again in a moment."
        );
      } else {
        setQuote(null);
        setQuoteError(
          res.error?.message || "We couldn't check delivery pricing right now. Please try again."
        );
      }
    },
    [items, isHi, isHinglish]
  );

  useEffect(() => {
    if (/^[1-9][0-9]{5}$/.test(activePincode)) {
      refreshCheckoutSummary(activePincode, couponCode);
    }
  }, [activePincode, couponCode, refreshCheckoutSummary]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const cleaned = couponInput.trim().toUpperCase();
    if (!cleaned) {
      setCouponCode('');
      setCouponFeedback('');
      return;
    }

    const res = await orderService.validateCoupon({
      code: cleaned,
      subtotal: quote?.pricing?.subtotal ?? subtotal,
    });

    if (res.ok && res.data?.applied) {
      setCouponCode(res.data.code);
      setCouponFeedback(res.data.message);
      refreshCheckoutSummary(activePincode, res.data.code);
    } else if (res.error?.isNetworkError) {
      console.warn('[Checkout] Coupon validation unreachable:', res.error);
      setCouponCode(cleaned);
      setCouponFeedback(
        isHi
          ? `कूपन "${cleaned}" सेव हो गया। हम अभी स्टोर से जुड़ नहीं सके, कृपया थोड़ी देर में पुनः प्रयास करें।`
          : `Code "${cleaned}" saved. We couldn't reach the store right now — please try again in a moment.`
      );
    } else {
      setCouponCode('');
      setCouponFeedback(res.error?.message || 'Coupon could not be applied.');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput('');
    setCouponCode('');
    setCouponFeedback('');
  };

  const handleRazorpayFlow = async ({ order, razorpayOrder }) => {
    const sdkReady = await loadRazorpayCheckoutScript();
    if (!sdkReady || !window.Razorpay) {
      console.warn('[Checkout] Razorpay script failed to initialize.');
      await orderService.reportRazorpayFailure({
        orderId: order._id,
        reason: 'Could not load Razorpay Checkout SDK in browser.',
      });
      setSubmitError(
        'Could not open the online payment window. Please check your connection or choose Cash on Delivery.'
      );
      setIsSubmitting(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: paymentConfig.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: STORE_CONFIG.brandDisplayName,
      description: `Order #${order.orderNumber} — ${STORE_CONFIG.businessName}`,
      order_id: razorpayOrder.id,
      prefill: {
        name: order.deliveryAddress?.recipientName || user?.name || '',
        email: user?.email || '',
        contact: order.deliveryAddress?.phone || user?.phone || '',
      },
      theme: {
        color: '#0F3D2E',
      },
      modal: {
        ondismiss: async () => {
          await orderService.reportRazorpayFailure({
            orderId: order._id,
            reason: 'Customer closed Razorpay payment modal before completion.',
          });
          setSubmitError(
            `Online payment was cancelled for #${order.orderNumber}. No amount was charged — you can retry or use Cash on Delivery.`
          );
          setIsSubmitting(false);
        },
      },
      handler: async (paymentResponse) => {
        const verifyRes = await orderService.verifyRazorpayPayment({
          orderId: order._id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        });

        setIsSubmitting(false);
        if (verifyRes.ok && verifyRes.data?.order) {
          clearCart();
          navigate(`/account/orders/${verifyRes.data.order._id}?placed=1`);
        } else {
          console.warn('[Checkout] Payment confirmation failed:', verifyRes.error);
          setSubmitError(
            verifyRes.error?.message ||
              "We couldn't confirm your payment right now. No order was completed."
          );
        }
      },
    });

    rzp.on('payment.failed', async (failResp) => {
      await orderService.reportRazorpayFailure({
        orderId: order._id,
        reason: failResp?.error?.description || 'Razorpay payment failed.',
      });
      setSubmitError(
        failResp?.error?.description ||
          'Payment did not go through. No amount was charged — please try again.'
      );
      setIsSubmitting(false);
    });

    rzp.open();
  };

  const handlePlaceOrder = async () => {
    setSubmitError('');

    if (!isAuthenticated) {
      setSubmitError('Please sign in or create an account to place and track your order.');
      return;
    }

    if (useNewAddress) {
      setTouchedFields({
        recipientName: true,
        phone: true,
        houseNumber: true,
        street: true,
        city: true,
        pincode: true,
      });
      if (Object.keys(addressErrors).length > 0) {
        setSubmitError(
          'Please fill in recipient name, valid 10-digit mobile number, house number, street, and a 6-digit Indian pincode.'
        );
        return;
      }
    } else if (!selectedAddressId) {
      setSubmitError('Please select a saved delivery address or enter a new address.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      items: items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      ...(useNewAddress
        ? {
            shippingAddress: {
              ...addressForm,
              pincode: addressForm.pincode.trim(),
            },
            saveAddress: saveNewAddress,
          }
        : {
            addressId: selectedAddressId,
          }),
      couponCode: couponCode || '',
      paymentMethod,
    };

    const res = await orderService.placeOrder(payload);
    if (!res.ok) {
      setIsSubmitting(false);
      if (res.error?.isNetworkError) {
        console.warn('[Checkout] Order placement endpoint unreachable:', res.error);
        setSubmitError("We couldn't reach the store right now. Please try again in a moment.");
      } else {
        setSubmitError(res.error?.message || 'Unable to place order right now.');
      }
      return;
    }

    const { order, razorpayOrder } = res.data;

    if (paymentMethod === 'COD') {
      setIsSubmitting(false);
      clearCart();
      navigate(`/account/orders/${order._id}?placed=1`);
      return;
    }

    if (paymentMethod === 'RAZORPAY' && razorpayOrder) {
      await handleRazorpayFlow({ order, razorpayOrder });
      return;
    }

    setIsSubmitting(false);
    setSubmitError('Payment could not be started right now. Please retry or choose Cash on Delivery.');
  };

  const displaySubtotal = quote?.pricing?.subtotal ?? subtotal;
  const displayDiscount = quote?.pricing?.discountAmount ?? 0;
  const displayDelivery = quote?.pricing?.deliveryCharge ?? null;
  const displayTotal = quote?.pricing?.totalAmount ?? subtotal;
  const pincodeServiceable = quote ? quote.delivery?.serviceable : true;
  const meetsMinimum = quote ? quote.delivery?.meetsMinimumOrder : true;

  if (items.length === 0) {
    return (
      <div className="py-16 lg:py-24 bg-[#FBF7EE]">
        <div className="max-w-xl mx-auto px-4">
          <div className="rounded-[24px] border border-[#E6DEC9] bg-[#FFFDF8] p-10 text-center space-y-5 gg-shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/45 flex items-center justify-center mx-auto text-[#0F3D2E]">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h1 className="font-editorial text-4xl font-semibold text-[#0F3D2E]">
              Your Cart Is Empty
            </h1>
            <p className="text-sm text-[#5A554C]">
              Add pure Desi Ghee jars, Mithai assortments, or snacks before proceeding to checkout.
            </p>
            <Button
              to="/shop"
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Store Catalog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'cart', label: isHi ? 'कार्ट' : 'Cart', status: 'done', to: '/cart' },
    { key: 'address', label: isHi ? 'पता' : 'Address', status: addressReady ? 'done' : 'active' },
    { key: 'payment', label: isHi ? 'भुगतान' : 'Payment', status: addressReady ? 'done' : 'upcoming' },
    { key: 'confirm', label: isHi ? 'पुष्टि' : 'Confirm', status: addressReady ? 'active' : 'upcoming' },
  ];

  const getInputClass = (field) =>
    `w-full px-3.5 py-2.5 rounded-[12px] bg-[#FBF7EE] border text-sm text-[#1B1B1B] focus:outline-none transition-colors ${
      touchedFields[field] && addressErrors[field]
        ? 'border-[#8C2D19] focus:border-[#8C2D19]'
        : 'border-[#E6DEC9] focus:border-[#0F3D2E]'
    }`;

  return (
    <div className="py-8 lg:py-14 pb-24 lg:pb-14 bg-[#FBF7EE] min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header + 4-Step Progress Bar */}
        <div className="border-b border-[#E6DEC9] pb-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
                {isHi ? 'सुरक्षित चेकआउट' : 'Secure Checkout'}
              </span>
              <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#0F3D2E]">
                {language === 'en' ? 'Complete Your Order' : t('pages.checkout.title')}
              </h1>
              <p className="text-sm text-[#5A554C]">
                {isHi
                  ? 'आनंद बाजार रसोई से ताज़ा पैकिंग। डिस्पैच से पहले हमारी टीम आपका ऑर्डर कन्फर्म करती है।'
                  : isHinglish
                    ? 'Anand Bazar kitchen se fresh packing. Dispatch se pehle humari team aapka order confirm karti hai.'
                    : 'Freshly packed at our Anand Bazar kitchen. Your order is confirmed by our team before dispatch.'}
              </p>
            </div>

            {/* 4-Step Checkout Progress */}
            <nav
              aria-label="Checkout progress"
              className="flex items-center flex-wrap gap-1.5 sm:gap-2 rounded-[18px] sm:rounded-full border border-[#E6DEC9] bg-[#FFFDF8] px-3.5 py-2.5 sm:py-2 gg-shadow-sm self-start lg:self-auto"
            >
              {steps.map((step, idx) => {
                const badgeEl = (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                        step.status === 'done'
                          ? 'bg-[#0F3D2E] text-[#FBF7EE]'
                          : step.status === 'active'
                            ? 'bg-[#C9A24B] text-[#0F3D2E]'
                            : 'bg-[#EFE7D6] text-[#7A7468]'
                      }`}
                    >
                      {step.status === 'done' ? <Check className="w-3 h-3" /> : idx + 1}
                    </span>
                    <span
                      className={
                        step.status === 'upcoming' ? 'text-[#7A7468]' : 'text-[#0F3D2E]'
                      }
                    >
                      {step.label}
                    </span>
                  </span>
                );
                return (
                  <span key={step.key} className="inline-flex items-center gap-1.5 sm:gap-2">
                    {step.to ? (
                      <Link to={step.to} className="hover:underline underline-offset-4">
                        {badgeEl}
                      </Link>
                    ) : (
                      badgeEl
                    )}
                    {idx < steps.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#C9A24B]" aria-hidden="true" />
                    )}
                  </span>
                );
              })}
            </nav>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="rounded-[20px] border border-[#C9A24B]/50 bg-[#FFFDF8] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 gg-shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F3EAD7] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-[#9A7624]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#0F3D2E]">
                  Sign In Required to Place & Track Real Orders
                </p>
                <p className="text-xs text-[#5A554C]">
                  Sign in or create a quick customer account so your order receipt and saved
                  Patna/Danapur addresses stay linked securely.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/login?next=/checkout"
                className="px-4 py-2 rounded-full bg-[#0F3D2E] text-[#FBF7EE] text-xs font-semibold uppercase tracking-wider hover:bg-[#155742] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register?next=/checkout"
                className="px-4 py-2 rounded-full border border-[#0F3D2E] text-[#0F3D2E] text-xs font-semibold uppercase tracking-wider hover:bg-[#0F3D2E]/5 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Pincode, Address & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Pincode Serviceability Check */}
            <PincodeCheckerCard
              pincode={activePincode}
              subtotal={displaySubtotal}
              onPincodeResolved={(pin) => {
                setPincode(pin);
                if (useNewAddress) {
                  setAddressForm((prev) => ({ ...prev, pincode: pin }));
                }
              }}
            />

            {/* 2. Delivery Address Section */}
            <section className="rounded-[22px] border border-[#E6DEC9] bg-[#FFFDF8] p-6 space-y-5 gg-shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DEC9] pb-3.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#9A7624]" />
                  <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                    Delivery Address
                  </h2>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseNewAddress((prev) => !prev)}
                    className="text-xs font-semibold text-[#9A7624] hover:text-[#0F3D2E] underline underline-offset-4"
                  >
                    {useNewAddress ? 'Choose Saved Address' : '+ Add New Address'}
                  </button>
                )}
              </div>

              {savedAddresses.length > 0 && !useNewAddress && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const selected = addr._id === selectedAddressId;
                    return (
                      <button
                        key={addr._id}
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(addr._id);
                          setPincode(addr.pincode);
                        }}
                        className={`text-left p-4 rounded-[16px] border transition-all space-y-1 ${
                          selected
                            ? 'border-[#0F3D2E] bg-[#FBF7EE] ring-1 ring-[#0F3D2E]'
                            : 'border-[#E6DEC9] bg-[#FFFDF8] hover:bg-[#FBF7EE]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold uppercase tracking-wider text-[#9A7624]">
                            {addr.label || 'Saved'}
                          </span>
                          {addr.isDefault && (
                            <Badge variant="forest" size="sm">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[#0F3D2E]">
                          {addr.recipientName}
                        </p>
                        <p className="text-xs text-[#5A554C] leading-relaxed">
                          {addr.houseNumber}, {addr.street}
                          {addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state}{' '}
                          – {addr.pincode}
                        </p>
                        <p className="text-xs text-[#1B1B1B]">{addr.phone}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {useNewAddress && (
                <div className="space-y-4">
                  <GoogleMapAddressPicker
                    value={addressForm}
                    onChange={setAddressForm}
                    onPincodeDetected={(pin) => {
                      setPincode(pin);
                      refreshCheckoutSummary(pin, couponCode);
                    }}
                  />

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <label className="space-y-1.5 font-medium text-[#0F3D2E]">
                      <span>Recipient Full Name *</span>
                      <input
                        type="text"
                        value={addressForm.recipientName}
                        onBlur={() => markFieldTouched('recipientName')}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, recipientName: e.target.value })
                        }
                        aria-invalid={Boolean(
                          touchedFields.recipientName && addressErrors.recipientName
                        )}
                        placeholder="Full name"
                        className={getInputClass('recipientName')}
                      />
                      {touchedFields.recipientName && addressErrors.recipientName && (
                        <span className="block text-[11px] text-[#8C2D19]">
                          {addressErrors.recipientName}
                        </span>
                      )}
                    </label>

                    <label className="space-y-1.5 font-medium text-[#0F3D2E]">
                      <span>Mobile Number *</span>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onBlur={() => markFieldTouched('phone')}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        aria-invalid={Boolean(touchedFields.phone && addressErrors.phone)}
                        placeholder="+91 98XXXXXXXX"
                        className={getInputClass('phone')}
                      />
                      {touchedFields.phone && addressErrors.phone && (
                        <span className="block text-[11px] text-[#8C2D19]">
                          {addressErrors.phone}
                        </span>
                      )}
                    </label>

                    <label className="space-y-1.5 font-medium text-[#0F3D2E]">
                      <span>House / Flat / Shop No. *</span>
                      <input
                        type="text"
                        value={addressForm.houseNumber}
                        onBlur={() => markFieldTouched('houseNumber')}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, houseNumber: e.target.value })
                        }
                        aria-invalid={Boolean(
                          touchedFields.houseNumber && addressErrors.houseNumber
                        )}
                        placeholder="e.g. House 14, Ground Floor"
                        className={getInputClass('houseNumber')}
                      />
                      {touchedFields.houseNumber && addressErrors.houseNumber && (
                        <span className="block text-[11px] text-[#8C2D19]">
                          {addressErrors.houseNumber}
                        </span>
                      )}
                    </label>

                    <label className="space-y-1.5 font-medium text-[#0F3D2E]">
                      <span>Street / Mohalla / Locality *</span>
                      <input
                        type="text"
                        value={addressForm.street}
                        onBlur={() => markFieldTouched('street')}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        aria-invalid={Boolean(touchedFields.street && addressErrors.street)}
                        placeholder="e.g. Math Road, Anand Bazar"
                        className={getInputClass('street')}
                      />
                      {touchedFields.street && addressErrors.street && (
                        <span className="block text-[11px] text-[#8C2D19]">
                          {addressErrors.street}
                        </span>
                      )}
                    </label>

                    <label className="space-y-1.5 font-medium text-[#0F3D2E] sm:col-span-2">
                      <span>Nearby Landmark</span>
                      <input
                        type="text"
                        value={addressForm.landmark}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, landmark: e.target.value })
                        }
                        placeholder="e.g. Near Hindu Society Mandir"
                        className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FBF7EE] border border-[#E6DEC9] text-sm text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
                      />
                    </label>

                    <label className="space-y-1.5 font-medium text-[#0F3D2E]">
                      <span>City *</span>
                      <input
                        type="text"
                        value={addressForm.city}
                        onBlur={() => markFieldTouched('city')}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        aria-invalid={Boolean(touchedFields.city && addressErrors.city)}
                        className={getInputClass('city')}
                      />
                      {touchedFields.city && addressErrors.city && (
                        <span className="block text-[11px] text-[#8C2D19]">
                          {addressErrors.city}
                        </span>
                      )}
                    </label>

                    <label className="space-y-1.5 font-medium text-[#0F3D2E]">
                      <span>6-Digit Pincode *</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={addressForm.pincode}
                        onBlur={() => markFieldTouched('pincode')}
                        onChange={(e) => {
                          const pin = e.target.value.replace(/[^0-9]/g, '');
                          setAddressForm({ ...addressForm, pincode: pin });
                          if (pin.length === 6) setPincode(pin);
                        }}
                        aria-invalid={Boolean(touchedFields.pincode && addressErrors.pincode)}
                        className={`${getInputClass('pincode')} tabular-nums`}
                      />
                      {touchedFields.pincode && addressErrors.pincode && (
                        <span className="block text-[11px] text-[#8C2D19]">
                          {addressErrors.pincode}
                        </span>
                      )}
                    </label>

                    {isAuthenticated && (
                      <label className="sm:col-span-2 inline-flex items-center gap-2 text-xs text-[#5A554C] cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                          className="accent-[#0F3D2E]"
                        />
                        <span>Save this delivery address to my account for faster reorders</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-[#5A554C] flex items-center gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 text-[#9A7624] shrink-0" />
                <span>
                  Use your current location or enter your 6-digit Bihar pincode for doorstep
                  delivery.
                </span>
              </p>
            </section>

            {/* 3. Payment Method Section */}
            <section className="rounded-[22px] border border-[#E6DEC9] bg-[#FFFDF8] p-6 space-y-4 gg-shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#E6DEC9] pb-3.5">
                <CreditCard className="w-4 h-4 text-[#9A7624]" />
                <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3 p-4 rounded-[16px] border cursor-pointer transition-colors ${
                    paymentMethod === 'COD'
                      ? 'border-[#0F3D2E] bg-[#FBF7EE] ring-1 ring-[#0F3D2E]/30'
                      : 'border-[#E6DEC9] hover:bg-[#FBF7EE]/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-[#0F3D2E]"
                  />
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-[#0F3D2E] block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-xs text-[#5A554C] block">
                      Pay in cash or UPI upon delivery. Your order is confirmed by our team before
                      dispatch.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 rounded-[16px] border cursor-pointer transition-colors ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-[#0F3D2E] bg-[#FBF7EE] ring-1 ring-[#0F3D2E]/30'
                      : 'border-[#E6DEC9] hover:bg-[#FBF7EE]/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="mt-1 accent-[#0F3D2E]"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[#0F3D2E]">
                        Online Payment (UPI, Cards, NetBanking via Razorpay)
                      </span>
                      {paymentConfig.loaded && !paymentConfig.razorpayEnabled && (
                        <Badge variant="gold" size="sm">
                          Opening Soon
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-[#5A554C] block">
                      Pay securely via UPI, Cards, or NetBanking with encrypted Razorpay checkout.
                    </span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="lg:col-span-5 rounded-[22px] border border-[#E6DEC9] bg-[#FFFDF8] p-6 space-y-5 lg:sticky lg:top-24 gg-shadow-md">
            <div className="flex items-center justify-between border-b border-[#E6DEC9] pb-3.5">
              <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                {t('pages.checkout.orderSummary')}
              </h2>
              <Badge variant="gold" size="sm">
                {items.length} {isHi ? 'पैक' : items.length === 1 ? 'pack' : 'packs'}
              </Badge>
            </div>

            <ul className="divide-y divide-[#E6DEC9] max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.variantId} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-[10px] object-cover bg-[#F3EAD7] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#0F3D2E] line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#5A554C] mt-0.5">
                        {item.variantLabel} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0F3D2E] tabular-nums shrink-0">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Coupon Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2 pt-3 border-t border-[#E6DEC9]">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5A554C] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#9A7624]" />
                <span>Promo / Coupon Code</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Try GOKULSAMPLE"
                  aria-label="Checkout coupon code"
                  className="flex-1 min-w-0 px-3.5 py-2 rounded-full bg-[#FBF7EE] border border-[#E6DEC9] text-sm uppercase focus:outline-none focus:border-[#0F3D2E]"
                />
                {couponCode ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-3.5 py-2 rounded-full border border-[#8C2D19] text-[#8C2D19] text-xs font-semibold uppercase shrink-0"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full border border-[#0F3D2E] text-[#0F3D2E] text-xs font-semibold uppercase hover:bg-[#0F3D2E] hover:text-[#FBF7EE] transition-colors shrink-0"
                  >
                    Apply
                  </button>
                )}
              </div>
              {couponFeedback && (
                <p role="status" className="text-[11px] text-[#0F3D2E] leading-relaxed">
                  {couponFeedback}
                </p>
              )}
            </form>

            {/* Totals Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-[#E6DEC9] text-sm tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#5A554C]">Items Subtotal</span>
                <span>{formatINR(displaySubtotal)}</span>
              </div>
              {displayDiscount > 0 && (
                <div className="flex justify-between text-[#0F3D2E] font-medium">
                  <span>Coupon Discount ({quote?.pricing?.couponCode})</span>
                  <span>-{formatINR(displayDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[#5A554C] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#9A7624]" />
                  <span>Delivery Charge ({activePincode || '—'})</span>
                </span>
                <span className="text-xs font-medium text-[#0F3D2E]">
                  {isQuoting
                    ? 'Checking...'
                    : displayDelivery === null
                      ? 'Calculated at confirm'
                      : displayDelivery === 0
                        ? 'FREE'
                        : formatINR(displayDelivery)}
                </span>
              </div>
              <div className="pt-3 border-t border-[#E6DEC9] flex justify-between text-base font-semibold text-[#0F3D2E]">
                <span>{isHi ? 'कुल देय राशि' : isHinglish ? 'Kul Payable Amount' : 'Total Payable'}</span>
                <span className="text-lg">{formatINR(displayTotal)}</span>
              </div>
            </div>

            {quote?.delivery?.estimatedDeliveryTime && (
              <p className="text-[11px] text-[#0F3D2E] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#9A7624] shrink-0" />
                <span>Estimated Dispatch: {quote.delivery.estimatedDeliveryTime}</span>
              </p>
            )}

            {quoteError && (
              <div
                role="status"
                className="rounded-[12px] bg-[#F3EAD7] border border-[#E6DEC9] p-3 text-xs text-[#0F3D2E] flex items-start gap-2"
              >
                <Info className="w-4 h-4 text-[#9A7624] shrink-0 mt-0.5" />
                <span>{quoteError}</span>
              </div>
            )}

            {quote && (!pincodeServiceable || !meetsMinimum) && (
              <div
                role="alert"
                className="rounded-[12px] bg-[#FDF1EE] border border-[#8C2D19]/30 p-3 text-xs text-[#8C2D19] flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{quote.delivery?.message}</span>
              </div>
            )}

            {submitError && (
              <div
                role="alert"
                className="rounded-[12px] bg-[#FDF1EE] border border-[#8C2D19]/30 p-3 text-xs text-[#8C2D19] flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={
                isSubmitting ||
                isQuoting ||
                (quote && (!pincodeServiceable || !meetsMinimum))
              }
              className="w-full py-3.5 px-5 rounded-full bg-[#C9A24B] text-[#0F3D2E] text-sm font-semibold hover:bg-[#D8B45E] disabled:opacity-55 transition-colors flex items-center justify-center gap-2 gg-shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[#0F3D2E]" />
              <span>
                {isSubmitting
                  ? paymentMethod === 'RAZORPAY'
                    ? isHi
                      ? 'Razorpay शुरू हो रहा है...'
                      : 'Opening Razorpay...'
                    : t('pages.checkout.placingOrder')
                  : paymentMethod === 'RAZORPAY'
                    ? isHi
                      ? `Razorpay से ${formatINR(displayTotal)} भुगतान करें`
                      : `Pay ${formatINR(displayTotal)} via Razorpay`
                    : isHi
                      ? 'ऑर्डर कन्फर्म करें (कैश ऑन डिलीवरी)'
                      : isHinglish
                        ? 'Order Place Karein (Cash on Delivery)'
                        : 'Place Order (Cash on Delivery)'}
              </span>
            </button>

            {/* Trust Badges */}
            <div className="pt-2 border-t border-[#E6DEC9] grid grid-cols-3 gap-2 text-center text-[11px] text-[#5A554C]">
              <div className="rounded-[12px] bg-[#FBF7EE] p-2 space-y-1">
                <Lock className="w-3.5 h-3.5 text-[#0F3D2E] mx-auto" />
                <span className="block font-medium text-[#0F3D2E]">Secure Payment</span>
              </div>
              <div className="rounded-[12px] bg-[#FBF7EE] p-2 space-y-1">
                <Truck className="w-3.5 h-3.5 text-[#0F3D2E] mx-auto" />
                <span className="block font-medium text-[#0F3D2E]">Local Delivery</span>
              </div>
              <div className="rounded-[12px] bg-[#FBF7EE] p-2 space-y-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F3D2E] mx-auto" />
                <span className="block font-medium text-[#0F3D2E]">Team Confirmed</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Confirm Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-t border-[#E6DEC9] px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_24px_rgba(15,61,46,0.1)]">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-[#5A554C] font-medium">
            {isHi ? 'कुल राशि' : 'Total Payable'}
          </p>
          <p className="text-base font-bold text-[#0F3D2E] tabular-nums">
            {formatINR(displayTotal)}
          </p>
        </div>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={
            isSubmitting ||
            isQuoting ||
            (quote && (!pincodeServiceable || !meetsMinimum))
          }
          className="px-5 py-2.5 rounded-full bg-[#C9A24B] text-[#0F3D2E] text-xs font-semibold uppercase tracking-wider hover:bg-[#D8B45E] disabled:opacity-55 transition-colors inline-flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'Processing...' : `Confirm • ${formatINR(displayTotal)}`}</span>
        </button>
      </div>
    </div>
  );
}
