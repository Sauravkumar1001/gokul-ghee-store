import { useEffect } from 'react';
import GheeUsagePuritySection from '../components/home/GheeUsagePuritySection';
import { useLanguage } from '../context/LanguageContext';

export default function GheeUsageMeterPage() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = isHi
      ? 'घी कैलकुलेटर और शुद्धता जांच | गोकुल घी'
      : 'Ghee Usage Meter & Purity Guide | Gokul Ghee';
  }, [isHi]);

  return (
    <div className="min-h-screen bg-[#0A2B20]">
      <GheeUsagePuritySection />
    </div>
  );
}
