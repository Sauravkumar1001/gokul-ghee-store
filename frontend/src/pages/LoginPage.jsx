import { useCallback, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  Info,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Badge, Button, FloatingInput, JaaliPattern } from '../components/ui';
import CaptchaWidget from '../components/auth/CaptchaWidget';
import { useAuth } from '../context/AuthContext';
import { STORE_CONFIG } from '../config/storeConfig';
import { useLanguage } from '../context/LanguageContext';

// Set to true when ready to enable social / OTP login providers
const SHOW_SOCIAL_LOGIN_PLACEHOLDER = false;

function getSafeRedirect(rawNext) {
  if (!rawNext || !rawNext.startsWith('/') || rawNext.startsWith('//')) {
    return '/account';
  }
  return rawNext;
}

export default function LoginPage() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [apiFeedback, setApiFeedback] = useState('');
  const [captchaData, setCaptchaData] = useState({ captchaToken: '', captchaAnswer: '' });
  const [captchaResetCount, setCaptchaResetCount] = useState(0);

  const handleCaptchaChange = useCallback((val) => {
    setCaptchaData(val);
    setFormError('');
  }, []);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get('next');
  const redirectTarget = getSafeRedirect(rawNext);

  // Field validation
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailError =
    touched.email && !email.trim()
      ? isHi
        ? 'कृपया अपना ईमेल पता दर्ज करें।'
        : 'Please enter your email address.'
      : touched.email && !emailValid
        ? isHi
          ? 'कृपया मान्य ईमेल पता दर्ज करें।'
          : 'Please enter a valid email address.'
        : '';

  const passwordError =
    touched.password && !password
      ? isHi
        ? 'कृपया अपना पासवर्ड दर्ज करें।'
        : 'Please enter your password.'
      : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setApiFeedback('');
    setTouched({ email: true, password: true });

    if (!email.trim() || !password) {
      setFormError(
        isHi
          ? 'कृपया अपना ईमेल पता और पासवर्ड दोनों दर्ज करें।'
          : isHinglish
            ? 'Kripya apna email address aur password dono daalein.'
            : 'Please enter both your email address and password.'
      );
      return;
    }

    if (!emailValid) {
      setFormError(
        isHi
          ? 'कृपया मान्य ईमेल पता दर्ज करें।'
          : 'Please enter a valid email address.'
      );
      return;
    }

    if (!captchaData.captchaAnswer || captchaData.captchaAnswer.length < 5) {
      setFormError(
        isHi
          ? 'कृपया सुरक्षा कोड (Captcha) पूरा दर्ज करें।'
          : isHinglish
            ? 'Kripya 5-digit captcha code enter karein.'
            : 'Please enter the 5-character captcha code.'
      );
      return;
    }

    const result = await login({
      email: email.trim(),
      password,
      captchaToken: captchaData.captchaToken,
      captchaAnswer: captchaData.captchaAnswer,
    });
    if (result.ok) {
      navigate(redirectTarget);
    } else {
      setCaptchaResetCount((c) => c + 1);
      if (result.error?.isNetworkError) {
        setApiFeedback(
          isHi
            ? 'हम अभी स्टोर से जुड़ नहीं सके। कृपया कुछ क्षण बाद पुनः प्रयास करें।'
            : "We couldn't reach the store right now. Please try again in a moment."
        );
      } else {
        setApiFeedback(result.error?.message || 'Invalid email or password.');
      }
    }
  };

  const registerHref = rawNext
    ? `/register?next=${encodeURIComponent(rawNext)}`
    : '/register';

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FBF7EE] py-5 sm:py-8 lg:py-8 flex items-center justify-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-[28px] border border-[#E6DEC9] bg-[#FFFDF8] overflow-hidden gg-shadow-lg grid grid-cols-1 lg:grid-cols-12 w-full">
          {/* Left Brand Showcase Column (Desktop) */}
          <div className="lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-[#0F3D2E] via-[#0A2B20] to-[#071F17] text-[#FBF7EE] p-6 sm:p-7 lg:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#C9A24B]/30">
            <JaaliPattern variant="tile" opacity={0.07} />

            {/* Glowing Accent Ring */}
            <div
              aria-hidden="true"
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#C9A24B]/15 blur-3xl pointer-events-none"
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D8B45E] to-[#B08732] text-[#0F3D2E] flex items-center justify-center font-editorial font-bold text-base shadow-sm">
                  ग
                </span>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E8D08B] block">
                    {STORE_CONFIG.brandDisplayName}
                  </span>
                  <p className="font-editorial text-base font-bold text-[#FBF7EE] leading-tight">
                    {STORE_CONFIG.businessName}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#FBF7EE] leading-snug">
                  {isHi
                    ? 'शुद्धता और स्वाद की परंपरा'
                    : 'Tradition in Every Taste.'}
                </h2>
                <p className="text-xs text-[#E8D08B]/90 leading-relaxed">
                  {isHi
                    ? 'आनंद बाजार, दानापुर कैंट स्थित हमारी रसोई से सीधे आपके घर तक ताज़ा देसी घी व पारंपरिक मिठाइयां।'
                    : 'Artisanal Bilona Desi Ghee & traditional Khoya Mithai freshly crafted at Anand Bazar, Danapur.'}
                </p>
              </div>

              {/* 3 Key Benefits */}
              <div className="space-y-3 pt-3 border-t border-[#C9A24B]/25">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#155742] border border-[#C9A24B]/40 flex items-center justify-center text-[#E8D08B] shrink-0 mt-0.5">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#FBF7EE]">
                      {isHi ? 'तेज़ चेकआउट' : 'Faster Doorstep Checkout'}
                    </p>
                    <p className="text-[11px] text-[#FBF7EE]/70 leading-relaxed">
                      {isHi
                        ? 'सहेजे गए पते व पिनकोड से 1-क्लिक ऑर्डर रीऑर्डर।'
                        : 'Saved delivery addresses and auto-filled details for instant reorders.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#155742] border border-[#C9A24B]/40 flex items-center justify-center text-[#E8D08B] shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#FBF7EE]">
                      {isHi ? 'लाइव ऑर्डर ट्रैकिंग' : 'Live Order Tracking'}
                    </p>
                    <p className="text-[11px] text-[#FBF7EE]/70 leading-relaxed">
                      {isHi
                        ? '7-चरणीय डिलीवरी स्थिति व पक्की डिजिटल रसीद।'
                        : '7-stage kitchen dispatch timeline & verified order receipts.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#155742] border border-[#C9A24B]/40 flex items-center justify-center text-[#E8D08B] shrink-0 mt-0.5">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#FBF7EE]">
                      {isHi ? 'पसंदीदा विशलिस्ट' : 'Personalized Wishlist'}
                    </p>
                    <p className="text-[11px] text-[#FBF7EE]/70 leading-relaxed">
                      {isHi
                        ? 'त्योहारों व दैनिक उपयोग के लिए अपनी पसंदीदा मिठाइयां सहेजें।'
                        : 'Keep track of your favorite ghee jars, combos, and festive treats.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Trust Footer */}
            <div className="relative z-10 pt-4 mt-4 border-t border-[#C9A24B]/20 text-[10px] sm:text-[11px] text-[#E8D08B]/80 flex flex-wrap items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C9A24B]" />
                Anand Bazar, Danapur
              </span>
              <span>Daily 9 AM – 9 PM</span>
              <span className="flex items-center gap-1 font-semibold text-[#FBF7EE]">
                ★ 4.9 (169 Google Reviews)
              </span>
            </div>
          </div>

          {/* Right Form Card Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-[#FFFDF8]">
            <div className="max-w-md w-full mx-auto space-y-5">
              {/* Mobile-only compact brand header */}
              <div className="lg:hidden pb-3 border-b border-[#E6DEC9] flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7624]">
                  {STORE_CONFIG.brandDisplayName}
                </span>
                <Badge variant="gold" size="sm">
                  Anand Bazar, Danapur
                </Badge>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
                  {isHi ? 'ग्राहक साइन इन' : 'Customer Sign In'}
                </span>
                <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#0F3D2E]">
                  {isHi ? 'अपने खाते में प्रवेश करें' : t('pages.auth.loginTitle')}
                </h1>
                <p className="text-xs sm:text-sm text-[#5A554C]">
                  {isHi
                    ? 'ऑर्डर ट्रैक करने, पते प्रबंधित करने और तेजी से खरीदारी के लिए साइन इन करें।'
                    : t('pages.auth.loginSubtitle')}
                </p>
              </div>

              {/* Form Error Banner */}
              {formError && (
                <div
                  role="alert"
                  className="rounded-[14px] bg-[#FDF1EE] border border-[#8C2D19]/35 p-3.5 text-xs text-[#8C2D19] flex items-start gap-2.5 font-medium"
                >
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* API / Offline Feedback */}
              {apiFeedback && (
                <div
                  role="status"
                  className="rounded-[14px] bg-[#F3EAD7] border border-[#E6DEC9] p-3.5 text-xs text-[#0F3D2E] flex items-start gap-2.5 font-medium"
                >
                  <Info className="w-4 h-4 text-[#9A7624] shrink-0 mt-0.5" />
                  <span>{apiFeedback}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <FloatingInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  label={t('pages.auth.emailLabel')}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  error={emailError}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <FloatingInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  label={t('pages.auth.passwordLabel')}
                  placeholder={
                    isHi
                      ? 'अपना पासवर्ड दर्ज करें'
                      : language === 'hinglish'
                        ? 'Apna password daalein'
                        : 'Enter your password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  error={passwordError}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="p-1 rounded-full text-[#7A7468] hover:text-[#0F3D2E] transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  required
                />

                {/* Free Visual Captcha Widget */}
                <CaptchaWidget
                  onChange={handleCaptchaChange}
                  resetTrigger={captchaResetCount}
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-full bg-[#0F3D2E] text-[#FBF7EE] text-sm font-semibold hover:bg-[#155742] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 gg-shadow-sm cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#FBF7EE] border-t-transparent rounded-full animate-spin" />
                        <span>{t('common.loading')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('pages.auth.signInBtn')}</span>
                        <ArrowRight className="w-4 h-4 text-[#E8D08B]" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Ready-for-future Social Login Placeholder (hidden by default) */}
              {SHOW_SOCIAL_LOGIN_PLACEHOLDER && (
                <div className="space-y-3 pt-2" aria-hidden="true">
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-[#E6DEC9] w-full" />
                    <span className="bg-[#FFFDF8] px-3 text-[11px] uppercase tracking-wider text-[#7A7468]">
                      or continue with
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled
                      className="py-2.5 px-3 rounded-full border border-[#E6DEC9] text-xs font-semibold text-[#5A554C] flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                    >
                      <span>Google</span>
                    </button>
                    <button
                      type="button"
                      disabled
                      className="py-2.5 px-3 rounded-full border border-[#E6DEC9] text-xs font-semibold text-[#5A554C] flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                    >
                      <span>Mobile OTP</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Footer Switcher */}
              <div className="pt-4 border-t border-[#E6DEC9] text-center text-xs text-[#5A554C]">
                <p>
                  {t('pages.auth.noAccount')}{' '}
                  <Link
                    to={registerHref}
                    className="font-semibold text-[#0F3D2E] hover:text-[#9A7624] underline underline-offset-4"
                  >
                    {isHi ? 'खाता बनाएं' : 'Create an Account'}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
