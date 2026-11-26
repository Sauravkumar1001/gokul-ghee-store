import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { ArrowUp, Sparkles } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import CategoryShowcase from '../components/home/CategoryShowcase';
import BestsellingSection from '../components/home/BestsellingSection';
import FeaturedGheeSection from '../components/home/FeaturedGheeSection';
import GheeUsagePuritySection from '../components/home/GheeUsagePuritySection';
import MithaiSnacksSection from '../components/home/MithaiSnacksSection';
import WhyChooseSection from '../components/home/WhyChooseSection';
import BrandStorySection from '../components/home/BrandStorySection';
import VerifiedReviewsSection from '../components/home/VerifiedReviewsSection';
import SpecialOffersSection from '../components/home/SpecialOffersSection';
import StoreLocationPreview from '../components/home/StoreLocationPreview';
import NewsletterSection from '../components/home/NewsletterSection';
import InstagramSection from '../components/home/InstagramSection';
import { useLanguage } from '../context/LanguageContext';

const AMBIENT_PARTICLES = [
  { id: 1, top: '12%', left: '8%', size: 4, duration: 9, delay: 0 },
  { id: 2, top: '22%', right: '10%', size: 3, duration: 11, delay: 1.5 },
  { id: 3, top: '35%', left: '15%', size: 5, duration: 13, delay: 0.8 },
  { id: 4, top: '48%', right: '12%', size: 3, duration: 10, delay: 2.2 },
  { id: 5, top: '58%', left: '6%', size: 4, duration: 12, delay: 1.0 },
  { id: 6, top: '70%', right: '16%', size: 5, duration: 14, delay: 0.5 },
  { id: 7, top: '82%', left: '12%', size: 3, duration: 11, delay: 2.8 },
  { id: 8, top: '92%', right: '8%', size: 4, duration: 10, delay: 1.8 },
];

function ScrollRevealSection({ children, className = '' }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const prefersReduced = useReducedMotion();
  const { scrollYProgress, scrollY } = useScroll();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setShowScrollTop(latest > 600);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* 1. Golden Luxury Scroll Progress Bar pinned to top */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C9A24B] via-[#F3E5AB] to-[#C9A24B] origin-left z-50 pointer-events-none shadow-[0_0_12px_rgba(201,162,75,0.85)]"
      />

      {/* 2. Ambient Vedic Background Diya Particles & Subtle Glow Layer */}
      {!prefersReduced && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none opacity-70"
        >
          {AMBIENT_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-gradient-to-tr from-[#C9A24B] to-[#FFE29A] shadow-[0_0_10px_rgba(201,162,75,0.8)]"
              style={{
                top: p.top,
                left: p.left,
                right: p.right,
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
              animate={{
                y: [-12, 14, -12],
                x: [-6, 6, -6],
                opacity: [0.25, 0.85, 0.25],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Soft ambient atmospheric radial lights down the page length */}
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.06)_0%,transparent_70%)] blur-2xl" />
          <div className="absolute top-[42%] left-[10%] w-[650px] h-[450px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.05)_0%,transparent_70%)] blur-2xl" />
          <div className="absolute top-[68%] right-[8%] w-[750px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.05)_0%,transparent_70%)] blur-2xl" />
          <div className="absolute top-[88%] left-1/2 -translate-x-1/2 w-[800px] h-[450px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.06)_0%,transparent_70%)] blur-2xl" />
        </div>
      )}

      {/* 3. Page Sections with Smooth Scroll Entrance Transitions */}
      <div className="relative z-10">
        <HeroSection />

        <ScrollRevealSection>
          <CategoryShowcase />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <BestsellingSection />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <FeaturedGheeSection />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <GheeUsagePuritySection />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <MithaiSnacksSection />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <WhyChooseSection />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <BrandStorySection />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <VerifiedReviewsSection />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <SpecialOffersSection />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <StoreLocationPreview />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <NewsletterSection />
        </ScrollRevealSection>

        <ScrollRevealSection>
          <InstagramSection />
        </ScrollRevealSection>
      </div>

      {/* 4. Luxury Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label={isHi ? 'ऊपर जाएं' : 'Scroll to top'}
          className="fixed bottom-24 right-5 sm:right-8 z-40 p-2.5 sm:p-3 rounded-full bg-[#0A2B20]/90 hover:bg-[#0F3D2E] text-[#E8D08B] border border-[#C9A24B]/50 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.35)] cursor-pointer flex items-center justify-center transition-all duration-200 group"
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span className="sr-only">{isHi ? 'ऊपर जाएं' : 'Back to top'}</span>
        </motion.button>
      )}
    </div>
  );
}
