import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
} from 'lucide-react';
import { Badge, Button, FloatingInput, JaaliPattern } from '../components/ui';
import CaptchaWidget from '../components/auth/CaptchaWidget';
import { useAuth } from '../context/AuthContext';
import { STORE_CONFIG } from '../config/storeConfig';
import { useLanguage } from '../context/LanguageContext';

const SHOW_SOCIAL_LOGIN_PLACEHOLDER = false;

function getSafeRedirect(rawNext) {
  if (!rawNext || !rawNext.startsWith('/') || rawNext.startsWith('//')) {
    return '/account';
  }
  return rawNext;
}

function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: 'None', color: 'bg-transparent' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { score: 1, label: 'Weak', color: 'bg-[#B84A24]', textClass: 'text-[#B84A24]' };
  }
  if (score <= 3) {
    return { score: 2, label: 'Medium', color: 'bg-[#C9A24B]', textClass: 'text-[#9A7624]' };
  }
  return { score: 3, label: 'Strong', color: 'bg-[#0F3D2E]', textClass: 'text-[#0F3D2E]' };
}

export default function RegisterPage() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [apiFeedback, setApiFeedback] = useState('');
  const [captchaData, setCaptchaData] = useState({ captchaToken: '', captchaAnswer: '' });
  const [captchaResetCount, setCaptchaResetCount] = useState(0);

  const handleCaptchaChange = useCallback((val) => {
    setCaptchaData(val);
    setFormError('');
  }, []);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get('next');
  const redirectTarget = getSafeRedirect(rawNext);

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(form.password),
    [form.password]
  );

  // Field validations
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const phoneClean = form.phone.replace(/[^0-9]/g, '');
  const phoneValid = /^(?:(?:\+|0{0,2})91[\s-]*)?[6-9]\d{9}$/.test(form.phone.trim()) || phoneClean.length === 10;
  const passwordMatch = Boolean(form.password && form.password === form.confirmPassword);

  const nameError =
    touched.name && !form.name.trim()
      ? isHi
        ? 'कृपया अपना पूरा नाम दर्ज करें।'
        : 'Please enter your full name.'
      : '';

  const emailError =
    touched.email && !form.email.trim()
      ? isHi
        ? 'कृपया अपना ईमेल पता दर्ज करें।'
        : 'Please enter your email address.'
      : touched.email && !emailValid
        ? isHi
          ? 'कृपया मान्य ईमेल पता दर्ज करें।'
          : 'Please enter a valid email address.'
        : '';

  const phoneError =
    touched.phone && !form.phone.trim()
      ? isHi
        ? 'कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें।'
        : 'Please enter your mobile number.'
      : touched.phone && !phoneValid
        ? isHi
          ? 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें (+91 या 6-9 से शुरू)।'
          : 'Please enter a valid 10-digit Indian mobile number.'
        : '';

  const passwordError =
    touched.password && !form.password
      ? isHi
        ? 'कृपया पासवर्ड दर्ज करें।'
        : 'Please enter a password.'
      : touched.password && form.password.length < 8
        ? isHi
          ? 'पासवर्ड कम से कम 8 वर्णों का होना चाहिए।'
          : 'Password must be at least 8 characters long.'
        : '';

  const confirmError =
    touched.confirmPassword && !form.confirmPassword
      ? isHi
        ? 'कृपया पासवर्ड की पुष्टि करें।'
        : 'Please confirm your password.'
      : touched.confirmPassword && form.password !== form.confirmPassword
        ? isHi
          ? 'पासवर्ड मेल नहीं खा रहे हैं।'
          : 'Passwords do not match.'
        : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setApiFeedback('');
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      setFormError('Please fill in your name, email, mobile number, and password.');
      return;
    }
    if (!emailValid) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (!phoneValid) {
      setFormError('Please provide a valid 10-digit Indian mobile number.');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFormError('Password and confirmation password do not match.');
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

    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
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
        setApiFeedback(result.error?.message || 'Unable to create account right now.');
      }
    }
  };

  const loginHref = rawNext
    ? `/login?next=${encodeURIComponent(rawNext)}`
    : '/login';

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FBF7EE] py-5 sm:py-8 lg:py-8 flex items-center justify-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-[28px] border border-[#E6DEC9] bg-[#FFFDF8] overflow-hidden gg-shadow-lg grid grid-cols-1 lg:grid-cols-12 w-full">
          {/* Left Brand Showcase Column */}
          <div className="lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-[#0F3D2E] via-[#0A2B20] to-[#071F17] text-[#FBF7EE] p-6 sm:p-7 lg:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#C9A24B]/30">
            <JaaliPattern variant="tile" opacity={0.07} />

            <div
              aria-hidden="true"
              className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#C9A24B]/15 blur-3xl pointer-events-none"
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
                  {isHi ? 'गोकुल परिवार से जुड़ें' : `Join ${STORE_CONFIG.brandDisplayName}`}
                </h2>
                <p className="text-xs text-[#E8D08B]/90 leading-relaxed">
                  {isHi
                    ? 'दानापुर व पटना के किसी भी पते पर ताज़ा देसी घी, पारंपरिक खोया मिठाई व स्वादिष्ट नमकीन मंगाएं।'
                    : 'Create your account to unlock personalized recommendations, seamless reorders, and fast doorstep delivery.'}
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
                      {isHi ? 'दानापुर व पटना में ताज़ा डिलीवरी' : 'Local Patna & Danapur Dispatch'}
                    </p>
                    <p className="text-[11px] text-[#FBF7EE]/70 leading-relaxed">
                      {isHi
                        ? 'आनंद बाजार काउंटर से उसी दिन या अगले दिन ताज़ा पैकिंग।'
                        : 'Same-day or next-day delivery from our Anand Bazar kitchen counter.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#155742] border border-[#C9A24B]/40 flex items-center justify-center text-[#E8D08B] shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#FBF7EE]">
                      {isHi ? 'सत्यापित रसीद व इतिहास' : 'Verified Receipts & Tracking'}
                    </p>
                    <p className="text-[11px] text-[#FBF7EE]/70 leading-relaxed">
                      {isHi
                        ? 'अपने सभी पिछले ऑर्डर और रसीद एक जगह सुरक्षित देखें।'
                        : 'Follow each order through 7 fulfillment stages with digital receipts.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#155742] border border-[#C9A24B]/40 flex items-center justify-center text-[#E8D08B] shrink-0 mt-0.5">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#FBF7EE]">
                      {isHi ? 'पसंदीदा व विशलिस्ट' : 'Curated Favorites'}
                    </p>
                    <p className="text-[11px] text-[#FBF7EE]/70 leading-relaxed">
                      {isHi
                        ? 'दिवाली, छठ और विशेष अवसरों के लिए पसंदीदा पैक सहेजें।'
                        : 'Save preferred jar sizes and festive sweets for easy holiday gifting.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-4 border-t border-[#C9A24B]/20 text-[10px] sm:text-[11px] text-[#E8D08B]/80 flex flex-wrap items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C9A24B]" />
                Math Road, Anand Bazar
              </span>
              <span>Open Daily: 9 AM – 9 PM</span>
              <span className="font-semibold text-[#FBF7EE]">★ 4.9 Rated</span>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-[#FFFDF8]">
            <div className="max-w-md w-full mx-auto space-y-5">
              {/* Mobile-only compact brand header */}
              <div className="lg:hidden pb-3 border-b border-[#E6DEC9] flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7624]">
                  {STORE_CONFIG.brandDisplayName}
                </span>
                <Badge variant="gold" size="sm">
                  Danapur Cantonment
                </Badge>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
                  {isHi ? 'नया खाता बनाएं' : 'Customer Registration'}
                </span>
                <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#0F3D2E]">
                  {isHi ? 'खाता बनाएं' : t('pages.auth.registerTitle')}
                </h1>
                <p className="text-xs sm:text-sm text-[#5C5951]">
                  {isHi
                    ? 'ताज़ा देसी घी और पारंपरिक मिठाइयों के त्वरित ऑर्डर के लिए रजिस्टर करें।'
                    : t('pages.auth.registerSubtitle')}
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

              {/* Registration Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <FloatingInput
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  label={t('pages.auth.nameLabel')}
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  error={nameError}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                <FloatingInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  label={t('pages.auth.emailLabel')}
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  error={emailError}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <FloatingInput
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  label="Mobile Number (India)"
                  placeholder="+91 98XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                  error={phoneError}
                  leftIcon={<Phone className="w-4 h-4" />}
                  hint="Used for doorstep delivery calls and order confirmations."
                  required
                />

                <div className="space-y-2">
                  <FloatingInput
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    label="Password (min 8 characters)"
                    placeholder="Create a secure password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    required
                  />

                  {/* Password Strength Meter */}
                  {form.password && (
                    <div className="space-y-1.5 px-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#5A554C]">Password Strength:</span>
                        <span className={`font-semibold ${passwordStrength.textClass}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                        <div
                          className={`rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 1 ? passwordStrength.color : 'bg-[#E6DEC9]'
                          }`}
                        />
                        <div
                          className={`rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 2 ? passwordStrength.color : 'bg-[#E6DEC9]'
                          }`}
                        />
                        <div
                          className={`rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 3 ? passwordStrength.color : 'bg-[#E6DEC9]'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <FloatingInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                  error={confirmError}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="p-1 rounded-full text-[#7A7468] hover:text-[#0F3D2E] transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? (
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
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
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
                      or sign up with
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
                  Already have an account?{' '}
                  <Link
                    to={loginHref}
                    className="font-semibold text-[#0F3D2E] hover:text-[#9A7624] underline underline-offset-4"
                  >
                    Sign In
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
