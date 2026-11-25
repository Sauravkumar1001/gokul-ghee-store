import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function ProductGallery({
  images = [],
  productName = 'Product',
  sampleLabel = '',
}) {
  const safeImages = images.length > 0 ? images : ['/images/hero-ghee.jpg'];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const [isZooming, setIsZooming] = useState(false);
  const touchStartX = useRef(null);

  const activeIndex = selectedIndex < safeImages.length ? selectedIndex : 0;
  const activeSrc = safeImages[activeIndex];
  const hasMultiple = safeImages.length > 1;

  const goPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const goNext = () => {
    setSelectedIndex((prev) => (prev + 1) % safeImages.length);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  };

  const handleTouchStart = (e) => {
    if (!hasMultiple || !e.touches?.[0]) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!hasMultiple || touchStartX.current === null || !e.changedTouches?.[0]) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Main Image Canvas with Hover Zoom + Mobile Swipe */}
      <div
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => {
          setIsZooming(false);
          setZoomOrigin('50% 50%');
        }}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-[24px] overflow-hidden border border-[#C9A24B]/35 bg-[#F3EAD7] gg-shadow-sm select-none group cursor-zoom-in"
      >
        <img
          src={activeSrc}
          alt={`${productName} — view ${activeIndex + 1}`}
          decoding="async"
          style={{ transformOrigin: zoomOrigin }}
          className={`w-full aspect-[4/3] object-cover transition-transform duration-300 ease-out motion-reduce:transform-none ${
            isZooming ? 'md:scale-[1.22]' : 'scale-100'
          }`}
        />

        {sampleLabel && (
          <span className="absolute bottom-3 left-3 pointer-events-none px-2.5 py-0.5 rounded-full bg-[#FBF7EE]/88 backdrop-blur-xs text-[#5A554C] text-[10px] font-medium tracking-wide">
            {sampleLabel}
          </span>
        )}

        <span
          aria-hidden="true"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FBF7EE]/85 backdrop-blur-xs border border-[#C9A24B]/35 text-[10px] font-semibold uppercase tracking-wider text-[#0F3D2E] absolute top-3.5 right-3.5 opacity-80 group-hover:opacity-0 transition-opacity pointer-events-none"
        >
          <ZoomIn className="w-3 h-3 text-[#9C7725]" />
          <span>Hover to zoom</span>
        </span>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous product image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FBF7EE]/90 border border-[#C9A24B]/40 text-[#0F3D2E] flex items-center justify-center gg-shadow-sm hover:bg-[#FFFDF8] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next product image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FBF7EE]/90 border border-[#C9A24B]/40 text-[#0F3D2E] flex items-center justify-center gg-shadow-sm hover:bg-[#FFFDF8] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div
              className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A2B20]/65 backdrop-blur-xs"
              aria-hidden="true"
            >
              {safeImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeIndex ? 'w-4 bg-[#E8D08B]' : 'w-1.5 bg-[#FBF7EE]/55'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultiple && (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {safeImages.map((imgSrc, idx) => {
            const selected = activeIndex === idx;
            return (
              <button
                key={`${imgSrc}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View image ${idx + 1} of ${productName}`}
                aria-pressed={selected}
                className={`rounded-[14px] overflow-hidden border-2 transition-all cursor-pointer bg-[#F3EAD7] ${
                  selected
                    ? 'border-[#0F3D2E] ring-2 ring-[#C9A24B]/65 shadow-xs'
                    : 'border-transparent opacity-75 hover:opacity-100 hover:border-[#C9A24B]/45'
                }`}
              >
                <img
                  src={imgSrc}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[4/3] object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
