import { Link } from 'react-router-dom';
import { FileText, Shield, RefreshCw, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { STORE_CONFIG } from '../config/storeConfig';
import { useLanguage } from '../context/LanguageContext';
import { Badge, Card, Container } from '../components/ui';

const POLICY_CONTENT = {
  privacy: {
    key: 'privacy',
    path: '/privacy-policy',
    eyebrow: 'Legal & Privacy',
    title: 'Privacy Policy',
    titleHi: 'गोपनीयता नीति',
    subtitle:
      'How Anil Ji Ka Gokul Ghee protects your personal details, delivery addresses, and payment information.',
    sections: [
      {
        heading: 'Information We Collect',
        headingHi: 'हम कौन सी जानकारी एकत्र करते हैं',
        body: `At ${STORE_CONFIG.businessName}, we respect your personal privacy. We collect only necessary details to fulfill your orders, including your name, delivery address, postal pincode, contact phone number, and email address for digital invoices and delivery notifications.`,
      },
      {
        heading: 'Payment & Transaction Security',
        headingHi: 'भुगतान व लेन-देन सुरक्षा',
        body: 'All online transactions are securely encrypted via certified payment gateways (Razorpay). We never see, process, or store your raw debit/credit card numbers or UPI PINs on our servers. Cash on Delivery is also available for complete peace of mind.',
      },
      {
        heading: 'How Your Data Is Used',
        headingHi: 'जानकारी का उपयोग कैसे होता है',
        body: 'Your information is strictly used for order preparation, delivery dispatch in Danapur/Patna, and customer service updates. We do not sell, rent, or trade customer contact details to third-party marketing brokers.',
      },
      {
        heading: 'Account Deletion & Contact',
        headingHi: 'खाता व डेटा सहायता',
        body: `You can update your saved addresses anytime from your Account dashboard. For any questions regarding your data, reach out to our Anand Bazar counter at ${STORE_CONFIG.phone}.`,
      },
    ],
  },
  terms: {
    key: 'terms',
    path: '/terms',
    eyebrow: 'Terms of Service',
    title: 'Terms & Conditions',
    titleHi: 'नियम एवं शर्तें',
    subtitle:
      'Guidelines and terms governing storefront purchases, product availability, and local delivery.',
    sections: [
      {
        heading: 'Store Operations & Authenticity',
        headingHi: 'स्टोर संचालन व प्रामाणिकता',
        body: `${STORE_CONFIG.businessName} operates from Math Road, Near Hindu Society Mandir, Anand Bazar, Danapur Cantonment, Patna, Bihar – 801503. All ghee, mithai, and savory snacks are handcrafted to authentic regional standards.`,
      },
      {
        heading: 'Local Serviceable Delivery Areas',
        headingHi: 'स्थानीय डिलीवरी सेवा क्षेत्र',
        body: 'To guarantee maximum freshness for perishable confections and hot snacks, doorstep delivery is restricted to serviceable pincodes across Danapur and Patna. Free Store Pickup is available for all customers at our Anand Bazar counter.',
      },
      {
        heading: 'Pricing, Weights & Order Confirmation',
        headingHi: 'कीमत, वजन व ऑर्डर पुष्टि',
        body: 'Product prices and pack weights are displayed in Indian Rupees (INR) inclusive of applicable taxes. In rare events of unforeseen kitchen stock shortages, our team will promptly contact you to provide an equivalent fresh alternative or an immediate refund.',
      },
      {
        heading: 'Customer Conduct & Reviews',
        headingHi: 'समीक्षाएं व ग्राहक प्रतिक्रिया',
        body: 'Reviews posted on our platform reflect verified order deliveries. We reserve the right to remove inappropriate, misleading, or abusive comments to maintain a respectful community standard.',
      },
    ],
  },
  refund: {
    key: 'refund',
    path: '/refund-policy',
    eyebrow: 'Customer Care',
    title: 'Cancellation & Refund Policy',
    titleHi: 'रद्दीकरण व रिफंड नीति',
    subtitle:
      'Fair, transparent standards for perishable traditional confections and doorstep orders.',
    sections: [
      {
        heading: 'Order Cancellation Guidelines',
        headingHi: 'ऑर्डर रद्दीकरण नियम',
        body: 'Because our sweets, samosas, and ghee packs are prepared fresh daily, order cancellations are welcomed prior to kitchen preparation and dispatch. To cancel a recently placed order, visit your Order History page or call our counter immediately.',
      },
      {
        heading: 'Damaged or Incorrect Dispatches',
        headingHi: 'क्षतिग्रस्त या गलत डिलीवरी',
        body: `If your package arrives compromised, leaking, or with an incorrect item, please notify us within 24 hours of delivery at ${STORE_CONFIG.phone}. Share your order number and a quick photo, and our team will dispatch an immediate replacement or issue a refund.`,
      },
      {
        heading: 'Refund Processing Timelines',
        headingHi: 'रिफंड अवधि व माध्यम',
        body: 'Verified online payment refunds are processed directly to your original payment source (UPI account or bank card) within 3 to 5 business days. For Cash on Delivery orders, refunds are settled via UPI transfer or store credit based on your preference.',
      },
    ],
  },
};

export default function PolicyPage({ type = 'privacy' }) {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const doc = POLICY_CONTENT[type] || POLICY_CONTENT.privacy;

  const tabs = [
    { key: 'privacy', label: isHi ? 'गोपनीयता नीति' : 'Privacy Policy', path: '/privacy-policy' },
    { key: 'terms', label: isHi ? 'नियम व शर्तें' : 'Terms & Conditions', path: '/terms' },
    { key: 'refund', label: isHi ? 'रिफंड नीति' : 'Refund Policy', path: '/refund-policy' },
  ];

  return (
    <div className="bg-[#FBF7EE] py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12">
      <Container className="max-w-4xl space-y-8 sm:space-y-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-[#5A554C] flex flex-wrap items-center gap-2"
        >
          <Link to="/" className="hover:text-[#0F3D2E] transition-colors">
            {t('nav.home')}
          </Link>
          <span aria-hidden="true" className="text-[#C9A24B]">/</span>
          <span className="text-[#0F3D2E] font-semibold">
            {isHi ? doc.titleHi : doc.title}
          </span>
        </nav>

        {/* Header */}
        <div className="space-y-3 border-b border-[#E6DEC9] pb-6 sm:pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
            {doc.eyebrow}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F3D2E]">
            {isHi ? doc.titleHi : doc.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#5A554C] max-w-2xl leading-relaxed">
            {doc.subtitle}
          </p>
        </div>

        {/* Segmented Policy Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => {
            const active = tab.key === type;
            return (
              <Link
                key={tab.key}
                to={tab.path}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-[#0F3D2E] text-[#FBF7EE] shadow-sm'
                    : 'bg-[#FFFDF8] border border-[#E6DEC9] text-[#5A554C] hover:text-[#0F3D2E]'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Content Sections */}
        <div className="space-y-4">
          {doc.sections.map((sec) => (
            <Card
              key={sec.heading}
              variant="elevated"
              radius="lg"
              padding="lg"
              className="space-y-2.5 border-[#E6DEC9] bg-[#FFFDF8]"
            >
              <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F3D2E]">
                {isHi ? sec.headingHi || sec.heading : sec.heading}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A554C] leading-relaxed">
                {sec.body}
              </p>
            </Card>
          ))}
        </div>

        {/* Trust Footer Note */}
        <div className="pt-4 border-t border-[#E6DEC9] text-xs text-[#5A554C] flex flex-wrap items-center justify-between gap-3">
          <span>
            {STORE_CONFIG.businessName} • Anand Bazar, Danapur, Patna
          </span>
          <span className="font-semibold text-[#0F3D2E]">
            Customer Support: {STORE_CONFIG.phone}
          </span>
        </div>
      </Container>
    </div>
  );
}
