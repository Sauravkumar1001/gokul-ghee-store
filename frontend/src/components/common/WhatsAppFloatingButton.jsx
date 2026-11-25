import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const WHATSAPP_NUMBER = '918986365592';

export default function WhatsAppFloatingButton() {
  const { language } = useLanguage();
  const { pathname } = useLocation();
  const prefersReduced = useReducedMotion();
  const hasMobileStickyBar =
    pathname.startsWith('/product/') || pathname === '/cart' || pathname === '/checkout';

  const prefilledText =
    language === 'hi'
      ? 'नमस्ते! मुझे अनिल जी का गोकुल घी से ताज़ा देसी घी / मिठाई के बारे में जानकारी चाहिए।'
      : language === 'hinglish'
        ? 'Namaste! Mujhe Anil Ji Ka Gokul Ghee se Desi Ghee / Mithai order ya store details chahiye.'
        : 'Namaste! I would like to enquire about fresh Desi Ghee & Mithai from Anil Ji Ka Gokul Ghee.';

  const label =
    language === 'hi' ? 'व्हाट्सएप' : language === 'hinglish' ? 'WhatsApp' : 'WhatsApp';

  const ariaLabel =
    language === 'hi'
      ? 'व्हाट्सएप पर गोकुल घी से बात करें'
      : language === 'hinglish'
        ? 'WhatsApp par Gokul Ghee se baat karein'
        : 'Chat with Gokul Ghee on WhatsApp';

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(prefilledText)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={prefersReduced ? undefined : { y: -2 }}
      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className={`fixed left-4 sm:left-6 z-30 items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-full bg-[#0F3D2E] text-[#FBF7EE] border border-[#C9A24B]/55 gg-shadow-elevated hover:bg-[#155742] transition-all ${
        hasMobileStickyBar
          ? 'hidden lg:inline-flex bottom-6'
          : 'inline-flex bottom-4 sm:bottom-6'
      }`}
    >
      <span className="w-6 h-6 rounded-full bg-[#25D366]/18 border border-[#25D366]/50 flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 fill-[#25D366]"
          aria-hidden="true"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2Zm5.76 14.08c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.83-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.22-4.96-4.41-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.01-2.42.26-.29.58-.36.77-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.41.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.14.26.1 1.66.78 1.95.92.29.14.48.22.55.34.07.12.07.7-.17 1.38Z" />
        </svg>
      </span>
      <span className="text-xs font-semibold tracking-wide text-[#FBF7EE]">{label}</span>
    </motion.a>
  );
}
