import JaaliPattern from './JaaliPattern';

const TONE_CLASSES = {
  cream: 'bg-[#FBF7EE] text-[#1B1B1B]',
  white: 'bg-white text-[#1B1B1B]',
  sand: 'bg-[#F3EAD7] text-[#1B1B1B]',
  green: 'bg-[#0F3D2E] text-[#FBF7EE]',
  'green-deep': 'bg-[#0A2B20] text-[#FBF7EE]',
};

const SPACING_CLASSES = {
  none: '',
  compact: 'py-10 md:py-16',
  hero: 'py-12 md:py-20 lg:py-24',
  default: 'gg-section',
};

/**
 * Alternating section background wrapper (cream, white, deep green, soft sand)
 * with consistent 8px-grid vertical rhythm, optional archival paper grain, and heritage jaali overlay.
 */
export default function SectionSurface({
  children,
  tone = 'cream',
  spacing = 'default',
  withGrain = false,
  withJaali = tone === 'green' || tone === 'green-deep',
  className = '',
  as: Component = 'section',
  ...props
}) {
  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.cream;
  const spacingClass = SPACING_CLASSES[spacing] ?? SPACING_CLASSES.default;

  return (
    <Component
      className={`relative overflow-hidden ${toneClass} ${spacingClass} ${
        withGrain ? 'gg-paper-grain' : ''
      } ${className}`.trim()}
      {...props}
    >
      {withJaali && <JaaliPattern variant="tile" />}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
