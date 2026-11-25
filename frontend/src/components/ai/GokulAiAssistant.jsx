import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  MessageCircle,
  Send,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { JaaliPattern } from '../ui';
import { gokulAiClient } from '../../services/gokulAiClient';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR } from '../../utils/formatters';

const INITIAL_MESSAGE_ID = 'welcome-msg';
const TEASER_SESSION_KEY = 'gokul_ai_teaser_shown_v1';

function readSessionTeaserShown() {
  try {
    return window.sessionStorage.getItem(TEASER_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

function markSessionTeaserShown() {
  try {
    window.sessionStorage.setItem(TEASER_SESSION_KEY, 'true');
  } catch {
    // Ignore storage access errors in restricted environments
  }
}

export default function GokulAiAssistant() {
  const { pathname } = useLocation();
  const isExcludedPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/checkout' ||
    pathname.startsWith('/admin');
  const hasMobileStickyBar =
    pathname.startsWith('/product/') || pathname === '/cart' || pathname === '/checkout';
  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(() => readSessionTeaserShown());
  const [footerInView, setFooterInView] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [engineSource, setEngineSource] = useState('connected');
  const [sessionId, setSessionId] = useState(() => gokulAiClient.getOrCreateSessionId());
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [messages, setMessages] = useState(() => [
    {
      id: INITIAL_MESSAGE_ID,
      sender: 'assistant',
      text: '',
      recommendations: [],
    },
  ]);
  const messagesEndRef = useRef(null);
  const { addItem } = useCart();

  const quickPrompts = Array.isArray(t('ai.quickPrompts')) ? t('ai.quickPrompts') : [];

  // Hide teaser automatically whenever user approaches footer so footer text is never covered
  useEffect(() => {
    const checkNearFooter = () => {
      const footerEl = document.querySelector('footer[role="contentinfo"], footer');
      if (footerEl) {
        const rect = footerEl.getBoundingClientRect();
        setFooterInView(rect.top < window.innerHeight + 24);
      }
    };

    checkNearFooter();

    let observer;
    const footerEl = document.querySelector('footer[role="contentinfo"], footer');
    if (footerEl && typeof window.IntersectionObserver === 'function') {
      observer = new window.IntersectionObserver(
        (entries) => {
          setFooterInView(Boolean(entries[0]?.isIntersecting));
        },
        { rootMargin: '0px 0px 40px 0px', threshold: 0.01 }
      );
      observer.observe(footerEl);
    }

    window.addEventListener('scroll', checkNearFooter, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', checkNearFooter);
    };
  }, []);

  // Show teaser popup once per session (~1.5s after mount) and auto-hide after ~6 seconds.
  // Never show on /login, /register, or /checkout pages.
  useEffect(() => {
    if (isOpen || nudgeDismissed || footerInView || isExcludedPage) {
      if (showNudge && isExcludedPage) {
        setShowNudge(false);
      }
      return;
    }
    const showTimer = window.setTimeout(() => {
      markSessionTeaserShown();
      setShowNudge(true);
    }, 1500);

    return () => window.clearTimeout(showTimer);
  }, [isOpen, nudgeDismissed, footerInView, isExcludedPage, showNudge]);

  useEffect(() => {
    if (!showNudge) return;
    const hideTimer = window.setTimeout(() => {
      setShowNudge(false);
      setNudgeDismissed(true);
    }, 6000);

    return () => window.clearTimeout(hideTimer);
  }, [showNudge]);

  useEffect(() => {
    if (!isOpen || historyLoaded) return;
    let active = true;
    setHistoryLoaded(true);

    gokulAiClient.fetchHistory(sessionId).then((res) => {
      if (!active || !res.ok || !Array.isArray(res.messages) || res.messages.length === 0) {
        return;
      }
      const restored = res.messages.map((m, idx) => ({
        id: `hist-${idx}`,
        sender: m.role === 'user' ? 'user' : 'assistant',
        text: m.content,
        recommendations: [],
      }));
      setMessages([
        { id: INITIAL_MESSAGE_ID, sender: 'assistant', text: '', recommendations: [] },
        ...restored,
      ]);
    });

    return () => {
      active = false;
    };
  }, [historyLoaded, isOpen, sessionId]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView?.({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Mark body state when AI assistant is open to coordinate with mobile floating actions
  useEffect(() => {
    if (isOpen) {
      document.body.setAttribute('data-ai-open', 'true');
    } else {
      document.body.removeAttribute('data-ai-open');
    }
    return () => {
      document.body.removeAttribute('data-ai-open');
    };
  }, [isOpen]);

  const sendQuery = async (rawPrompt) => {
    const text = rawPrompt.trim();
    if (!text || isThinking) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      recommendations: [],
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const result = await gokulAiClient.sendMessage({ sessionId, message: text, language });
    setIsThinking(false);

    if (result.ok && result.reply) {
      if (result.sessionId && result.sessionId !== sessionId) {
        setSessionId(result.sessionId);
      }
      if (result.reply.source) {
        setEngineSource(result.reply.source);
      }

      const botMsg = {
        id: `bot-${Date.now() + 1}`,
        sender: 'assistant',
        text: result.reply.text,
        recommendations: result.reply.recommendations || [],
        actionLink: result.reply.actionLink,
      };
      setMessages((prev) => [...prev, botMsg]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now() + 1}`,
          sender: 'assistant',
          text:
            result.error?.message ||
            (language === 'hi'
              ? 'GOKUL AI अभी व्यस्त है। कृपया कुछ क्षण बाद पुनः प्रयास करें।'
              : language === 'hinglish'
              ? 'GOKUL AI abhi thoda busy hai. Please thodi der baad dobara try karein.'
              : 'GOKUL AI is temporarily busy. Please try again in a moment.'),
          recommendations: [],
        },
      ]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery(input);
  };

  return (
    <div
      className={`fixed right-3 sm:right-6 z-40 gg-floating-btn flex flex-col items-end gap-2.5 transition-[bottom] duration-200 ${
        hasMobileStickyBar
          ? 'hidden lg:flex bottom-6'
          : 'flex bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:bottom-6'
      }`}
    >
      {/* Side Pop-up Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            aria-label={
              language === 'hi'
                ? 'GOKUL AI शॉपिंग सहायक'
                : 'GOKUL AI Shopping Assistant'
            }
            className="w-[calc(100vw-1.5rem)] sm:w-[392px] max-h-[calc(100dvh-5.5rem)] sm:max-h-[78vh] rounded-[24px] overflow-hidden border border-[#C9A24B]/45 bg-[#FFFDF8] gg-shadow-elevated flex flex-col"
          >
            {/* Header */}
            <div className="relative overflow-hidden px-4 py-3.5 bg-[#0F3D2E] text-[#FBF7EE] flex items-center justify-between gap-3">
              <JaaliPattern variant="tile" opacity={0.07} />
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D8B45E] to-[#B08732] text-[#0F3D2E] flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-editorial text-lg font-bold tracking-wide leading-none">
                    GOKUL AI
                  </h2>
                  <p className="text-[11px] text-[#E8D08B] mt-0.5">
                    {language === 'hi'
                      ? 'आपका पर्सनल टेस्ट गाइड'
                      : language === 'hinglish'
                      ? 'Aapka Personal Taste Guide'
                      : 'Your Personal Taste Guide'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t('ai.closeAria')}
                className="relative z-10 w-8 h-8 rounded-full inline-flex items-center justify-center text-[#FBF7EE]/85 hover:text-[#E8D08B] hover:bg-[#155742] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grounding Banner */}
            <div className="px-4 py-2 bg-[#F3EAD7]/85 border-b border-[#E6DEC9] text-[10px] text-[#5A554C] flex items-center justify-between gap-2">
              <span className="truncate">{t('ai.headerSubtitle')}</span>
              <span className="font-semibold text-[#0F3D2E] shrink-0">
                {engineSource === 'gemini'
                  ? language === 'hi'
                    ? 'Gemini AI • लाइव डेटाबेस'
                    : 'Gemini AI • Live DB'
                  : engineSource === 'offline_fallback'
                  ? language === 'hi'
                    ? 'ऑफ़लाइन सैंपल गाइड'
                    : 'Offline Sample Guide'
                  : language === 'hi'
                  ? 'लाइव स्टोर कैटलॉग'
                  : 'Live Store Catalog'}
              </span>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FBF7EE]/75 min-h-[260px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-2 ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-[16px] px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#0F3D2E] text-[#FBF7EE] rounded-br-[4px] shadow-xs'
                        : 'bg-[#FFFDF8] text-[#1B1B1B] border border-[#E6DEC9] rounded-bl-[4px] gg-shadow-sm'
                    }`}
                  >
                    {msg.id === INITIAL_MESSAGE_ID ? t('ai.welcome') : msg.text}
                  </div>

                  {/* Clickable Grounded Product Cards */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="w-full space-y-2">
                      {msg.recommendations.map(({ product, variant }) => (
                        <div
                          key={`${msg.id}-${variant.id || variant._id}`}
                          className="rounded-[16px] border border-[#E6DEC9] bg-[#FFFDF8] p-2.5 flex items-center gap-3 gg-shadow-sm"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded-[10px] object-cover shrink-0 bg-[#F3EAD7]"
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/product/${product.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="text-xs font-semibold text-[#0F3D2E] hover:text-[#9A7624] block truncate"
                            >
                              {product.name}
                            </Link>
                            <p className="text-[11px] text-[#5A554C] tabular-nums">
                              {variant.label} •{' '}
                              <strong className="text-[#0F3D2E]">
                                {formatINR(variant.price)}
                              </strong>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addItem(product, variant, 1, { openCartDrawer: false })}
                            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0F3D2E] text-[#FBF7EE] text-[11px] font-semibold hover:bg-[#155742] transition-colors"
                          >
                            <ShoppingBag className="w-3 h-3 text-[#E8D08B]" />
                            <span>{language === 'hi' ? 'जोड़ें' : 'Add'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.actionLink && (
                    <Link
                      to={msg.actionLink.to}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F3D2E] hover:text-[#9A7624] underline underline-offset-2"
                    >
                      <span>{msg.actionLink.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="text-[11px] text-[#5A554C] italic px-1">
                  {t('ai.typing')}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3.5 py-2 border-t border-[#E6DEC9] bg-[#FFFDF8] flex gap-1.5 overflow-x-auto">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendQuery(prompt)}
                  className="shrink-0 px-3 py-1 rounded-full bg-[#F3EAD7] hover:bg-[#0F3D2E] hover:text-[#FBF7EE] text-[11px] font-medium text-[#0F3D2E] transition-colors whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-[#E6DEC9] bg-[#FFFDF8] flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('ai.placeholder')}
                aria-label={
                  language === 'hi'
                    ? 'GOKUL AI से पूछें'
                    : language === 'hinglish'
                    ? 'GOKUL AI se poochein'
                    : 'Ask GOKUL AI'
                }
                className="flex-1 px-3.5 py-2.5 rounded-full bg-[#FBF7EE] border border-[#E6DEC9] text-xs text-[#1B1B1B] placeholder:text-[#7A7468] focus:outline-none focus:border-[#0F3D2E] focus:ring-2 focus:ring-[#C9A24B]/30"
              />
              <button
                type="submit"
                aria-label={t('ai.sendAria')}
                className="w-9 h-9 rounded-full inline-flex items-center justify-center bg-gradient-to-br from-[#D8B45E] via-[#C9A24B] to-[#B08732] text-[#0F3D2E] shadow-sm hover:brightness-105 transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Gentle Floating Welcome Pop-up Nudge */}
      <AnimatePresence>
        {!isExcludedPage && !isOpen && showNudge && !nudgeDismissed && !footerInView && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            aria-label="GOKUL AI greeting"
            className="max-w-[210px] min-[360px]:max-w-[240px] sm:max-w-[280px] rounded-[18px] border border-[#C9A24B]/50 bg-[#FFFDF8] gg-shadow-elevated px-3 py-2 text-xs text-[#1B1B1B] flex items-start gap-2"
          >
            <button
              type="button"
              onClick={() => {
                markSessionTeaserShown();
                setNudgeDismissed(true);
                setShowNudge(false);
                setIsOpen(true);
              }}
              className="text-left leading-snug hover:text-[#0F3D2E]"
            >
              <span className="font-semibold text-[#0F3D2E] block">
                {language === 'hi'
                  ? 'GOKUL AI • टेस्ट गाइड'
                  : 'GOKUL AI • Taste Guide'}
              </span>
              <span className="text-[#5A554C]">
                {language === 'hi'
                  ? '₹500 के अंदर मिठाई या देसी घी चाहिए? मुझसे पूछें!'
                  : language === 'hinglish'
                  ? '₹500 ke andar mithai ya Desi Ghee chahiye? Mujhse poochein!'
                  : 'Need mithai under ₹500 or Desi Ghee suggestions? Ask me!'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                markSessionTeaserShown();
                setNudgeDismissed(true);
                setShowNudge(false);
              }}
              aria-label="Dismiss GOKUL AI greeting"
              className="p-0.5 text-[#7A7468] hover:text-[#0F3D2E]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Pill */}
      <motion.button
        type="button"
        onClick={() => {
          markSessionTeaserShown();
          setNudgeDismissed(true);
          setShowNudge(false);
          setIsOpen((prev) => !prev);
        }}
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        aria-label={isOpen ? t('ai.closeAria') : t('ai.fabAria')}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-[#0F3D2E] text-[#FBF7EE] border border-[#C9A24B]/65 gg-shadow-elevated hover:bg-[#155742] transition-colors min-h-[44px] cursor-pointer whitespace-nowrap"
      >
        <span className="relative flex h-2.5 w-2.5">
          {!shouldReduceMotion && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8D08B] opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E8D08B]" />
        </span>
        <MessageCircle className="w-4 h-4 text-[#E8D08B]" />
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
          {isOpen
            ? language === 'hi'
              ? 'बंद करें'
              : language === 'hinglish'
              ? 'Band Karein'
              : 'Close AI'
            : language === 'hi'
            ? 'GOKUL AI • हिंदी'
            : 'GOKUL AI'}
        </span>
      </motion.button>
    </div>
  );
}
