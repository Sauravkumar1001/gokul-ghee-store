/**
 * Warm ivory/sand loading placeholders aligned to Gokul Ghee's surface tokens
 * and respecting prefers-reduced-motion.
 */
export function Skeleton({ className = '', rounded = 'rounded-[12px]', ...props }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none bg-[#E6DAC2]/75 ${rounded} ${className}`.trim()}
      {...props}
    />
  );
}

export function TextBlockSkeleton({ lines = 3, className = '' }) {
  return (
    <div aria-hidden="true" className={`space-y-2.5 ${className}`.trim()}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={`h-3.5 ${idx === lines - 1 ? 'w-3/5' : idx === 0 ? 'w-4/5' : 'w-full'}`}
          rounded="rounded-full"
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-[16px] border border-[#0F3D2E]/10 bg-[#FFFDF8] p-4 space-y-4 gg-shadow-sm ${className}`.trim()}
    >
      <Skeleton className="aspect-[4/3] w-full" rounded="rounded-[12px]" />
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-24" rounded="rounded-full" />
        <Skeleton className="h-6 w-4/5" rounded="rounded-[8px]" />
        <Skeleton className="h-3.5 w-full" rounded="rounded-full" />
      </div>
      <div className="pt-2 border-t border-[#0F3D2E]/8 flex items-center justify-between gap-3">
        <Skeleton className="h-6 w-20" rounded="rounded-[8px]" />
        <Skeleton className="h-9 w-24" rounded="rounded-full" />
      </div>
    </div>
  );
}

export default Skeleton;
