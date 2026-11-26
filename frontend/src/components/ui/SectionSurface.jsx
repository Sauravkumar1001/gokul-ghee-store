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
  compact: 'py-6 md:py-10',
  hero: 'py-8 md:py-12 lg:py-14',
  default: 'gg-section',
};

/**
 * Alternating section background wrapper (cream, white, deep green, soft sand)
 * with consistent 8px-grid vertical rhythm, ambient Vedic golden aura, optional archival paper grain,
 * delicate golden hairlines, and heritage jaali overlay.
 */
export default function SectionSurface({
  children,
  tone = 'cream',
  spacing = 'default',
  withGrain = false,
  withJaali = tone === 'green' || tone === 'green-deep',
  withAura = true,
  className = '',
  as: Component = 'section',
  ...props
}) {
  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.cream;
  const spacingClass = SPACING_CLASSES[spacing] ?? SPACING_CLASSES.default;
  const isDark = tone === 'green' || tone === 'green-deep';

  return (
    <Component
      className={`relative overflow-hidden ${toneClass} ${spacingClass} ${
        withGrain ? 'gg-paper-grain' : ''
      } ${className}`.trim()}
      {...props}
    >
      {/* Delicate golden hairline top border for seamless Vedic transitions */}
      <div
        className="absolute top-0 inset-x-0 h-px gold-hairline opacity-60 pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Ambient Vedic lighting aura */}
      {withAura && !isDark && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] rounded-full bg-[radial-gradient(ellipse_at_top,rgba(201,162,75,0.09)_0%,transparent_75%)]" />
          <div className="absolute -bottom-32 right-10 w-[520px] h-[300px] rounded-full bg-[radial-gradient(ellipse_at_bottom,rgba(232,208,139,0.06)_0%,transparent_70%)]" />
        </div>
      )}

      {withAura && isDark && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#C9A24B]/14 blur-[85px] animate-blob-1" />
          <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-[#059669]/16 blur-[95px] animate-blob-2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#E8D08B]/4 blur-[110px]" />
        </div>
      )}

      {withJaali && <JaaliPattern variant="tile" />}

      {/* Delicate golden hairline bottom border */}
      <div
        className="absolute bottom-0 inset-x-0 h-px gold-hairline opacity-40 pointer-events-none z-10"
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
    </Component>
  );
}
