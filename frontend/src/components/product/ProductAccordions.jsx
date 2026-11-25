import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

function buildIngredientNote(product, isHi) {
  if (product.ingredients) return product.ingredients;
  const cat = product.categorySlug;

  if (cat === 'desi-ghee') {
    return isHi
      ? 'शुद्ध दूध मक्खन (धीमी आंच पर बिलोना विधि से तैयार)। कोई प्रिजर्वेटिव, कृत्रिम रंग या मिलावट नहीं।'
      : 'Pure slow-simmered milk fat clarified in small batches. Free from artificial colors, synthetic aromas, or vegetable oils.';
  }
  if (cat === 'mithai' || cat === 'festival-specials') {
    return isHi
      ? 'चुनिंदा सूखे मेवे (काजू/पिस्ता/बादाम), शुद्ध देसी घी, केसर, हरी इलायची एवं संतुलित शक्कर।'
      : 'Prepared in pure desi ghee with handpicked nuts, green cardamom, saffron threads, and balanced cane sweetness.';
  }
  if (cat === 'samosa' || cat === 'namkeen' || cat === 'traditional-snacks') {
    return isHi
      ? 'चक्की बेसन/आटा, ताज़े भुने मसाले, जीरा, अजवाइन, सेंधा/सफेद नमक और शुद्ध खाना पकाने का माध्यम।'
      : 'Crafted from freshly milled flours, whole roasted spices, ajwain, cumin, and clean small-batch frying discipline.';
  }
  return isHi
    ? 'गोकुल घी आनंद बाजार रसोई से चुनिंदा देसी घी और हस्तनिर्मित मिठाई/नमकीन।'
    : 'Assorted signature Desi Ghee jars and freshly packed Mithai or savory classics from Anil Ji Ka Gokul Ghee.';
}

export default function ProductAccordions({ product }) {
  const [openKey, setOpenKey] = useState('description');
  const { language } = useLanguage();
  const prefersReduced = useReducedMotion();
  const isHi = language === 'hi';

  const cleanHighlights = (product.highlights || []).filter(
    (line) => !/Admin|MongoDB|Phase\s*\d|Sample culinary highlight/i.test(line)
  );

  const sections = [
    {
      key: 'description',
      title: isHi ? 'उत्पाद विवरण' : 'Description & Highlights',
      content: (
        <div className="space-y-3 text-sm text-[#4A463F] leading-relaxed">
          <p>{product.shortDescription || product.description}</p>
          {cleanHighlights.length > 0 && (
            <ul className="space-y-2 pt-1">
              {cleanHighlights.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[#1B1B1B]">
                  <Check className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      key: 'ingredients',
      title: isHi ? 'सामग्री एवं शुद्धता' : 'Ingredients & Purity',
      content: (
        <p className="text-sm text-[#4A463F] leading-relaxed">
          {buildIngredientNote(product, isHi)}
        </p>
      ),
    },
    {
      key: 'storage',
      title: isHi ? 'भंडारण और शेल्फ लाइफ' : 'Storage & Shelf Life',
      content: (
        <div className="space-y-2 text-sm text-[#4A463F] leading-relaxed">
          <p>{product.storageNote}</p>
          <p className="text-xs text-[#6E6759]">
            {isHi
              ? 'हमेशा सूखे और साफ चम्मच का उपयोग करें।'
              : 'Keep lid tightly closed after opening and always use a clean, dry spoon.'}
          </p>
        </div>
      ),
    },
    {
      key: 'delivery',
      title: isHi ? 'डिलीवरी और वापसी नीति' : 'Delivery & Returns',
      content: (
        <div className="space-y-2 text-sm text-[#4A463F] leading-relaxed">
          <p>
            {isHi
              ? 'आनंद बाजार, दानापुर कैंट और पटना क्षेत्र में ताज़े बैच की स्थानीय डिलीवरी उपलब्ध है।'
              : 'Dispatched fresh from our Math Road, Anand Bazar storefront across Danapur Cantonment & Patna zones.'}
          </p>
          <Link
            to="/refund-policy"
            className="inline-block text-xs font-semibold text-[#0F3D2E] underline underline-offset-4 hover:text-[#9C7725]"
          >
            {isHi ? 'डिलीवरी व रिफंड नीति पढ़ें' : 'Read Shipping & Freshness Policy'}
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-[20px] border border-[#C9A24B]/30 bg-[#FFFDF8] divide-y divide-[#0F3D2E]/10 overflow-hidden gg-shadow-sm">
      {sections.map((section) => {
        const isOpen = openKey === section.key;
        return (
          <div key={section.key}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenKey(isOpen ? null : section.key)}
              className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#F3EAD7]/45 transition-colors cursor-pointer"
            >
              <span className="font-editorial text-lg font-semibold text-[#0F3D2E]">
                {section.title}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#9C7725] shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={prefersReduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={prefersReduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pt-1">{section.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
