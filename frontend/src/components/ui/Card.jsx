const CARD_VARIANTS = {
  elevated: 'bg-[#FFFDF8] border border-[#0F3D2E]/10 gg-shadow-card text-[#1B1B1B]',
  white: 'bg-white border border-[#0F3D2E]/10 gg-shadow-sm text-[#1B1B1B]',
  sand: 'bg-[#F3EAD7] border border-[#0F3D2E]/12 text-[#1B1B1B]',
  green: 'bg-[#0A2B20] border border-[#C9A24B]/30 text-[#FBF7EE]',
  glass: 'bg-[#FFFDF8]/88 backdrop-blur-md border border-[#C9A24B]/30 gg-shadow-card text-[#1B1B1B]',
};

const CARD_RADII = {
  md: 'rounded-[16px]',
  lg: 'rounded-[20px]',
  xl: 'rounded-[24px]',
};

const CARD_PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

/**
 * Elevated architectural Card container with 16-24px radii and soft layered shadows.
 */
export default function Card({
  children,
  variant = 'elevated',
  radius = 'md',
  padding = 'md',
  interactive = false,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const variantClass = CARD_VARIANTS[variant] || CARD_VARIANTS.elevated;
  const radiusClass = CARD_RADII[radius] || CARD_RADII.md;
  const paddingClass = CARD_PADDING[padding] ?? CARD_PADDING.md;
  const hoverClass = interactive
    ? 'transition-all duration-300 hover:-translate-y-1 hover:gg-shadow-elevated hover:border-[#C9A24B]/45'
    : '';

  return (
    <Component
      className={`${variantClass} ${radiusClass} ${paddingClass} ${hoverClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
