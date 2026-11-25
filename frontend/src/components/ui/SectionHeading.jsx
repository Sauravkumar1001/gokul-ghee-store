import { ArrowRight } from 'lucide-react';
import Button from './Button';

/**
 * Multi-variant architectural SectionHeading so repeated homepage/catalog sections
 * maintain visual variety while sharing disciplined serif/sans hierarchy.
 *
 * Variants:
 * - "editorial": Left-aligned eyebrow + fluid display heading + subtitle, right-aligned CTA on desktop
 * - "centered": Symmetrical editorial center with delicate gold lotus/diamond divider
 * - "split": Asymmetric 12-col layout (headline left, narrative + CTA right)
 * - "minimal": Compact hairline-accented eyebrow + crisp heading for tighter rails
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  variant = 'editorial',
  dark = false,
  actionLabel,
  actionTo,
  actionHref,
  onActionClick,
  actionRightIcon = null,
  as: HeadingTag = 'h2',
  className = '',
}) {
  const eyebrowClass = dark ? 'text-[#E8D08B]' : 'text-[#9C7725]';
  const titleClass = dark ? 'text-[#FBF7EE]' : 'text-[#0F3D2E]';
  const subtitleClass = dark ? 'text-[#FBF7EE]/80' : 'text-[#5A554C]';

  const actionControl =
    actionLabel && (actionTo || actionHref || onActionClick) ? (
      <Button
        variant="secondary"
        dark={dark}
        size="sm"
        to={actionTo}
        href={actionHref}
        target={actionHref ? '_blank' : undefined}
        rel={actionHref ? 'noopener noreferrer' : undefined}
        onClick={onActionClick}
        rightIcon={actionRightIcon || <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
        className="shrink-0"
      >
        {actionLabel}
      </Button>
    ) : null;

  if (variant === 'centered') {
    return (
      <div className={`max-w-2xl mx-auto text-center space-y-3.5 ${className}`.trim()}>
        {eyebrow && <p className={`gg-eyebrow ${eyebrowClass}`}>{eyebrow}</p>}
        <HeadingTag className={`gg-h2 ${titleClass}`}>{title}</HeadingTag>
        <div aria-hidden="true" className="flex items-center justify-center gap-3 pt-0.5">
          <span className="h-px w-10 bg-[#C9A24B]/45" />
          <span className="w-2 h-2 rotate-45 border border-[#C9A24B] bg-[#C9A24B]/20" />
          <span className="h-px w-10 bg-[#C9A24B]/45" />
        </div>
        {subtitle && <p className={`gg-body ${subtitleClass}`}>{subtitle}</p>}
        {actionControl && <div className="pt-2 flex justify-center">{actionControl}</div>}
      </div>
    );
  }

  if (variant === 'split') {
    return (
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-end ${className}`.trim()}
      >
        <div className="lg:col-span-7 space-y-2.5">
          {eyebrow && <p className={`gg-eyebrow ${eyebrowClass}`}>{eyebrow}</p>}
          <HeadingTag className={`gg-h2 ${titleClass}`}>{title}</HeadingTag>
        </div>
        <div className="lg:col-span-5 space-y-4">
          {subtitle && <p className={`gg-body ${subtitleClass}`}>{subtitle}</p>}
          {actionControl}
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`.trim()}>
        <div className="space-y-1.5">
          {eyebrow && (
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="h-px w-6 bg-[#C9A24B]" />
              <p className={`gg-eyebrow ${eyebrowClass}`}>{eyebrow}</p>
            </div>
          )}
          <HeadingTag className={`gg-h3 ${titleClass}`}>{title}</HeadingTag>
          {subtitle && <p className={`text-sm ${subtitleClass}`}>{subtitle}</p>}
        </div>
        {actionControl}
      </div>
    );
  }

  // Default: "editorial"
  return (
    <div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-5 ${className}`.trim()}
    >
      <div className="max-w-2xl space-y-2.5">
        {eyebrow && <p className={`gg-eyebrow ${eyebrowClass}`}>{eyebrow}</p>}
        <HeadingTag className={`gg-h2 ${titleClass}`}>{title}</HeadingTag>
        {subtitle && <p className={`gg-body ${subtitleClass}`}>{subtitle}</p>}
      </div>
      {actionControl}
    </div>
  );
}
