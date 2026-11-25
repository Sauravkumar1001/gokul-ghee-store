import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitch({ variant = 'header', hideOnMobile = false, className = '' }) {
  const { language, setLanguage, languages, t } = useLanguage();
  const isFull = variant === 'mobile';
  const displayClass = hideOnMobile ? 'hidden sm:inline-flex' : 'inline-flex';

  return (
    <div
      role="group"
      aria-label={t('lang.switcherAria')}
      className={`${displayClass} items-center rounded-full border border-[#0F3D2E]/16 bg-[#FFFDF8] p-0.5 gg-shadow-sm ${
        isFull ? 'w-full justify-between px-1.5 py-1' : ''
      } ${className}`}
    >
      {isFull && (
        <span className="inline-flex items-center gap-1.5 pl-2 pr-1 text-[11px] font-semibold uppercase tracking-wider text-[#9C7725]">
          <Globe className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('lang.label')}</span>
        </span>
      )}

      <div className={`inline-flex items-center gap-0.5 ${isFull ? 'flex-1 justify-end' : ''}`}>
        {languages.map((lang) => {
          const active = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              aria-pressed={active}
              data-lang-option={lang.code}
              className={`rounded-full font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] ${
                isFull ? 'px-3 py-1.5 text-xs min-h-[34px]' : 'px-2 sm:px-2.5 py-1 text-[11px] min-h-[28px]'
              } ${
                active
                  ? 'bg-[#0F3D2E] text-[#E8D08B] gg-shadow-sm'
                  : 'text-[#0F3D2E]/75 hover:text-[#0F3D2E] hover:bg-[#F3EAD7]/70'
              }`}
            >
              {lang.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
