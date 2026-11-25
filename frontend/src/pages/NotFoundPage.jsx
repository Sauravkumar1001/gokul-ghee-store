import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Home, Phone, ShoppingBag, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '../config/storeConfig';
import { useLanguage } from '../context/LanguageContext';
import { Badge, Button, Card, Container, JaaliPattern } from '../components/ui';

export default function NotFoundPage() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  const categoryShortcuts = [
    { label: isHi ? 'देसी घी' : 'Desi Ghee', path: '/shop/desi-ghee' },
    { label: isHi ? 'मिठाई' : 'Mithai', path: '/shop/mithai' },
    { label: isHi ? 'समोसा व स्नैक्स' : 'Samosa & Snacks', path: '/shop/samosa' },
    { label: isHi ? 'त्योहार स्पेशल' : 'Festival Specials', path: '/shop/festival-specials' },
  ];

  return (
    <div className="min-h-[75vh] bg-[#FBF7EE] py-12 sm:py-16 lg:py-20 flex items-center justify-center">
      <Container className="max-w-2xl text-center space-y-8">
        {/* Decorative Badge with Jaali Background */}
        <div className="relative inline-flex items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-full bg-[#C9A24B]/15 blur-2xl pointer-events-none"
          />
          <span className="relative z-10 px-4 py-1.5 rounded-full bg-[#FFFDF8] border border-[#C9A24B]/40 text-[#9A7624] text-xs font-semibold uppercase tracking-[0.22em] shadow-sm">
            {isHi ? '४०४ • पृष्ठ नहीं मिला' : '404 • Page Not Found'}
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#0F3D2E] leading-tight">
            {isHi
              ? 'यह पृष्ठ उपलब्ध नहीं है'
              : isHinglish
                ? 'Yeh Page Available Nahi Hai'
                : 'A Missing Flavor on Our Menu'}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#5A554C] max-w-lg mx-auto leading-relaxed">
            {isHi
              ? 'आप जिस पृष्ठ या उत्पाद को खोज रहे हैं, वह शायद स्थानांतरित हो गया है या पता गलत है। कृपया नीचे दिए गए मुख्य विकल्पों से खरीदारी जारी रखें।'
              : isHinglish
                ? 'Aap jo page ya product dhoondh rahe hain woh shayad move ho gaya hai. Niche diye gaye options se browse karein.'
                : "The link you followed might have moved or is not part of our current kitchen menu. Let's guide you back to our freshest batches."}
          </p>
        </div>

        {/* Quick Category Jump Pills */}
        <div className="space-y-2.5 pt-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A7624] block">
            {isHi ? 'लोकप्रिय श्रेणियां' : 'Popular Selections'}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categoryShortcuts.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                className="px-3.5 py-1.5 rounded-full bg-[#FFFDF8] border border-[#E6DEC9] text-xs font-medium text-[#5A554C] hover:text-[#0F3D2E] hover:border-[#C9A24B] transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Button
            as={Link}
            to="/"
            variant="primary"
            size="md"
            leftIcon={<Home className="w-4 h-4 text-[#0F3D2E]" />}
          >
            {isHi ? 'होम पेज पर जाएं' : isHinglish ? 'Home par Jayein' : 'Return to Home'}
          </Button>
          <Button
            as={Link}
            to="/shop"
            variant="secondary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4 text-[#0F3D2E]" />}
          >
            {isHi ? 'दुकान ब्राउज़ करें' : isHinglish ? 'Shop Dekhein' : 'Explore Catalog'}
          </Button>
        </div>

        {/* Contact Help */}
        <p className="text-xs text-[#5A554C] pt-4 border-t border-[#E6DEC9] inline-flex items-center justify-center gap-2">
          <span>{isHi ? 'मदद चाहिए? स्टोर से संपर्क करें:' : 'Need immediate help? Call our Danapur counter:'}</span>
          <a
            href={STORE_CONFIG.phoneHref}
            className="font-semibold text-[#0F3D2E] hover:text-[#9A7624] transition-colors"
          >
            {STORE_CONFIG.phone}
          </a>
        </p>
      </Container>
    </div>
  );
}
