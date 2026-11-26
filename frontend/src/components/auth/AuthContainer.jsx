import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  User,
} from 'lucide-react';
import JaaliPattern from '../ui/JaaliPattern';
import TurnstileWidget from './TurnstileWidget';
import { useAuth } from '../../context/AuthContext';
import { STORE_CONFIG } from '../../config/storeConfig';
import { useLanguage } from '../../context/LanguageContext';

/* =========================================================================
   DIYA FLAME / GHEE DROP ANIMATED ICON
   ========================================================================= */
function DiyaGheeIcon({ reducedMotion = false }) {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
        {/* Diya Clay Base */}
        <path
          d="M6 22C6 27.52 11.37 31 18 31C24.63 31 30 27.52 30 22C30 20.5 29 19.5 27 19.5H9C7 19.5 6 20.5 6 22Z"
          fill="url(#diyaGoldGrad)"
          stroke="#9A7624"
          strokeWidth="1.2"
        />
        {/* Golden Ghee Pool */}
        <ellipse cx="18" cy="20.5" rx="8.5" ry="1.8" fill="#FDE68A" />
        {/* Diya Flame */}
        <motion.path
          d="M18 5C18 5 13 11 13 15C13 17.76 15.24 20 18 20C20.76 20 23 17.76 23 15C23 11 18 5 18 5Z"
          fill="url(#flameGrad)"
          animate={
            reducedMotion
              ? {}
              : {
                  scale: [1, 1.15, 0.95, 1.08, 1],
                  opacity: [0.92, 1, 0.88, 1, 0.92],
                  filter: [
                    'drop-shadow(0 0 3px #F59E0B)',
                    'drop-shadow(0 0 9px #F59E0B)',
                    'drop-shadow(0 0 3px #F59E0B)',
                  ],
                }
          }
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="diyaGoldGrad" x1="6" y1="20" x2="30" y2="31" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C9A24B" />
            <stop offset="1" stopColor="#8C6826" />
          </linearGradient>
          <linearGradient id="flameGrad" x1="18" y1="5" x2="18" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* =========================================================================
   LIGHTWEIGHT UPWARD-FLOATING GOLD SPARKLE PARTICLES (max 15, CSS only)
   ========================================================================= */
function GoldSparkleParticles({ reducedMotion }) {
  if (reducedMotion) return null;

  const particles = [
    { id: 1, left: '8%', bottom: '20%', size: 4, dur: 4.8, delay: 0 },
    { id: 2, left: '20%', bottom: '35%', size: 3, dur: 5.4, delay: 1.2 },
    { id: 3, left: '32%', bottom: '15%', size: 5, dur: 4.2, delay: 0.5 },
    { id: 4, left: '46%', bottom: '48%', size: 3, dur: 5.8, delay: 2.1 },
    { id: 5, left: '58%', bottom: '26%', size: 4, dur: 4.5, delay: 1.6 },
    { id: 6, left: '70%', bottom: '62%', size: 3, dur: 6.0, delay: 0.3 },
    { id: 7, left: '82%', bottom: '18%', size: 4, dur: 5.1, delay: 2.4 },
    { id: 8, left: '92%', bottom: '42%', size: 5, dur: 4.9, delay: 1.5 },
    { id: 9, left: '14%', bottom: '68%', size: 3, dur: 5.9, delay: 2.7 },
    { id: 10, left: '26%', bottom: '78%', size: 4, dur: 4.7, delay: 0.9 },
    { id: 11, left: '40%', bottom: '60%', size: 3, dur: 5.3, delay: 1.9 },
    { id: 12, left: '54%', bottom: '82%', size: 4, dur: 4.4, delay: 1.7 },
    { id: 13, left: '66%', bottom: '12%', size: 3, dur: 5.6, delay: 0.4 },
    { id: 14, left: '76%', bottom: '76%', size: 4, dur: 5.0, delay: 2.5 },
    { id: 15, left: '88%', bottom: '86%', size: 3, dur: 5.2, delay: 1.1 },
  ];

  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden sm:block">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[#F5E6BA]"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 6px 1px #F5E6BA, 0 0 12px 2px #C9A24B',
            animation: `gg-sparkle-float-up ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* =========================================================================
   FLOATING PRODUCT SHOWCASE (Ghee Jar, Mithai, Samosa)
   ========================================================================= */
function FloatingProductShowcase({ reducedMotion }) {
  return (
    <div className="relative w-full h-32 my-3 flex items-center justify-center pointer-events-none select-none">
      {/* Central Ambient Gold Glow */}
      <div className="absolute w-44 h-44 rounded-full bg-[#C9A24B]/20 blur-2xl" />

      {/* Hero Ghee Jar (Center) */}
      <motion.div
        className="relative z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#E8D08B]/80 shadow-[0_12px_28px_rgba(201,162,75,0.38)] bg-[#072419]"
        animate={reducedMotion ? {} : { y: [-6, 6, -6], rotate: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 4.6, ease: 'easeInOut' }}
      >
        <img
          src="/images/cat-desi-ghee.jpg"
          alt="Bilona Desi Ghee"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 py-0.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-[9px] font-bold text-[#E8D08B] text-center tracking-wider uppercase">
          Bilona Ghee
        </div>
      </motion.div>

      {/* Mithai Plate (Left float) */}
      <motion.div
        className="absolute -left-1 sm:left-2 z-10 w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#E8D08B]/60 shadow-[0_8px_20px_rgba(201,162,75,0.25)] bg-[#072419]"
        animate={reducedMotion ? {} : { y: [7, -7, 7], rotate: [2.5, -2, 2.5] }}
        transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut', delay: 0.3 }}
      >
        <img
          src="/images/cat-mithai.jpg"
          alt="Khoya Mithai"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 py-0.5 bg-gradient-to-t from-black/85 to-transparent text-[8px] font-bold text-[#E8D08B] text-center tracking-wider uppercase">
          Khoya Sweets
        </div>
      </motion.div>

      {/* Samosa Snacks (Right float) */}
      <motion.div
        className="absolute -right-1 sm:right-2 z-10 w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#E8D08B]/60 shadow-[0_8px_20px_rgba(201,162,75,0.25)] bg-[#072419]"
        animate={reducedMotion ? {} : { y: [-5, 7, -5], rotate: [-3, 1.5, -3] }}
        transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut', delay: 0.7 }}
      >
        <img
          src="/images/cat-samosa.jpg"
          alt="Desi Ghee Snacks"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 py-0.5 bg-gradient-to-t from-black/85 to-transparent text-[8px] font-bold text-[#E8D08B] text-center tracking-wider uppercase">
          Crispy Snacks
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================================
   TESTIMONIAL / BENEFIT ROTATOR (Fades & slides every 4 seconds)
   ========================================================================= */
function BenefitRotator({ reducedMotion }) {
  const benefits = useMemo(
    () => [
      {
        title: 'Fresh from Anand Bazar kitchen',
        desc: 'Pure Bilona Desi Ghee & traditional Khoya sweets crafted fresh in Danapur.',
        icon: Truck,
      },
      {
        title: 'Track every order',
        desc: '7-stage kitchen dispatch timeline & tamper-evident verified receipts.',
        icon: ShieldCheck,
      },
      {
        title: 'Save your favourites',
        desc: '1-click quick reorders for daily cooking, puja & festive celebrations.',
        icon: Heart,
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % benefits.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [benefits.length]);

  const current = benefits[index];
  const IconComp = current.icon;

  return (
    <div className="w-full min-h-[74px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-[#155742] border border-[#C9A24B]/40 flex items-center justify-center text-[#E8D08B] shrink-0 mt-0.5 shadow-sm">
            <IconComp className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[#FBF7EE]">{current.title}</p>
            <p className="text-[11px] text-[#FBF7EE]/75 leading-relaxed">{current.desc}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="flex items-center gap-1.5 pt-2 pl-11">
        {benefits.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Benefit slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-5 bg-[#E8D08B]' : 'w-1.5 bg-[#E8D08B]/30 hover:bg-[#E8D08B]/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   GOOGLE ICON (Official 4-Color SVG)
   ========================================================================= */
function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/* =========================================================================
   ANIMATED FLOATING INPUT COMPONENT
   Floating labels, gold focus ring, smooth icon colour change
   ========================================================================= */
function AnimatedAuthInput({
  id,
  name,
  label,
  type = 'text',
  value = '',
  onChange,
  error,
  leftIcon = null,
  rightSlot = null,
  prefix = null,
  required = false,
  autoComplete,
  placeholder = '',
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || Boolean(value && String(value).length > 0);

  return (
    <div className="space-y-1">
      <div
        className={`relative flex items-center rounded-2xl transition-all duration-200 border ${
          error
            ? 'bg-white/95 border-[#8C2D19] ring-2 ring-[#8C2D19]/25 shadow-xs'
            : isFocused
              ? 'bg-white border-[#C9A24B] ring-2 ring-[#C9A24B]/40 shadow-[0_0_14px_rgba(201,162,75,0.22)]'
              : 'bg-white/75 hover:bg-white/90 border-[#E6DEC9]/90 hover:border-[#C9A24B]/60 shadow-xs'
        }`}
      >
        {/* Left Icon with color transition */}
        {leftIcon && (
          <div
            aria-hidden="true"
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none z-10 ${
              error
                ? 'text-[#8C2D19]'
                : isFocused
                  ? 'text-[#C9A24B]'
                  : 'text-[#7A7468]'
            }`}
          >
            {leftIcon}
          </div>
        )}

        {/* Optional input prefix badge (e.g. +91) */}
        {prefix && (
          <div className="absolute left-10 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-xs font-bold text-[#0F3D2E] bg-[#F3EAD7]/90 px-1.5 py-0.5 rounded border border-[#C9A24B]/30">
            {prefix}
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          name={name || inputId}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder || ' '}
          className={`w-full min-h-[52px] rounded-2xl bg-transparent text-sm text-[#1B1B1B] font-medium transition-all duration-200 placeholder:text-transparent focus:outline-none pt-4.5 pb-1 ${
            leftIcon ? (prefix ? 'pl-21' : 'pl-10.5') : 'pl-4'
          } ${rightSlot ? 'pr-11' : 'pr-4'}`}
        />

        {/* Floating Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`absolute pointer-events-none transition-all duration-200 select-none truncate ${
              leftIcon ? (prefix ? 'left-21' : 'left-10.5') : 'left-4'
            } ${rightSlot ? 'right-11' : 'right-4'} ${
              isFloating
                ? 'top-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9A7624]'
                : 'top-1/2 -translate-y-1/2 text-xs font-medium text-[#7A7468]'
            } ${error ? '!text-[#8C2D19]' : ''}`}
          >
            {label}
            {required && <span className="text-[#8C2D19] ml-0.5">*</span>}
          </label>
        )}

        {/* Right Slot (e.g. show/hide password) */}
        {rightSlot && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex items-center">
            {rightSlot}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-[#8C2D19] pl-1 pt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================================
   PASSWORD STRENGTH CALCULATOR
   ========================================================================= */
function checkPasswordStrength(password) {
  if (!password) {
    return { score: 0, label: '', color: 'bg-transparent', hasMinLen: false, hasNum: false, hasUpperOrSym: false };
  }

  const hasMinLen = password.length >= 8;
  const hasNum = /[0-9]/.test(password);
  const hasUpperOrSym = /[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLen) score += 1;
  if (password.length >= 12) score += 1;
  if (hasNum) score += 1;
  if (hasUpperOrSym) score += 1;

  if (score <= 1) {
    return { score: 1, label: 'Weak', color: 'bg-[#DC2626]', hasMinLen, hasNum, hasUpperOrSym };
  }
  if (score === 2) {
    return { score: 2, label: 'Fair', color: 'bg-[#EA580C]', hasMinLen, hasNum, hasUpperOrSym };
  }
  if (score === 3) {
    return { score: 3, label: 'Good', color: 'bg-[#D97706]', hasMinLen, hasNum, hasUpperOrSym };
  }
  return { score: 4, label: 'Strong', color: 'bg-[#059669]', hasMinLen, hasNum, hasUpperOrSym };
}

function getSafeRedirect(rawNext) {
  if (!rawNext || !rawNext.startsWith('/') || rawNext.startsWith('//')) {
    return '/account';
  }
  return rawNext;
}

// Framer motion variants for form stagger entrance
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.06,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/* =========================================================================
   MAIN UNIFIED AUTH CONTAINER (GLASSMORPHISM REDESIGN)
   ========================================================================= */
export default function AuthContainer({ initialMode = 'login' }) {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const reducedMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState(initialMode);
  const { login, register, googleLogin, isLoading } = useAuth();
  const hasTurnstileKey = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get('next');
  const redirectTarget = getSafeRedirect(rawNext);

  // Sync mode with route if needed
  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  const switchTab = (mode) => {
    setActiveTab(mode);
    setFormError('');
    setApiFeedback('');
    setShowGooglePrompt(false);
    // Seamless URL update without page flash
    const targetUrl = rawNext
      ? `/${mode}?next=${encodeURIComponent(rawNext)}`
      : `/${mode}`;
    navigate(targetUrl, { replace: true });
  };

  // Shared State
  const [formError, setFormError] = useState('');
  const [apiFeedback, setApiFeedback] = useState('');
  const [googleNotice, setGoogleNotice] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaData, setCaptchaData] = useState({ captchaToken: '', captchaAnswer: '' });
  const [captchaResetCount, setCaptchaResetCount] = useState(0);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginTouched, setLoginTouched] = useState({});

  // Register form state
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regTouched, setRegTouched] = useState({});

  const handleCaptchaChange = useCallback((val) => {
    setCaptchaData(val);
    setFormError('');
  }, []);

  // Login validation
  const loginEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim());
  const loginEmailError =
    loginTouched.email && !loginEmail.trim()
      ? isHi
        ? 'कृपया अपना ईमेल पता दर्ज करें।'
        : 'Please enter your email address.'
      : loginTouched.email && !loginEmailValid
        ? isHi
          ? 'कृपया मान्य ईमेल पता दर्ज करें।'
          : 'Please enter a valid email address.'
        : '';
  const loginPasswordError =
    loginTouched.password && !loginPassword
      ? isHi
        ? 'कृपया पासवर्ड दर्ज करें।'
        : 'Please enter your password.'
      : '';

  // Register validation
  const regEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email.trim());
  const regPhoneClean = regForm.phone.replace(/[^0-9]/g, '');
  const regPhoneValid =
    /^(?:(?:\+|0{0,2})91[\s-]*)?[6-9]\d{9}$/.test(regForm.phone.trim()) || regPhoneClean.length === 10;
  const passwordsMatch = Boolean(regForm.password && regForm.password === regForm.confirmPassword);
  const pwStrength = useMemo(() => checkPasswordStrength(regForm.password), [regForm.password]);

  const regNameError =
    regTouched.name && !regForm.name.trim()
      ? isHi
        ? 'कृपया अपना नाम दर्ज करें।'
        : 'Please enter your full name.'
      : '';
  const regEmailError =
    regTouched.email && !regForm.email.trim()
      ? isHi
        ? 'कृपया ईमेल पता दर्ज करें।'
        : 'Please enter your email address.'
      : regTouched.email && !regEmailValid
        ? isHi
          ? 'कृपया मान्य ईमेल पता दर्ज करें।'
          : 'Please enter a valid email address.'
        : '';
  const regPhoneError =
    regTouched.phone && !regForm.phone.trim()
      ? isHi
        ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।'
        : 'Please enter your mobile number.'
      : regTouched.phone && !regPhoneValid
        ? isHi
          ? 'कृपया मान्य 10 अंकों का भारतीय नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit mobile number.'
        : '';
  const regPasswordError =
    regTouched.password && !regForm.password
      ? isHi
        ? 'कृपया पासवर्ड दर्ज करें।'
        : 'Please enter a password.'
      : regTouched.password && regForm.password.length < 8
        ? isHi
          ? 'पासवर्ड कम से कम 8 वर्णों का होना चाहिए।'
          : 'Password must be at least 8 characters long.'
        : '';
  const regConfirmError =
    regTouched.confirmPassword && !regForm.confirmPassword
      ? isHi
        ? 'कृपया पासवर्ड की पुष्टि करें।'
        : 'Please confirm your password.'
      : regTouched.confirmPassword && !passwordsMatch
        ? isHi
          ? 'पासवर्ड मेल नहीं खा रहे हैं।'
          : 'Passwords do not match.'
        : '';

  /* ---------------- Login Submit ---------------- */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setApiFeedback('');
    setLoginTouched({ email: true, password: true });

    if (!loginEmail.trim() || !loginPassword) {
      setFormError(
        isHi
          ? 'कृपया अपना ईमेल पता और पासवर्ड दोनों दर्ज करें।'
          : isHinglish
            ? 'Kripya apna email aur password dono daalein.'
            : 'Please enter both your email address and password.'
      );
      return;
    }

    if (!loginEmailValid) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (hasTurnstileKey) {
      if (!captchaData.captchaToken && !captchaData.turnstileToken) {
        setFormError(
          isHi
            ? 'कृपया सुरक्षा सत्यापन (Cloudflare Turnstile) पूरा करें।'
            : 'Please complete the security verification before submitting.'
        );
        return;
      }
    } else if (!captchaData.captchaAnswer || captchaData.captchaAnswer.length < 5) {
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
      email: loginEmail.trim(),
      password: loginPassword,
      captchaToken: captchaData.captchaToken,
      captchaAnswer: captchaData.captchaAnswer,
      turnstileToken: captchaData.turnstileToken,
    });

    if (result.ok) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate(redirectTarget);
      }, 500);
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

  /* ---------------- Register Submit ---------------- */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setApiFeedback('');
    setRegTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (!regForm.name.trim() || !regForm.email.trim() || !regForm.phone.trim() || !regForm.password) {
      setFormError('Please fill in your name, email, mobile number, and password.');
      return;
    }
    if (!regEmailValid) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (!regPhoneValid) {
      setFormError('Please provide a valid 10-digit Indian mobile number.');
      return;
    }
    if (regForm.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (!passwordsMatch) {
      setFormError('Password and confirmation password do not match.');
      return;
    }

    if (hasTurnstileKey) {
      if (!captchaData.captchaToken && !captchaData.turnstileToken) {
        setFormError(
          isHi
            ? 'कृपया सुरक्षा सत्यापन (Cloudflare Turnstile) पूरा करें।'
            : 'Please complete the security verification before submitting.'
        );
        return;
      }
    } else if (!captchaData.captchaAnswer || captchaData.captchaAnswer.length < 5) {
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
      name: regForm.name.trim(),
      email: regForm.email.trim(),
      phone: regForm.phone.trim(),
      password: regForm.password,
      captchaToken: captchaData.captchaToken,
      captchaAnswer: captchaData.captchaAnswer,
      turnstileToken: captchaData.turnstileToken,
    });

    if (result.ok) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate(redirectTarget);
      }, 500);
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

  /* ---------------- Google One-Tap & GIS Initialization ---------------- */
  const processGoogleAuth = useCallback(
    async ({ credential, email, name }) => {
      setIsGoogleLoading(true);
      setFormError('');
      setApiFeedback('');

      try {
        const res = await googleLogin({
          credential,
          email,
          name: name || (email ? email.split('@')[0] : 'Gokul Customer'),
        });

        if (res.ok) {
          setIsSuccess(true);
          setGoogleNotice(
            isHi
              ? 'गूगल द्वारा प्रमाणीकरण सफल! आपका स्वागत है...'
              : 'Google authentication successful! Redirecting...'
          );
          setTimeout(() => {
            navigate(redirectTarget);
          }, 500);
        } else {
          if (res.error?.isNetworkError) {
            setApiFeedback(
              isHi
                ? 'सर्वर से संपर्क नहीं हो सका। कृपया बाद में पुनः प्रयास करें।'
                : "Could not reach the server. Please check your connection and try again."
            );
          } else {
            setApiFeedback(res.error?.message || 'Google sign-in failed. Please try again.');
          }
        }
      } catch (err) {
        setApiFeedback(err.message || 'An error occurred during Google sign-in.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [googleLogin, isHi, navigate, redirectTarget]
  );

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId || typeof window === 'undefined') return;

    const setupGIS = () => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response?.credential) {
              await processGoogleAuth({ credential: response.credential });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Trigger Google One-Tap
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn('Google Identity initialization error:', err);
      }
    };

    if (window.google?.accounts?.id) {
      setupGIS();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          setupGIS();
        }
      }, 400);
      return () => clearInterval(timer);
    }
  }, [processGoogleAuth]);

  const handleGoogleSignIn = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      setApiFeedback(
        isHi
          ? 'सीधे Google का पॉप-अप खोलने के लिए Google Client ID आवश्यक है। कृपया .env में VITE_GOOGLE_CLIENT_ID सेट करें।'
          : 'To open Google Sign-in directly, please configure VITE_GOOGLE_CLIENT_ID in your environment.'
      );
      return;
    }

    // 1. Google OAuth2 Token Client: natively triggers authentic Google account popup
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              setIsGoogleLoading(true);
              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await userRes.json();
                if (profile?.email) {
                  await processGoogleAuth({
                    email: profile.email,
                    name: profile.name || profile.email.split('@')[0],
                  });
                } else {
                  setApiFeedback('Could not retrieve profile from Google.');
                }
              } catch {
                setApiFeedback('Failed to fetch Google profile info.');
              } finally {
                setIsGoogleLoading(false);
              }
            } else if (tokenResponse?.error) {
              setApiFeedback(`Google Sign-in error: ${tokenResponse.error}`);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Token client launch failed, falling back:', err);
      }
    }

    // 2. Google Identity Services One Tap prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    // 3. Direct Google OAuth2 popup fallback
    const redirectUri = window.location.origin + '/login';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account&nonce=${Date.now()}`;
    window.open(authUrl, 'GoogleSignIn', 'width=500,height=620,left=150,top=100');
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full py-6 sm:py-12 flex items-center justify-center px-3 sm:px-6 lg:px-8 overflow-hidden bg-[#031911]">
      {/* =================================================================
          FULL-VIEWPORT BLURRED BACKDROP
          - Large food photo with CSS filter: blur(24px)
          - Deep green gradient overlay (~70% opacity)
          - 3-4 soft blurred drifting blobs (blur 80px)
          - Rotating faint mandala at 5% opacity
          - Gold sparkle particles floating upward (max 15, CSS only)
         ================================================================= */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Divine Gokul Krishna & Sacred Cows Background Photo */}
        <img
          src="/images/krishna-gokul.jpg"
          alt="Shree Krishna with Sacred Cows in Gokul"
          className="absolute inset-0 w-full h-full object-cover object-center scale-110 filter blur-[10px] sm:blur-[14px] brightness-[0.72] contrast-[1.08]"
        />

        {/* Ambient Vedic Emerald & Forest Green Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02170F]/90 via-[#032317]/55 to-[#02170F]/85" />

        {/* 3-4 big soft blurred gold / emerald light blobs (blur 80px) */}
        {!reducedMotion && (
          <>
            {/* Blob 1: Soft Gold (Top-Left) */}
            <div className="absolute -top-16 -left-16 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#C9A24B]/35 blur-[80px] animate-blob-1" />
            {/* Blob 2: Vibrant Emerald (Bottom-Right) */}
            <div className="absolute -bottom-20 -right-20 w-96 sm:w-[440px] h-96 sm:h-[440px] rounded-full bg-[#059669]/30 blur-[85px] animate-blob-2" />
            {/* Blob 3: Warm Amber (Center-Right) */}
            <div className="absolute top-1/3 -right-12 w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-[#D97706]/25 blur-[80px] animate-blob-3" />
            {/* Blob 4: Deep Forest Green (Bottom-Left) */}
            <div className="absolute -bottom-16 left-1/4 w-80 h-80 rounded-full bg-[#0A4230]/40 blur-[80px] animate-blob-4" />
          </>
        )}

        {/* Faint jaali/mandala pattern at 5% opacity slowly rotating */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="w-[820px] h-[820px] opacity-[0.05]"
            animate={reducedMotion ? {} : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 160, ease: 'linear' }}
          >
            <JaaliPattern variant="mandala" opacity={1} />
          </motion.div>
        </div>

        {/* Small gold sparkle particles floating upward (max 15, CSS only) */}
        <GoldSparkleParticles reducedMotion={reducedMotion} />
      </div>

      {/* =================================================================
          MAIN AUTH CARD (FROSTED GLASS EFFECT)
          - background: rgba(255, 252, 245, 0.72)
          - backdrop-filter: blur(20px) saturate(140%)
          - 1px semi-transparent gold border
          - soft layered shadow, rounded 28px
          - Card entrance: fade-up + scale from 0.96
         ================================================================= */}
      <div className="relative z-10 max-w-5xl w-full">
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[28px] border border-[#C9A24B]/35 overflow-hidden grid grid-cols-1 lg:grid-cols-12 w-full gg-glass-card shadow-[0_25px_60px_-12px_rgba(0,0,0,0.38),0_0_35px_rgba(201,162,75,0.14)]"
          style={{
            backgroundColor: 'rgba(255, 252, 245, 0.72)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          }}
        >
          {/* =================================================================
              LEFT BRAND PANEL (Desktop & Tablet)
              Transparent deep green glass with floating products & benefit rotator
             ================================================================= */}
          <div
            className="hidden lg:flex lg:col-span-5 relative overflow-hidden text-[#FBF7EE] p-7 flex-col justify-between border-r border-[#C9A24B]/30 select-none gg-glass-brand-panel"
            style={{
              backgroundColor: 'rgba(4, 29, 20, 0.62)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {/* Drifting faint mandala accent */}
            <motion.div
              aria-hidden="true"
              className="absolute -top-16 -left-16 w-96 h-96 pointer-events-none opacity-20"
              animate={reducedMotion ? {} : { rotate: 360, y: [0, -8, 0] }}
              transition={{
                rotate: { repeat: Infinity, duration: 140, ease: 'linear' },
                y: { repeat: Infinity, duration: 9, ease: 'easeInOut' },
              }}
            >
              <JaaliPattern variant="mandala" opacity={0.65} />
            </motion.div>

            {/* Subtle background tile jaali */}
            <JaaliPattern variant="tile" opacity={0.05} />

            {/* Top Brand Identity */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D8B45E] via-[#C9A24B] to-[#8C6826] text-[#0F3D2E] flex items-center justify-center font-editorial font-bold text-lg shadow-md border border-[#E8D08B]/40">
                  ग
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#E8D08B] block">
                    {STORE_CONFIG.brandDisplayName}
                  </span>
                  <p className="font-editorial text-base font-bold text-[#FBF7EE] leading-tight">
                    {STORE_CONFIG.businessName}
                  </p>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#FBF7EE] leading-snug">
                  {isHi ? 'शुद्धता और स्वाद की परंपरा' : 'Tradition in Every Taste.'}
                </h2>
                <p className="text-xs text-[#E8D08B]/90 leading-relaxed">
                  {isHi
                    ? 'आनंद बाजार, दानापुर कैंट स्थित हमारी भट्टी से सीधे आपके घर तक ताज़ा देसी घी व शुद्ध मिठाइयां।'
                    : 'Authentic Bilona Desi Ghee & fresh handcrafted sweets from Danapur Cantonment.'}
                </p>
              </div>

              {/* Divine Gokul Heritage Showcase Card */}
              <div className="relative my-3 rounded-2xl overflow-hidden border border-[#E8D08B]/40 shadow-[0_12px_28px_rgba(0,0,0,0.45)] group bg-[#072419]">
                <img
                  src="/images/krishna-gokul.jpg"
                  alt="Lord Krishna with Sacred Cows in Gokul"
                  className="w-full h-44 object-cover object-[center_62%] scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02170F] via-[#02170F]/20 to-transparent" />
                <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#FDE68A] tracking-wide flex items-center gap-1.5 drop-shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8D08B] animate-pulse" />
                    श्री गोकुल धाम परंपरा
                  </span>
                  <span className="text-[10px] font-semibold text-[#FBF7EE] bg-[#0F3D2E]/85 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#C9A24B]/40">
                    100% शुद्ध देशी गाय का घी
                  </span>
                </div>
              </div>
            </div>

            {/* Rotating Benefit Testimonial Component */}
            <div className="relative z-10 pt-3 border-t border-[#C9A24B]/20">
              <BenefitRotator reducedMotion={reducedMotion} />
            </div>

            {/* Bottom Trust Row */}
            <div className="relative z-10 pt-3 mt-3 border-t border-[#C9A24B]/20 text-[10px] text-[#E8D08B]/85 flex flex-wrap items-center justify-between gap-1.5">
              <span className="flex items-center gap-1 font-bold text-[#FBF7EE]">
                <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                4.9 Google Rating
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#155742] border border-[#C9A24B]/30 text-[#E8D08B] font-medium">
                Since Danapur
              </span>
              <span className="flex items-center gap-1 text-[#FBF7EE]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B]" />
                FSSAI Certified
              </span>
            </div>
          </div>

          {/* =================================================================
              RIGHT FORM SIDE (Responsive with Animated Tab Switch)
             ================================================================= */}
          <div
            className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-center gg-glass-form-panel"
            style={{
              backgroundColor: 'rgba(255, 252, 245, 0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="max-w-md w-full mx-auto space-y-4">
              {/* Mobile-only compact animated brand header */}
              <div className="lg:hidden pb-3 border-b border-[#E6DEC9] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#C9A24B]/60 shadow-xs shrink-0 bg-[#072419]">
                    <img
                      src="/images/krishna-gokul.jpg"
                      alt="Gokul Heritage"
                      className="w-full h-full object-cover object-[center_45%]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9A7624] block">
                      {STORE_CONFIG.brandDisplayName}
                    </span>
                    <p className="text-[10px] text-[#5A554C]">Anand Bazar, Danapur • शुद्ध देशी घी</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#0F3D2E] bg-[#F3EAD7] px-2.5 py-1 rounded-full border border-[#C9A24B]/30">
                  <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                  <span>4.9 Rating</span>
                </div>
              </div>

              {/* Animated Tab Switcher ("Sign In" ⇄ "Create Account") */}
              <div className="relative flex items-center border-b border-[#E6DEC9] pt-1">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className={`relative flex-1 pb-3 text-center text-sm font-bold transition-colors cursor-pointer ${
                    activeTab === 'login' ? 'text-[#0F3D2E]' : 'text-[#7A7468] hover:text-[#0F3D2E]'
                  }`}
                >
                  {isHi ? 'साइन इन करें' : 'Sign In'}
                  {activeTab === 'login' && (
                    <motion.div
                      layoutId="authActiveTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#C9A24B] via-[#E8D08B] to-[#C9A24B] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className={`relative flex-1 pb-3 text-center text-sm font-bold transition-colors cursor-pointer ${
                    activeTab === 'register' ? 'text-[#0F3D2E]' : 'text-[#7A7468] hover:text-[#0F3D2E]'
                  }`}
                >
                  {isHi ? 'नया खाता बनाएं' : 'Create Account'}
                  {activeTab === 'register' && (
                    <motion.div
                      layoutId="authActiveTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#C9A24B] via-[#E8D08B] to-[#C9A24B] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              </div>

              {/* Header Greeting with Diya / Flame pulse animation */}
              <div className="flex items-center gap-3 pt-1">
                <DiyaGheeIcon reducedMotion={reducedMotion} />
                <div>
                  <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F3D2E] leading-tight">
                    {activeTab === 'login'
                      ? isHi
                        ? 'पुनः स्वागत है!'
                        : 'Welcome Back'
                      : isHi
                        ? 'गोकुल परिवार से जुड़ें'
                        : 'Create Your Account'}
                  </h1>
                  <p className="text-xs text-[#5A554C]">
                    {activeTab === 'login'
                      ? isHi
                        ? 'अपने ऑर्डर और पते प्रबंधित करने के लिए साइन इन करें।'
                        : 'Sign in to access your orders, wishlist, and faster checkout.'
                      : isHi
                        ? 'दानापुर व पटना के पते पर ताज़ा डिलीवरी के लिए रजिस्टर करें।'
                        : 'Join us for exclusive offers, live tracking, and personalized care.'}
                  </p>
                </div>
              </div>

              {/* Error shake banner */}
              {formError && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: -6, x: 0 }}
                  animate={
                    reducedMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 1, y: 0, x: [-8, 8, -6, 6, -3, 3, 0] }
                  }
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl bg-[#FDF1EE] border border-[#8C2D19]/35 p-3.5 text-xs text-[#8C2D19] flex items-start gap-2.5 font-medium shadow-xs"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </motion.div>
              )}

              {/* API / Network feedback banner */}
              {apiFeedback && (
                <div
                  role="status"
                  className="rounded-2xl bg-[#F3EAD7] border border-[#E6DEC9] p-3 text-xs text-[#0F3D2E] flex items-start gap-2.5 font-medium"
                >
                  <ShieldCheck className="w-4 h-4 text-[#9A7624] shrink-0 mt-0.5" />
                  <span>{apiFeedback}</span>
                </div>
              )}

              {/* Google Sign-in Full-Width Button & Interactive Dialog */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading || isSuccess}
                  className="w-full py-2.5 px-4 rounded-2xl border border-[#C9A24B]/35 bg-white/85 hover:bg-white text-xs font-semibold text-[#1B1B1B] flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xs hover:shadow hover:border-[#C9A24B]/70 cursor-pointer disabled:opacity-60 backdrop-blur-xs"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0F3D2E]" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span>
                    {isGoogleLoading
                      ? isHi
                        ? 'गूगल से जुड़ रहे हैं...'
                        : 'Connecting with Google...'
                      : isHi
                        ? 'Google के साथ जारी रखें'
                        : 'Continue with Google'}
                  </span>
                </button>

                {/* Optional temporary Google notice if clicked */}
                {googleNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-[#F3EAD7] border border-[#C9A24B]/40 px-3 py-2 text-[11px] text-[#0F3D2E] flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#9A7624] shrink-0" />
                      <span className="leading-tight">{googleNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGoogleNotice('')}
                      className="text-[#7A7468] hover:text-[#0F3D2E] text-sm font-bold px-1"
                      aria-label="Dismiss note"
                    >
                      ×
                    </button>
                  </motion.div>
                )}

                {/* Google Official Button Container (rendered when client ID is active) */}
                <div id="google-official-btn" className="w-full flex justify-center empty:hidden" />
              </div>

              {/* Centered 'OR WITH EMAIL' divider with balanced hairlines */}
              <div className="relative flex items-center justify-center my-3" aria-hidden="true">
                <div className="flex-grow border-t border-[#C9A24B]/30" />
                <span className="shrink-0 px-3 py-0.5 rounded-full bg-[#FFFDF8] border border-[#C9A24B]/25 text-[10px] uppercase font-bold tracking-widest text-[#9A7624] shadow-xs mx-2">
                  or with email
                </span>
                <div className="flex-grow border-t border-[#C9A24B]/30" />
              </div>

              {/* =============================================================
                  SLIDING FORM VIEW (Framer Motion AnimatePresence & Stagger)
                 ============================================================= */}
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === 'login' ? (
                  /* ---------------- SIGN IN FORM ---------------- */
                  <motion.form
                    key="login-form-view"
                    onSubmit={handleLoginSubmit}
                    noValidate
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    variants={formContainerVariants}
                    className="space-y-3.5"
                  >
                    <motion.div variants={formItemVariants}>
                      <AnimatedAuthInput
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        label={t('pages.auth.emailLabel') || 'Email Address'}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        error={loginEmailError}
                        leftIcon={<Mail className="w-4 h-4" />}
                        required
                      />
                    </motion.div>

                    <motion.div variants={formItemVariants}>
                      <AnimatedAuthInput
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        label={t('pages.auth.passwordLabel') || 'Password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        error={loginPasswordError}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightSlot={
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword((prev) => !prev)}
                            aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                            className="p-1 rounded-full text-[#7A7468] hover:text-[#0F3D2E] transition-colors focus:outline-none cursor-pointer"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                        required
                      />
                    </motion.div>

                    {/* Turnstile / Captcha full width */}
                    <motion.div variants={formItemVariants}>
                      <TurnstileWidget
                        onChange={handleCaptchaChange}
                        resetTrigger={captchaResetCount}
                      />
                    </motion.div>

                    {/* Submit Button with Gold Gradient & Shimmer Sweep */}
                    <motion.div variants={formItemVariants} className="pt-1">
                      <button
                        type="submit"
                        disabled={isLoading || isSuccess}
                        className="group relative w-full overflow-hidden py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C9A24B] via-[#E8D08B] to-[#C9A24B] text-[#0F3D2E] text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {/* Shimmer sweep overlay */}
                        {!reducedMotion && (
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                        )}

                        {isSuccess ? (
                          <motion.span
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 text-[#0A261B]"
                          >
                            <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                            <span>Signed In Successfully</span>
                          </motion.span>
                        ) : isLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-[#0F3D2E] border-t-transparent rounded-full animate-spin" />
                            <span>Signing In...</span>
                          </>
                        ) : (
                          <>
                            <span>{t('pages.auth.signInBtn') || 'Sign In to Account'}</span>
                            <ArrowRight className="w-4 h-4 text-[#0F3D2E]" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  </motion.form>
                ) : (
                  /* ---------------- REGISTER FORM ---------------- */
                  <motion.form
                    key="register-form-view"
                    onSubmit={handleRegisterSubmit}
                    noValidate
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    variants={formContainerVariants}
                    className="space-y-3"
                  >
                    <motion.div variants={formItemVariants}>
                      <AnimatedAuthInput
                        id="reg-name"
                        name="name"
                        label="Full Name"
                        value={regForm.name}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, name: e.target.value }))}
                        error={regNameError}
                        leftIcon={<User className="w-4 h-4" />}
                        autoComplete="name"
                        required
                      />
                    </motion.div>

                    <motion.div variants={formItemVariants}>
                      <AnimatedAuthInput
                        id="reg-email"
                        name="email"
                        type="email"
                        label="Email Address"
                        value={regForm.email}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, email: e.target.value }))}
                        error={regEmailError}
                        leftIcon={<Mail className="w-4 h-4" />}
                        autoComplete="email"
                        required
                      />
                    </motion.div>

                    {/* Mobile Number with +91 Formatting */}
                    <motion.div variants={formItemVariants}>
                      <AnimatedAuthInput
                        id="reg-phone"
                        name="phone"
                        type="tel"
                        label="Mobile Number (India)"
                        value={regForm.phone}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, phone: e.target.value }))}
                        error={regPhoneError}
                        leftIcon={<Phone className="w-4 h-4" />}
                        prefix="+91"
                        autoComplete="tel"
                        required
                      />
                    </motion.div>

                    {/* Password */}
                    <motion.div variants={formItemVariants} className="space-y-1.5">
                      <AnimatedAuthInput
                        id="reg-password"
                        name="password"
                        type={showRegPassword ? 'text' : 'password'}
                        label="Password (min 8 characters)"
                        value={regForm.password}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, password: e.target.value }))}
                        error={regPasswordError}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightSlot={
                          <button
                            type="button"
                            onClick={() => setShowRegPassword((prev) => !prev)}
                            aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                            className="p-1 rounded-full text-[#7A7468] hover:text-[#0F3D2E] transition-colors focus:outline-none cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                        autoComplete="new-password"
                        required
                      />

                      {/* Animated Password Strength Bar & Checklist */}
                      {regForm.password && (
                        <div className="space-y-1.5 pt-0.5 px-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#5A554C]">Password Strength:</span>
                            <span className="font-bold text-[#0F3D2E]">{pwStrength.label}</span>
                          </div>
                          {/* Segmented bar */}
                          <div className="h-1.5 w-full bg-[#E6DEC9] rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${pwStrength.color}`}
                              initial={{ width: 0 }}
                              animate={{
                                width:
                                  pwStrength.score === 1
                                    ? '25%'
                                    : pwStrength.score === 2
                                      ? '50%'
                                      : pwStrength.score === 3
                                        ? '75%'
                                        : '100%',
                              }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          {/* Checklist Ticks */}
                          <div className="grid grid-cols-3 gap-1 pt-0.5 text-[10px]">
                            <span
                              className={`flex items-center gap-1 ${
                                pwStrength.hasMinLen ? 'text-[#059669] font-semibold' : 'text-[#7A7468]'
                              }`}
                            >
                              <Check className={`w-3 h-3 ${pwStrength.hasMinLen ? 'opacity-100' : 'opacity-40'}`} />
                              8+ chars
                            </span>
                            <span
                              className={`flex items-center gap-1 ${
                                pwStrength.hasNum ? 'text-[#059669] font-semibold' : 'text-[#7A7468]'
                              }`}
                            >
                              <Check className={`w-3 h-3 ${pwStrength.hasNum ? 'opacity-100' : 'opacity-40'}`} />
                              1+ number
                            </span>
                            <span
                              className={`flex items-center gap-1 ${
                                pwStrength.hasUpperOrSym ? 'text-[#059669] font-semibold' : 'text-[#7A7468]'
                              }`}
                            >
                              <Check className={`w-3 h-3 ${pwStrength.hasUpperOrSym ? 'opacity-100' : 'opacity-40'}`} />
                              Symbol/caps
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Confirm Password with Live Match Indicator */}
                    <motion.div variants={formItemVariants} className="space-y-1">
                      <AnimatedAuthInput
                        id="reg-confirm-password"
                        name="confirmPassword"
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        error={regConfirmError}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightSlot={
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword((prev) => !prev)}
                            aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                            className="p-1 rounded-full text-[#7A7468] hover:text-[#0F3D2E] transition-colors focus:outline-none cursor-pointer"
                          >
                            {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                        autoComplete="new-password"
                        required
                      />

                      {/* Live Match Badge */}
                      {regForm.confirmPassword && (
                        <div className="flex items-center gap-1 text-[11px] pl-1">
                          {passwordsMatch ? (
                            <span className="text-[#059669] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Passwords match
                            </span>
                          ) : (
                            <span className="text-[#D97706] font-medium flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Passwords do not match yet
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>

                    {/* Turnstile / Captcha full width */}
                    <motion.div variants={formItemVariants}>
                      <TurnstileWidget
                        onChange={handleCaptchaChange}
                        resetTrigger={captchaResetCount}
                      />
                    </motion.div>

                    {/* Submit Button with Gold Gradient & Shimmer Sweep */}
                    <motion.div variants={formItemVariants} className="pt-1">
                      <button
                        type="submit"
                        disabled={isLoading || isSuccess}
                        className="group relative w-full overflow-hidden py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C9A24B] via-[#E8D08B] to-[#C9A24B] text-[#0F3D2E] text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {!reducedMotion && (
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                        )}

                        {isSuccess ? (
                          <motion.span
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 text-[#0A261B]"
                          >
                            <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                            <span>Account Created Successfully</span>
                          </motion.span>
                        ) : isLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-[#0F3D2E] border-t-transparent rounded-full animate-spin" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Gokul Account</span>
                            <ArrowRight className="w-4 h-4 text-[#0F3D2E]" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Bottom Switcher Helper */}
              <div className="pt-2 text-center text-xs text-[#5A554C]">
                {activeTab === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('register')}
                      className="font-bold text-[#0F3D2E] hover:text-[#9A7624] underline underline-offset-4 cursor-pointer"
                    >
                      Create an Account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('login')}
                      className="font-bold text-[#0F3D2E] hover:text-[#9A7624] underline underline-offset-4 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
