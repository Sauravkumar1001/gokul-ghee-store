import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANT_CLASSES = {
  primary:
    'gg-cta-gold text-[#0F3D2E] font-semibold gg-shadow-gold border border-[#DFBE6A]/60 hover:brightness-[1.03] active:scale-[0.99]',
  forest:
    'bg-[#0F3D2E] text-[#FBF7EE] font-semibold border border-[#0F3D2E] hover:bg-[#155742] gg-shadow-sm active:scale-[0.99]',
  saffron:
    'bg-[#D96B27] text-white font-semibold border border-[#D96B27] hover:bg-[#B84A24] gg-shadow-sm active:scale-[0.99]',
  secondary:
    'bg-transparent text-[#0F3D2E] font-medium border border-[#0F3D2E]/30 hover:border-[#0F3D2E] hover:bg-[#0F3D2E]/6 active:scale-[0.99]',
  'secondary-dark':
    'bg-transparent text-[#FBF7EE] font-medium border border-[#FBF7EE]/35 hover:border-[#C9A24B] hover:text-[#E8D08B] hover:bg-white/5 active:scale-[0.99]',
  ghost:
    'bg-transparent text-[#0F3D2E] font-medium border border-transparent hover:bg-[#0F3D2E]/7',
  'ghost-dark':
    'bg-transparent text-[#FBF7EE]/90 font-medium border border-transparent hover:bg-white/10 hover:text-[#E8D08B]',
};

const SIZE_CLASSES = {
  sm: 'px-4 py-2 text-xs min-h-[36px] gap-1.5',
  md: 'px-6 py-3 text-sm min-h-[44px] gap-2',
  lg: 'px-8 py-3.5 text-sm sm:text-base min-h-[50px] gap-2.5',
};

const RADIUS_CLASSES = {
  pill: 'rounded-full',
  rounded: 'rounded-[14px]',
};

/**
 * Elevated D2C Button supporting <button>, React Router <Link>, or <a>,
 * with accessible 44px+ mobile touch target, warm gold gradient CTAs, and focus rings.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  radius = 'pill',
  dark = false,
  to,
  href,
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) {
  const resolvedVariant =
    dark && (variant === 'secondary' || variant === 'ghost') ? `${variant}-dark` : variant;

  const baseClass = [
    'inline-flex items-center justify-center tracking-[0.02em] transition-all duration-200 cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] focus-visible:ring-offset-2',
    dark ? 'focus-visible:ring-offset-[#0F3D2E]' : 'focus-visible:ring-offset-[#FBF7EE]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    VARIANT_CLASSES[resolvedVariant] || VARIANT_CLASSES.primary,
    SIZE_CLASSES[size] || SIZE_CLASSES.md,
    RADIUS_CLASSES[radius] || RADIUS_CLASSES.pill,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" /> : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClass} aria-disabled={disabled || loading} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClass} aria-disabled={disabled || loading} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={baseClass}
      {...props}
    >
      {content}
    </button>
  );
}
