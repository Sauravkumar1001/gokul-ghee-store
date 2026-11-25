import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import GokulAiAssistant from '../ai/GokulAiAssistant';
import WhatsAppFloatingButton from '../common/WhatsAppFloatingButton';
import { useLanguage } from '../../context/LanguageContext';

function getPageTitle(pathname, language) {
  const isHi = language === 'hi';

  if (pathname === '/') {
    return isHi
      ? 'गोकुल घी — शुद्धता और स्वाद की परंपरा | दानापुर, पटना'
      : 'GOKUL GHEE — Tradition in Every Taste | Danapur, Patna';
  }
  if (pathname === '/shop') {
    return isHi ? 'संपूर्ण कैटलॉग | गोकुल घी' : 'Shop All Selections | GOKUL GHEE';
  }
  if (pathname.startsWith('/shop/')) {
    const slug = pathname.replace('/shop/', '');
    const cleanSlug = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `${cleanSlug} | GOKUL GHEE`;
  }
  if (pathname.startsWith('/product/')) {
    const slug = pathname.replace('/product/', '').replace(/^sample-/, '');
    const cleanSlug = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `${cleanSlug} | GOKUL GHEE`;
  }
  if (pathname === '/cart') {
    return isHi ? 'आपकी कार्ट | गोकुल घी' : 'Your Cart | GOKUL GHEE';
  }
  if (pathname === '/checkout') {
    return isHi ? 'सुरक्षित चेकआउट | गोकुल घी' : 'Secure Checkout | GOKUL GHEE';
  }
  if (pathname === '/wishlist') {
    return isHi ? 'सहेजी गई विशलिस्ट | गोकुल घी' : 'Saved Wishlist | GOKUL GHEE';
  }
  if (pathname === '/login') {
    return isHi ? 'साइन इन करें | गोकुल घी' : 'Customer Sign In | GOKUL GHEE';
  }
  if (pathname === '/register') {
    return isHi ? 'खाता बनाएं | गोकुल घी' : 'Create Account | GOKUL GHEE';
  }
  if (pathname === '/account') {
    return isHi ? 'प्रोफ़ाइल व पते | गोकुल घी' : 'My Account | GOKUL GHEE';
  }
  if (pathname === '/account/orders' || pathname.startsWith('/account/orders/')) {
    return isHi ? 'ऑर्डर इतिहास | गोकुल घी' : 'Order History & Tracking | GOKUL GHEE';
  }
  if (pathname === '/about') {
    return isHi ? 'हमारी विरासत | गोकुल घी' : 'Our Story & Danapur Heritage | GOKUL GHEE';
  }
  if (pathname === '/contact') {
    return isHi ? 'स्टोर विजिट व संपर्क | गोकुल घी' : 'Visit Store & Contact | GOKUL GHEE';
  }
  if (pathname === '/faq') {
    return isHi ? 'अक्सर पूछे जाने वाले सवाल | गोकुल घी' : 'Help & FAQs | GOKUL GHEE';
  }
  if (pathname === '/privacy-policy') {
    return isHi ? 'गोपनीयता नीति | गोकुल घी' : 'Privacy Policy | GOKUL GHEE';
  }
  if (pathname === '/terms') {
    return isHi ? 'नियम व शर्तें | गोकुल घी' : 'Terms & Conditions | GOKUL GHEE';
  }
  if (pathname === '/refund-policy') {
    return isHi ? 'रिफंड नीति | गोकुल घी' : 'Refund Policy | GOKUL GHEE';
  }
  return 'GOKUL GHEE — Tradition in Every Taste | Danapur';
}

export default function MainLayout({ children }) {
  const { pathname, hash } = useLocation();
  const { language, t } = useLanguage();

  useEffect(() => {
    document.title = getPageTitle(pathname, language);
  }, [pathname, language]);

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7EE] text-[#1B1B1B]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0F3D2E] focus:text-[#FBF7EE] focus:rounded-full"
      >
        {t('common.skipToContent')}
      </a>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloatingButton />
      <GokulAiAssistant />
    </div>
  );
}
