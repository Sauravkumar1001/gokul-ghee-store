/**
 * Reusable heritage Indian jaali lattice & lotus mandala pattern overlay (4-6% opacity).
 * Designed primarily for deep forest green sections, story blocks, and hero backdrops.
 */
export default function JaaliPattern({
  variant = 'tile',
  opacity = 0.055,
  className = '',
}) {
  if (variant === 'mandala') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        fill="none"
        style={{ opacity }}
        className={`pointer-events-none select-none text-[#C9A24B] ${className}`.trim()}
      >
        <g stroke="currentColor" strokeWidth="1">
          <circle cx="200" cy="200" r="186" strokeDasharray="4 6" />
          <circle cx="200" cy="200" r="154" />
          <circle cx="200" cy="200" r="112" strokeDasharray="2 4" />
          <circle cx="200" cy="200" r="72" />
          <circle cx="200" cy="200" r="28" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 200 200)`}>
              <path d="M200 18C214 58 222 86 200 128C178 86 186 58 200 18Z" />
              <path d="M200 128C212 152 212 168 200 188C188 168 188 152 200 128Z" />
            </g>
          ))}
        </g>
      </svg>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute inset-0 gg-jaali-pattern ${className}`.trim()}
      style={opacity !== 0.055 ? { opacity: Math.min(Math.max(opacity / 0.055, 0.5), 1.4) } : undefined}
    />
  );
}
