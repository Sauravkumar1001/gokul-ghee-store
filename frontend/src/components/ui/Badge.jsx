const BADGE_VARIANTS = {
  gold: 'bg-[#C9A24B]/18 text-[#7C5B16] border border-[#C9A24B]/45',
  'gold-solid': 'bg-[#C9A24B] text-[#0F3D2E] border border-[#C9A24B]',
  forest: 'bg-[#0F3D2E] text-[#E8D08B] border border-[#C9A24B]/30',
  saffron: 'bg-[#FDF0E6] text-[#B84A24] border border-[#D96B27]/35',
  'saffron-solid': 'bg-[#D96B27] text-white border border-[#D96B27]',
  cream: 'bg-[#FBF7EE]/95 text-[#0F3D2E] border border-[#0F3D2E]/15',
  outline: 'bg-transparent text-[#E8D08B] border border-[#C9A24B]/45',
};

const BADGE_SIZES = {
  sm: 'px-2.5 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-[11px]',
};

/**
 * Refined status / offer / heritage micro-pill badge.
 */
export default function Badge({
  children,
  variant = 'gold',
  size = 'sm',
  dot = false,
  icon = null,
  className = '',
  ...props
}) {
  const variantClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.gold;
  const sizeClass = BADGE_SIZES[size] || BADGE_SIZES.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-[0.14em] leading-none whitespace-nowrap ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="w-1.5 h-1.5 rounded-full bg-current opacity-85 shrink-0"
        />
      )}
      {icon}
      <span>{children}</span>
    </span>
  );
}
