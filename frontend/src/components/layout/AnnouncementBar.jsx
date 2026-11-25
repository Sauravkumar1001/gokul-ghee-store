import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MapPin, Phone, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';
import { useLanguage } from '../../context/LanguageContext';
import Container from '../ui/Container';

const CUSTOMER_ANNOUNCEMENTS_EN = [
  'Anil Ji Ka Gokul Ghee — Anand Bazar, Danapur Cantonment, Patna',
  'Open Daily: 9:00 AM – 9:00 PM | Store Enquiries: +91 89863 65592',
  'Pure Bilona Desi Ghee, Khoya Mithai & Hot Samosas Crafted Fresh Daily',
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const { language, t } = useLanguage();
  const prefersReduced = useReducedMotion();

  const translatedItems = t('announcement.items');
  const items =
    language === 'en'
      ? CUSTOMER_ANNOUNCEMENTS_EN
      : Array.isArray(translatedItems) && translatedItems.length > 0
        ? translatedItems
        : CUSTOMER_ANNOUNCEMENTS_EN;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const currentItem = items[index % items.length];

  return (
    <div className="relative bg-[#0A2B20] text-[#FBF7EE] text-[11px] sm:text-xs border-b border-[#C9A24B]/25">
      <Container className="min-h-[36px] py-1.5 flex items-center justify-between gap-4">
        <div className="hidden md:flex items-center gap-1.5 text-[#FBF7EE]/80 shrink-0">
          <MapPin className="w-3.5 h-3.5 text-[#C9A24B]" aria-hidden="true" />
          <span>
            {language === 'hi'
              ? 'आनंद बाजार, दानापुर कैंटोनमेंट'
              : 'Anand Bazar, Danapur Cantonment'}
          </span>
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentItem}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: prefersReduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="text-center font-medium tracking-wide truncate inline-flex items-center gap-2"
            >
              <Sparkles className="w-3 h-3 text-[#C9A24B] shrink-0" aria-hidden="true" />
              <span className="truncate">{currentItem}</span>
            </motion.p>
          </AnimatePresence>
        </div>

        <a
          href={STORE_CONFIG.phoneHref}
          className="hidden sm:inline-flex items-center gap-1.5 text-[#E8D08B] hover:text-[#FBF7EE] transition-colors shrink-0 tabular-nums font-medium"
        >
          <Phone className="w-3.5 h-3.5 text-[#C9A24B]" aria-hidden="true" />
          <span>{STORE_CONFIG.phone}</span>
        </a>
      </Container>
    </div>
  );
}
