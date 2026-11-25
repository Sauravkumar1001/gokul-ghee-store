import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';
import { useLanguage } from '../../context/LanguageContext';

export default function SampleNoticeBanner({ compact = false, message }) {
  const [dismissed, setDismissed] = useState(false);
  const { language, t } = useLanguage();

  if (dismissed || !STORE_CONFIG.showSampleBadge) return null;

  const badgeText = t('sampleBanner.badge');
  const displayMessage =
    message ||
    (language === 'en'
      ? 'Small-batch Bilona Desi Ghee, mithai, and festive packs prepared fresh at our Danapur kitchen.'
      : t('sampleBanner.text'));

  return (
    <div
      role="note"
      className={`rounded-[14px] border border-[#C9A24B]/35 bg-[#F3EAD7]/70 text-[#1B1B1B] flex items-center justify-between gap-3 shadow-xs ${
        compact ? 'px-3.5 py-2 text-xs' : 'px-4 py-2.5 text-xs sm:text-[13px]'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-6 h-6 rounded-full bg-[#0F3D2E] text-[#E8D08B] flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
        </span>
        <p className="leading-snug text-[#5A554C] truncate sm:whitespace-normal">
          <span className="font-semibold text-[#0F3D2E] mr-1.5">{badgeText}:</span>
          <span>{displayMessage}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notice"
        className="w-7 h-7 rounded-full inline-flex items-center justify-center text-[#5A554C] hover:text-[#0F3D2E] hover:bg-[#E6DEC9]/60 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
