import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  actionLabel,
  actionTo,
  dark = false,
}) {
  const isCenter = align === 'center';

  return (
    <div
      className={`flex flex-col gap-4 ${
        isCenter ? 'items-center text-center max-w-2xl mx-auto' : 'md:flex-row md:items-end md:justify-between'
      }`}
    >
      <div className={isCenter ? 'space-y-3' : 'space-y-2.5 max-w-2xl'}>
        {eyebrow && (
          <div className={`flex items-center gap-3 ${isCenter ? 'justify-center' : ''}`}>
            <span className="h-[1px] w-7 bg-[#C9A34A]" aria-hidden="true" />
            <span
              className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                dark ? 'text-[#C9A34A]' : 'text-[#9D7927]'
              }`}
            >
              {eyebrow}
            </span>
            {isCenter && <span className="h-[1px] w-7 bg-[#C9A34A]" aria-hidden="true" />}
          </div>
        )}
        <h2
          className={`font-editorial text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.12] ${
            dark ? 'text-[#F8F4E9]' : 'text-[#173D2B]'
          }`}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={`text-sm sm:text-base leading-relaxed ${dark ? 'text-[#F8F4E9]/80' : 'text-[#5C5951]'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && actionTo && (
        <div className="shrink-0">
          <Link
            to={actionTo}
            className={`inline-flex items-center gap-2 text-sm font-medium tracking-wide border-b pb-1 transition-colors ${
              dark
                ? 'text-[#C9A34A] border-[#C9A34A]/50 hover:text-[#F8F4E9] hover:border-[#F8F4E9]'
                : 'text-[#173D2B] border-[#173D2B]/30 hover:text-[#9D7927] hover:border-[#9D7927]'
            }`}
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
