import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ShieldCheck, Flame } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import GheeUsagePuritySection from '../components/home/GheeUsagePuritySection';
import { useLanguage } from '../context/LanguageContext';

export default function GheeUsageMeterPage() {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = isHi
      ? 'घी कैलकुलेटर और शुद्धता जांच | गोकुल घी • दानापुर'
      : 'Smart Ghee Usage Meter & Purity Lab | Anil Ji Ka Gokul Ghee';
  }, [isHi]);

  return (
    <div className="min-h-screen bg-[#0A2B20] text-[#FBF7EE] relative overflow-hidden">
      {/* Top Ambient Golden Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-64 bg-[radial-gradient(ellipse_at_top,rgba(201,162,75,0.18)_0%,transparent_70%)] blur-2xl z-0"
      />

      {/* Luxury Breadcrumb Banner */}
      <div className="relative z-10 border-b border-[#C9A24B]/25 bg-[#072419]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A2B20] border border-[#C9A24B]/35 text-[#E8D08B] hover:text-[#FBF7EE] hover:border-[#E8D08B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-semibold">{isHi ? 'मुख्य दुकान पर लौटें' : 'Back to Store'}</span>
            </Link>

            <span className="text-[#C9A24B]/40 hidden sm:inline">•</span>

            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[#FBF7EE]/70">
              <Link to="/" className="hover:text-[#E8D08B] transition-colors">
                {isHi ? 'होम' : 'Home'}
              </Link>
              <span>/</span>
              <span className="text-[#E8D08B] font-medium">
                {isHi ? 'घी कैलकुलेटर व लैब' : 'Ghee Meter & Lab'}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-[#E8D08B] text-[11px] sm:text-xs">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" />
              {isHi ? 'दानापुर छावनी प्रामाणिक' : 'Danapur Cantt Authentic'}
            </span>
            <span className="text-[#C9A24B]/40">•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              {isHi ? '100% शुद्ध बिलोना' : '100% Bilona Churned'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Ghee Usage Meter & Purity Lab Component */}
      <main className="relative z-10">
        <GheeUsagePuritySection />
      </main>
    </div>
  );
}
