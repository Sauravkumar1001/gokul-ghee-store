import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';

export default function PhaseRoutePreviewPage({ title, phase, description }) {
  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[#EDE6D4] border editorial-border text-xs font-semibold uppercase tracking-[0.18em] text-[#173D2B]">
          <Layers className="w-3.5 h-3.5 text-[#9D7927]" />
          <span>Scheduled for {phase}</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#173D2B]">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-[#5C5951] leading-relaxed">
          {description} In accordance with phased production architecture, dummy backend simulations
          are intentionally omitted until real state and API endpoints are wired.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-[#173D2B] text-[#F8F4E9] text-sm font-medium hover:bg-[#102B1E] transition-colors"
          >
            <span>Explore Storefront Catalog</span>
            <ArrowRight className="w-4 h-4 text-[#C9A34A]" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm border border-[#173D2B] text-[#173D2B] text-sm font-medium hover:bg-[#173D2B]/5 transition-colors"
          >
            <span>Visit Danapur Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
