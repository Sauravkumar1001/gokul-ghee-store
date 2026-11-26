import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Eye,
  Flame,
  Heart,
  HelpCircle,
  Layers,
  Microscope,
  PackageCheck,
  RotateCcw,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Thermometer,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import JaaliPattern from '../ui/JaaliPattern';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { SAMPLE_PRODUCTS } from '../../data/sampleCatalog';
import { formatINR } from '../../utils/formatters';

/* =========================================================================
   PURITY LAB TESTS DATA (4 Kitchen Tests + Texture Indicator)
   ========================================================================= */
const PURITY_TESTS = [
  {
    id: 'palm-test',
    title: 'The Palm Melting Test',
    titleHi: 'हथेली पिघलन टेस्ट',
    tag: 'Quick 10-Sec Test',
    icon: Thermometer,
    short: 'Melts at human body temperature (32°C–37°C)',
    shortHi: 'शरीर के तापमान पर तुरंत पिघलना',
    temperature: '32°C – 37°C',
    steps: [
      'Take half a teaspoon of Gokul Ghee at room temperature.',
      'Place it gently on the center of your palm.',
      'Observe: Authentic Bilona Desi Ghee melts completely within 10 seconds due to natural human body heat.',
      'If it stays waxy, greasy, or solid, it likely contains hydrogenated vanaspati or palm oil.',
    ],
    stepsHi: [
      'आधा चम्मच सामान्य तापमान वाला गोकुल घी लें।',
      'इसे अपनी हथेली के बीच में रखें।',
      'जांचें: शुद्ध बिलोना देसी घी हमारे शरीर की प्राकृतिक गर्मी (~37°C) से 10 सेकंड में पूरी तरह पिघल जाता है।',
      'अगर यह मोम जैसा जमा रहे या चिपचिपा रहे, तो इसमें वनस्पति या पाम ऑयल मिला हो सकता है।',
    ],
    gokulPromise: '100% Curd-churned bilona ghee — melts softly on your tongue and skin without any greasy wax film.',
    gokulPromiseHi: '100% पारंपरिक बिलोना विधि — मुंह में रखते ही घुल जाता है, कोई चिपचिपाहट नहीं छोड़ता।',
  },
  {
    id: 'heat-test',
    title: 'Hot Ladle Caramelisation Test',
    titleHi: 'कड़ाही व हीट टेस्ट',
    tag: 'Aroma & Color',
    icon: Flame,
    short: 'Instantly caramelises into rich golden-brown with nutty aroma',
    shortHi: 'तुरंत भूरा होना और सोंधी खुशबू देना',
    temperature: 'Medium Flame',
    steps: [
      'Warm a clean steel spoon or ladle over medium flame on the stove.',
      'Drop 1 teaspoon of ghee onto the heated surface.',
      'Observe: Pure cow ghee liquefies instantly and turns a rich golden-amber brown in seconds with a fragrant nutty aroma.',
      'Adulterated ghee with animal tallow or vegetable fat takes noticeably longer to melt and turns pale yellowish or burns without aroma.',
    ],
    stepsHi: [
      'गैस पर एक साफ चम्मच या कलछुल को हल्का गर्म करें।',
      'उसमें एक चम्मच घी डालें।',
      'जांचें: शुद्ध देसी घी तुरंत पिघलकर कुछ ही पलों में हल्का सुनहरा-भूरा (ब्राउन) हो जाता है और सोंधी खुशबू देता है।',
      'मिलावटी घी पिघलने में ज्यादा समय लेता है और बिना किसी खुशबू के हल्का पीला ही रहता है।',
    ],
    gokulPromise: 'Slowly clarified in traditional Danapur brass bhattis — caramelises with the signature nostalgic aroma of Anand Bazar.',
    gokulPromiseHi: 'दानापुर की पारंपरिक पीतल भट्टियों में धीमी आंच पर पकाया गया — शुद्ध कैरामेलाइज खुशबू की पहचान।',
  },
  {
    id: 'iodine-test',
    title: 'The 2-Drop Iodine Starch Test',
    titleHi: 'आयोडीन स्टार्च टेस्ट',
    tag: 'Lab Chemical Test',
    icon: Microscope,
    short: '0% Starch / Boiled Potato adulteration check',
    shortHi: 'आलू या अरारोट की मिलावट शून्य',
    temperature: 'Room Temp',
    steps: [
      'Melt 1 tablespoon of ghee in a small transparent glass or bowl.',
      'Add 2 drops of standard tincture iodine solution (available at any medical store).',
      'Mix gently and observe color after 30 seconds.',
      'Observe: Pure ghee retains its warm golden color. If it turns blue, dark purple, or black, starch or boiled potato was added.',
    ],
    stepsHi: [
      'एक छोटी कांच की कटोरी में एक चम्मच घी पिघला लें।',
      'उसमें टिंचर आयोडीन (किसी भी मेडिकल स्टोर पर मिलने वाला) की 2 बूंदें डालें।',
      'हल्का सा हिलाएं और 30 सेकंड बाद रंग देखें।',
      'जांचें: शुद्ध घी का रंग सुनहरा ही रहता है। अगर रंग नीला या गहरा जामुनी हो जाए, तो उसमें आलू या स्टार्च मिलाया गया है।',
    ],
    gokulPromise: '0% starch, 0% fillers, zero preservatives. Certified by food safety regulators (FSSAI).',
    gokulPromiseHi: 'शून्य स्टार्च, शून्य मिलावट। 100% शुद्ध गाय का मक्खन, FSSAI मानकों के अनुरूप।',
  },
  {
    id: 'layer-test',
    title: 'Cold Double-Boil & Fridge Test',
    titleHi: 'फ्रिज व सेपरेशन टेस्ट',
    tag: 'Uniform Purity',
    icon: Layers,
    short: 'Solidifies into a single uniform golden granular mass',
    shortHi: 'एक समान परत में रवेदार जमना',
    temperature: '4°C Refrigeration',
    steps: [
      'Warm a small jar of ghee until completely liquid and clear.',
      'Place the uncovered transparent jar in your refrigerator for 1 to 2 hours.',
      'Observe: Authentic ghee cools into a solid, completely uniform mass with fine golden grains throughout.',
      'If mixed with cheaper palm oil, mineral oils, or synthetic fats, they freeze at different temperatures and form distinct separated layers.',
    ],
    stepsHi: [
      'थोड़ा घी पिघलाकर एक साफ कांच की शीशी में डालें।',
      'उसे 1-2 घंटे के लिए फ्रिज में रख दें।',
      'जांचें: शुद्ध बिलोना घी पूरे जार में एक समान, सुंदर दानेदार रूप में जमता है।',
      'अगर कई तरह के तेल मिले हों, तो वे अलग-अलग तापमान पर जमने की वजह से अलग-अलग रंग की परतें (layers) बना देते हैं।',
    ],
    gokulPromise: 'Single-source authentic dairy fat — crystals form naturally and evenly at cold temperatures.',
    gokulPromiseHi: 'एक ही शुद्ध स्रोत — ठंडा होने पर प्राकृतिक रूप से एक समान दानेदार संरचना बनती है।',
  },
];

/* =========================================================================
   MAIN GHEE USAGE METER & PURITY SECTION COMPONENT
   ========================================================================= */
export default function GheeUsagePuritySection() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const reducedMotion = useReducedMotion();
  const { addItem } = useCart();

  // Active top tab: "calculator" (Usage Meter) vs "purity" (Purity Guide)
  const [activeMainTab, setActiveMainTab] = useState('calculator');

  // Calculator Sub-mode: "household" | "puja" | "feast"
  const [calcMode, setCalcMode] = useState('household');

  // Mode 1: Household parameters
  const [familyMembers, setFamilyMembers] = useState(4);
  const [consumptionStyle, setConsumptionStyle] = useState('balanced'); // "light" | "balanced" | "traditional"

  // Mode 2: Puja parameters
  const [pujaType, setPujaType] = useState('katha'); // "daily_diya" | "katha" | "mahayagya"

  // Mode 3: Feast & Halwa parameters
  const [sweetType, setSweetType] = useState('halwa'); // "halwa" | "laddoo" | "daawat"
  const [sweetQuantity, setSweetQuantity] = useState(2); // kg or plates

  // Cart feedback state
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Active selected test for Purity Lab
  const [selectedTestId, setSelectedTestId] = useState('palm-test');
  const selectedTest = useMemo(
    () => PURITY_TESTS.find((item) => item.id === selectedTestId) || PURITY_TESTS[0],
    [selectedTestId]
  );

  // Reference product from catalog
  const cowGheeProduct = useMemo(
    () => SAMPLE_PRODUCTS.find((p) => p.slug === 'sample-shahi-desi-cow-ghee') || SAMPLE_PRODUCTS[0],
    []
  );

  /* -------------------------------------------------------------------------
     CALCULATION LOGIC
     ------------------------------------------------------------------------- */
  const calculationResult = useMemo(() => {
    let monthlyGrams = 0;
    let label = '';
    let labelHi = '';
    let rationale = '';
    let rationaleHi = '';

    if (calcMode === 'household') {
      // Grams per person per day
      const dailyGramsPerPerson =
        consumptionStyle === 'light' ? 15 : consumptionStyle === 'balanced' ? 30 : 50;
      monthlyGrams = familyMembers * dailyGramsPerPerson * 30;

      label = `${(monthlyGrams / 1000).toFixed(1)} kg / month`;
      labelHi = `${(monthlyGrams / 1000).toFixed(1)} किग्रा / माह`;

      rationale = `Based on ~${dailyGramsPerPerson}g daily intake per person across ${familyMembers} family members.`;
      rationaleHi = `प्रति व्यक्ति प्रतिदिन ~${dailyGramsPerPerson} ग्राम उपभोग (${familyMembers} सदस्यों के लिए)।`;
    } else if (calcMode === 'puja') {
      if (pujaType === 'daily_diya') {
        monthlyGrams = 500;
        label = '500g Pack';
        labelHi = '500 ग्राम पैक';
        rationale = 'Ideal for 30 days of morning & evening brass diya aarti offerings.';
        rationaleHi = '30 दिनों की सुबह-शाम दीया आरती व पूजन के लिए उपयुक्त।';
      } else if (pujaType === 'katha') {
        monthlyGrams = 1500;
        label = '1.5 kg (1kg Jar + 500g)';
        labelHi = '1.5 किग्रा (1kg जार + 500g)';
        rationale = 'Sufficient for Griha Pravesh, Satyanarayan Katha, and traditional home havan rituals.';
        rationaleHi = 'गृह प्रवेश, सत्यनारायण कथा व पारिवारिक हवन अनुष्ठान हेतु पर्याप्त।';
      } else {
        monthlyGrams = 5000;
        label = '5 kg Ritual Bulk Pack';
        labelHi = '5 किग्रा महायज्ञ पैक';
        rationale = 'Grand Navchandi, 3-day Vedic yagya, and multi-pandit sacred ahuti rituals.';
        rationaleHi = 'महायज्ञ, नवचंडी व बड़े वैदिक आहुति अनुष्ठानों के लिए।';
      }
    } else {
      // Feast & Halwa
      if (sweetType === 'halwa') {
        // ~700g ghee per 1kg suji/moong
        monthlyGrams = Math.round(sweetQuantity * 700);
        label = `${(monthlyGrams / 1000).toFixed(1)} kg Ghee`;
        labelHi = `${(monthlyGrams / 1000).toFixed(1)} किग्रा घी`;
        rationale = `Required for preparing ~${sweetQuantity} kg of rich, slow-roasted Suji, Moong Dal, or Gajar Halwa.`;
        rationaleHi = `लगभग ${sweetQuantity} किग्रा रवेदार सूजी, मूंग दाल या गाजर हलवे की तैयारी के लिए।`;
      } else if (sweetType === 'laddoo') {
        // ~600g ghee per 1kg besan
        monthlyGrams = Math.round(sweetQuantity * 600);
        label = `${(monthlyGrams / 1000).toFixed(1)} kg Ghee`;
        labelHi = `${(monthlyGrams / 1000).toFixed(1)} किग्रा घी`;
        rationale = `Required for binding ~${sweetQuantity} kg of fragrant Besan, Motichoor, or Gond Laddoos.`;
        rationaleHi = `लगभग ${sweetQuantity} किग्रा बेसन, मोतीचूर या गोंद के लड्डू बनाने के लिए।`;
      } else {
        // Daawat per guest plates (~50g per plate for dal tadka, puri, pulao)
        monthlyGrams = Math.round(sweetQuantity * 50);
        label = `${(monthlyGrams / 1000).toFixed(1)} kg Ghee`;
        labelHi = `${(monthlyGrams / 1000).toFixed(1)} किग्रा घी`;
        rationale = `Calculated for ~${sweetQuantity} guests dining at a family gathering or celebratory feast.`;
        rationaleHi = `पारिवारिक दावत व प्रीतिभोज में ~${sweetQuantity} अतिथियों के भोजन हेतु।`;
      }
    }

    // Determine product variant recommendation
    let recommendedVariant = null;
    let packDescription = '';
    let packDescriptionHi = '';
    let unitCount = 1;

    const v250 = cowGheeProduct?.variants?.find((v) => v.weightGrams === 250);
    const v500 = cowGheeProduct?.variants?.find((v) => v.weightGrams === 500);
    const v1000 = cowGheeProduct?.variants?.find((v) => v.weightGrams === 1000);

    if (monthlyGrams <= 350) {
      recommendedVariant = v250 || cowGheeProduct?.variants?.[0];
      packDescription = '1x 250g Glass Jar';
      packDescriptionHi = '1x 250 ग्राम शीशा जार';
    } else if (monthlyGrams <= 750) {
      recommendedVariant = v500 || cowGheeProduct?.variants?.[1];
      packDescription = '1x 500g Heritage Jar';
      packDescriptionHi = '1x 500 ग्राम हेरिटेज जार';
    } else if (monthlyGrams <= 1250) {
      recommendedVariant = v1000 || cowGheeProduct?.variants?.[2];
      packDescription = '1x 1kg Signature Family Jar';
      packDescriptionHi = '1x 1 किग्रा सिग्नेचर जार';
    } else if (monthlyGrams <= 2200) {
      recommendedVariant = v1000 || cowGheeProduct?.variants?.[2];
      unitCount = 2;
      packDescription = '2x 1kg Signature Family Jars';
      packDescriptionHi = '2x 1 किग्रा सिग्नेचर जार (2 किलो)';
    } else {
      recommendedVariant = v1000 || cowGheeProduct?.variants?.[2];
      unitCount = Math.max(3, Math.ceil(monthlyGrams / 1000));
      packDescription = `${unitCount}x 1kg Signature Jars (${unitCount} kg)`;
      packDescriptionHi = `${unitCount}x 1 किग्रा सिग्नेचर जार (${unitCount} किलो)`;
    }

    const price = (recommendedVariant?.price || 1190) * unitCount;
    const mrp = (recommendedVariant?.mrp || 1320) * unitCount;
    const savings = mrp - price;

    return {
      monthlyGrams,
      label,
      labelHi,
      rationale,
      rationaleHi,
      recommendedVariant,
      packDescription,
      packDescriptionHi,
      unitCount,
      price,
      mrp,
      savings,
    };
  }, [calcMode, familyMembers, consumptionStyle, pujaType, sweetType, sweetQuantity, cowGheeProduct]);

  /* -------------------------------------------------------------------------
     ADD RECOMMENDED PACK TO CART
     ------------------------------------------------------------------------- */
  const handleAddToCart = () => {
    if (!cowGheeProduct || !calculationResult.recommendedVariant) return;

    addItem(
      cowGheeProduct,
      calculationResult.recommendedVariant,
      calculationResult.unitCount,
      { openCartDrawer: true }
    );

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2400);
  };

  return (
    <section
      id="ghee-usage-meter"
      aria-label="Gokul Ghee Usage Meter & Purity Guide"
      className="relative py-8 sm:py-10 md:py-12 overflow-hidden bg-gradient-to-b from-[#0A2B20] via-[#082219] to-[#04150F] text-[#FBF7EE] select-none"
    >
      {/* Ambient background light orbs */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#C9A24B]/14 blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#059669]/14 blur-[85px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#E8D08B]/4 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
        {/* Compact Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#155742]/80 border border-[#C9A24B]/35 text-[#E8D08B] text-[11px] font-bold tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-[#C9A24B]" />
            <span>
              {isHi ? 'स्मार्ट गाइड • दानपुर रसोई' : 'Interactive Kitchen Tools'}
            </span>
          </div>

          <h2 className="font-editorial text-2xl sm:text-3xl lg:text-[2rem] font-bold text-[#FBF7EE] leading-tight">
            {isHi ? 'कितना घी लगेगा? और शुद्धता कैसे जांचें?' : 'Smart Ghee Meter & Kitchen Purity Lab'}
          </h2>

          <p className="text-xs sm:text-sm text-[#FBF7EE]/80 leading-relaxed max-w-lg mx-auto">
            {isHi
              ? 'परिवार, पूजा या दावत के लिए सही मात्रा का त्वरित अनुमान लगाएं और शुद्धता के 4 सरल टेस्ट जानें।'
              : 'Estimate household or celebration needs in seconds, and discover 4 easy kitchen tests for pure Bilona Ghee.'}
          </p>
        </div>

        {/* Compact Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-xl bg-[#041D14]/90 border border-[#C9A24B]/30 backdrop-blur-md shadow-md">
            <button
              type="button"
              onClick={() => setActiveMainTab('calculator')}
              className={`relative px-4 sm:px-5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeMainTab === 'calculator'
                  ? 'text-[#0A261B]'
                  : 'text-[#E8D08B]/80 hover:text-[#FBF7EE]'
              }`}
            >
              {activeMainTab === 'calculator' && (
                <motion.div
                  layoutId="gheeSectionActiveTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#C9A24B] via-[#E8D08B] to-[#C9A24B] rounded-lg shadow-md"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>{isHi ? 'घी कैलकुलेटर' : 'Ghee Usage Meter'}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('purity')}
              className={`relative px-4 sm:px-5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeMainTab === 'purity'
                  ? 'text-[#0A261B]'
                  : 'text-[#E8D08B]/80 hover:text-[#FBF7EE]'
              }`}
            >
              {activeMainTab === 'purity' && (
                <motion.div
                  layoutId="gheeSectionActiveTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#C9A24B] via-[#E8D08B] to-[#C9A24B] rounded-lg shadow-md"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isHi ? 'शुद्धता की पहचान (4 टेस्ट)' : 'Purity Verification (4 Tests)'}</span>
              </span>
            </button>
          </div>
        </div>

        {/* VIEW 1: SMART GHEE CALCULATOR */}
        <AnimatePresence mode="wait">
          {activeMainTab === 'calculator' ? (
            <motion.div
              key="calculator-view"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch"
            >
              {/* Left Column: Interactive Inputs */}
              <div
                className="lg:col-span-7 rounded-2xl p-4 sm:p-5 border border-[#C9A24B]/30 backdrop-blur-md flex flex-col justify-between space-y-3.5 shadow-lg"
                style={{
                  backgroundColor: 'rgba(5, 34, 24, 0.75)',
                }}
              >
                {/* 1. Purpose Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8D08B] block">
                    1. {isHi ? 'उपयोग का प्रकार चुनें' : 'Select Purpose'}
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'household', icon: Users, label: isHi ? 'घरेलू रसोई' : 'Daily Home', sub: isHi ? 'मासिक' : 'Monthly' },
                      { id: 'puja', icon: Flame, label: isHi ? 'पूजा व हवन' : 'Puja & Rituals', sub: isHi ? 'आहुति' : 'Rituals' },
                      { id: 'feast', icon: UtensilsCrossed, label: isHi ? 'हलवा व दावत' : 'Feasts & Sweets', sub: isHi ? 'पर्व' : 'Events' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = calcMode === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCalcMode(item.id)}
                          className={`py-2 px-2.5 rounded-xl border text-center transition-all duration-150 cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            active
                              ? 'bg-[#155742] border-[#E8D08B] text-[#FBF7EE] shadow-xs'
                              : 'bg-[#031911]/50 border-[#C9A24B]/20 text-[#FBF7EE]/70 hover:bg-[#031911]/80 hover:text-[#FBF7EE]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-[#C9A24B]" />
                            <span className="text-xs font-bold leading-tight">{item.label}</span>
                          </div>
                          <span className="text-[10px] text-[#E8D08B]/70 leading-none">{item.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2 & 3 Sub-inputs based on mode */}
                <div className="space-y-3 pt-1 border-t border-[#C9A24B]/20">
                  {calcMode === 'household' && (
                    <>
                      {/* Family size slider + quick pills in one clean row */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#E8D08B]">
                            2. {isHi ? 'परिवार सदस्य' : 'Family Members'}:
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#155742] border border-[#C9A24B]/40 text-[#E8D08B] font-bold text-xs">
                            {familyMembers} {isHi ? 'लोग' : 'people'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={familyMembers}
                            onChange={(e) => setFamilyMembers(Number(e.target.value))}
                            aria-label="Family members count"
                            className="flex-1 h-1.5 rounded-lg bg-[#041D14] accent-[#C9A24B] cursor-pointer"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            {[2, 4, 6, 8].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setFamilyMembers(num)}
                                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                                  familyMembers === num
                                    ? 'bg-[#C9A24B] text-[#0A261B] border-[#C9A24B]'
                                    : 'bg-[#041D14]/60 border-[#C9A24B]/30 text-[#FBF7EE]/80 hover:border-[#E8D08B]'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Usage style pills */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8D08B] block">
                          3. {isHi ? 'उपयोग की आदत' : 'Cooking Style'}
                        </span>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'light', title: isHi ? 'हल्का' : 'Light', desc: '~15g/day' },
                            { id: 'balanced', title: isHi ? 'मध्यम' : 'Balanced', desc: '~30g/day' },
                            { id: 'traditional', title: isHi ? 'पारंपरिक' : 'Traditional', desc: '~50g/day' },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setConsumptionStyle(item.id)}
                              className={`py-2 px-2 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                                consumptionStyle === item.id
                                  ? 'bg-[#155742] border-[#E8D08B] text-[#FBF7EE]'
                                  : 'bg-[#041D14]/40 border-[#C9A24B]/20 text-[#FBF7EE]/70 hover:bg-[#041D14]/70'
                              }`}
                            >
                              <p className="text-xs font-bold leading-tight">{item.title}</p>
                              <p className="text-[10px] text-[#E8D08B]/70 mt-0.5">{item.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {calcMode === 'puja' && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8D08B] block">
                        2. {isHi ? 'अनुष्ठान का प्रकार चुनें' : 'Ritual Requirement'}
                      </span>

                      <div className="space-y-1.5">
                        {[
                          { id: 'daily_diya', title: isHi ? 'दैनिक संध्या आरती व दीया' : 'Daily 30-Day Diya & Mandir Aarti', badge: '500g' },
                          { id: 'katha', title: isHi ? 'सत्यनारायण कथा / गृह प्रवेश' : 'Satyanarayan Katha / Griha Pravesh', badge: '1.5 kg' },
                          { id: 'mahayagya', title: isHi ? 'महायज्ञ / नवचंडी / बड़ा अनुष्ठान' : 'Vedic Yagya / Grand Mahayagya', badge: '5 kg Bulk' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPujaType(item.id)}
                            className={`w-full py-2 px-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 ${
                              pujaType === item.id
                                ? 'bg-[#155742] border-[#E8D08B] text-[#FBF7EE]'
                                : 'bg-[#041D14]/40 border-[#C9A24B]/20 text-[#FBF7EE]/70 hover:bg-[#041D14]/70'
                            }`}
                          >
                            <p className="text-xs font-bold text-[#FBF7EE] truncate">{item.title}</p>
                            <span className="px-2 py-0.5 rounded-full bg-[#041D14] border border-[#C9A24B]/30 text-[10px] font-bold text-[#E8D08B] shrink-0">
                              {item.badge}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {calcMode === 'feast' && (
                    <div className="space-y-2.5">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8D08B] block">
                          2. {isHi ? 'क्या तैयार कर रहे हैं?' : 'What are you preparing?'}
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'halwa', label: isHi ? 'हलवा (सूजी/मूंग)' : 'Halwa' },
                            { id: 'laddoo', label: isHi ? 'लड्डू (बेसन/गोंद)' : 'Laddoo' },
                            { id: 'daawat', label: isHi ? 'दावत / प्रीतिभोज' : 'Guest Feast' },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSweetType(item.id)}
                              className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer text-xs font-bold ${
                                sweetType === item.id
                                  ? 'bg-[#155742] border-[#E8D08B] text-[#FBF7EE]'
                                  : 'bg-[#041D14]/40 border-[#C9A24B]/20 text-[#FBF7EE]/70'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#E8D08B]">
                            3. {sweetType === 'daawat' ? (isHi ? 'अतिथियों की संख्या' : 'Guest Plates') : (isHi ? 'मिठाई मात्रा' : 'Weight to Prepare')}:
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#155742] border border-[#C9A24B]/40 text-[#E8D08B] font-bold text-xs">
                            {sweetQuantity} {sweetType === 'daawat' ? (isHi ? 'लोग' : 'guests') : (isHi ? 'किलो' : 'kg')}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={sweetType === 'daawat' ? '15' : '1'}
                          max={sweetType === 'daawat' ? '120' : '10'}
                          step={sweetType === 'daawat' ? '5' : '0.5'}
                          value={sweetQuantity}
                          onChange={(e) => setSweetQuantity(Number(e.target.value))}
                          aria-label="Sweet quantity slider"
                          className="w-full h-1.5 rounded-lg bg-[#041D14] accent-[#C9A24B] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Compact Ayurvedic Health Insight */}
                <div className="p-2.5 rounded-xl bg-[#031911]/80 border border-[#C9A24B]/20 flex items-center gap-2 text-[11px] text-[#E8D08B]/90">
                  <Heart className="w-3.5 h-3.5 text-[#C9A24B] shrink-0" />
                  <p className="leading-snug truncate">
                    <strong className="text-[#FBF7EE]">{isHi ? 'आयुर्वेदिक परामर्श: ' : 'Ayurvedic Guidance: '}</strong>
                    {isHi ? 'प्रतिदिन 1–2 चम्मच शुद्ध बिलोना घी पाचन और ऊर्जा के लिए उत्तम है।' : '1–2 tablespoons daily fuels digestion & natural vitality.'}
                  </p>
                </div>
              </div>

              {/* Right Column: Dynamic Recommendation Result Card */}
              <div
                className="lg:col-span-5 rounded-2xl p-4 sm:p-5 border border-[#E8D08B]/40 backdrop-blur-lg flex flex-col justify-between space-y-3.5 shadow-xl relative overflow-hidden"
                style={{ backgroundColor: 'rgba(7, 43, 31, 0.88)' }}
              >
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8D08B] px-2 py-0.5 rounded-full bg-[#155742] border border-[#C9A24B]/40">
                      {isHi ? 'अनुमानित मात्रा' : 'Estimated Requirement'}
                    </span>
                    <span className="text-[11px] text-[#E8D08B]/80 flex items-center gap-1">
                      <Scale className="w-3 h-3 text-[#C9A24B]" />
                      Danapur Fresh
                    </span>
                  </div>

                  {/* Quantity Display */}
                  <div>
                    <motion.div
                      key={calculationResult.label}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-editorial text-3xl sm:text-4xl font-bold text-[#E8D08B] leading-none"
                    >
                      {isHi ? calculationResult.labelHi : calculationResult.label}
                    </motion.div>
                    <p className="text-[11px] text-[#FBF7EE]/80 leading-relaxed pt-1">
                      {isHi ? calculationResult.rationaleHi : calculationResult.rationale}
                    </p>
                  </div>

                  {/* Recommended Pack Breakdown Box */}
                  <div className="p-3 rounded-xl bg-[#031911]/90 border border-[#C9A24B]/35 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E8D08B]/50 bg-[#072419] shrink-0">
                        <img
                          src="/images/cat-desi-ghee.jpg"
                          alt="Gokul Desi Ghee Jar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#C9A24B] block leading-none">
                          {isHi ? 'सुझाया गया पैक' : 'Recommended Pack'}
                        </span>
                        <h4 className="text-xs font-bold text-[#FBF7EE] truncate mt-0.5">
                          {isHi ? calculationResult.packDescriptionHi : calculationResult.packDescription}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-[#FBF7EE]">
                        {formatINR(calculationResult.price)}
                      </div>
                      {calculationResult.savings > 0 && (
                        <span className="text-[10px] text-[#A7F3D0] font-semibold">
                          Save {formatINR(calculationResult.savings)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add to Cart CTA */}
                <div className="space-y-2 relative z-10 pt-1">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A24B] via-[#E8D08B] to-[#C9A24B] text-[#0A261B] text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    {addedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#0A261B]" />
                        <span>{isHi ? 'कार्ट में जोड़ दिया गया!' : 'Added to Cart!'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#0A261B]" />
                        <span>{isHi ? 'यह पैक कार्ट में जोड़ें' : 'Add Recommended Pack to Cart'}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-[#E8D08B]/80 px-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#C9A24B]" />
                      Tamper-evident sealed
                    </span>
                    <Link
                      to="/shop/desi-ghee"
                      className="hover:text-[#FBF7EE] underline underline-offset-2 flex items-center gap-1"
                    >
                      <span>{isHi ? 'सभी घी पैक देखें' : 'View All Packs'}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* VIEW 2: KITCHEN PURITY GUIDE */
            <motion.div
              key="purity-view"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch"
            >
              {/* Left Column: 4 Test Cards Selector */}
              <div className="lg:col-span-5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#E8D08B] pl-1">
                  {isHi ? 'घर पर शुद्धता की 4 प्रामाणिक विधियां' : '4 Traditional Verification Tests'}
                </p>

                {PURITY_TESTS.map((test, index) => {
                  const Icon = test.icon;
                  const isSelected = selectedTestId === test.id;

                  return (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() => setSelectedTestId(test.id)}
                      className={`w-full py-2.5 px-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-[#155742] border-[#E8D08B] shadow-xs'
                          : 'bg-[#052218]/60 border-[#C9A24B]/25 hover:bg-[#052218]/90 text-[#FBF7EE]/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-[#E8D08B] text-[#0A261B] border-[#E8D08B]'
                              : 'bg-[#031911] text-[#E8D08B] border-[#C9A24B]/30'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-[#E8D08B] uppercase">
                              Test {index + 1}
                            </span>
                            <span className="text-[8px] px-1 rounded bg-[#031911]/80 text-[#E8D08B]/80 border border-[#C9A24B]/20">
                              {test.tag}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#FBF7EE] truncate mt-0.5">
                            {isHi ? test.titleHi : test.title}
                          </h4>
                          <p className="text-[10px] text-[#FBF7EE]/70 truncate">
                            {isHi ? test.shortHi : test.short}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isSelected ? 'text-[#E8D08B] translate-x-0.5' : 'text-[#C9A24B]/40'
                        }`}
                      />
                    </button>
                  );
                })}

                {/* Danedar Texture Callout Card */}
                <div className="p-3 rounded-xl bg-[#031911]/80 border border-[#C9A24B]/30 flex items-start gap-2.5 text-xs text-[#FBF7EE]/85">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A24B] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-[#E8D08B] text-[11px]">
                      {isHi ? 'रवेदार दानेदार बनावट का रहस्य' : 'Why Pure Ghee is Naturally Granular'}
                    </h5>
                    <p className="text-[10px] text-[#FBF7EE]/75 mt-0.5 leading-snug">
                      {isHi
                        ? 'शुद्ध बिलोना घी कमरे के तापमान पर धीरे-धीरे ठंडा होकर सुंदर दाने बनाता है।'
                        : 'Authentic bilona ghee crystallizes into natural sand-like grains (रवा) as it cools slowly.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Test Step-by-Step Lab Card */}
              <div
                className="lg:col-span-7 rounded-2xl p-4 sm:p-5 border border-[#E8D08B]/40 backdrop-blur-lg flex flex-col justify-between space-y-3.5 shadow-xl relative overflow-hidden"
                style={{
                  backgroundColor: 'rgba(7, 43, 31, 0.88)',
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#C9A24B]/25">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#C9A24B] block">
                        Kitchen Verification Method
                      </span>
                      <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#FBF7EE] mt-0.5">
                        {isHi ? selectedTest.titleHi : selectedTest.title}
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#155742] border border-[#C9A24B]/40 text-[11px] font-bold text-[#E8D08B]">
                      {selectedTest.temperature}
                    </span>
                  </div>

                  {/* Steps Checklist */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8D08B] block">
                      {isHi ? 'जांच की सरल विधि (Steps):' : 'Step-by-Step Procedure:'}
                    </span>

                    <div className="space-y-1.5">
                      {(isHi ? selectedTest.stepsHi : selectedTest.steps).map((step, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-[#031911]/85 border border-[#C9A24B]/20 flex items-start gap-2 text-xs text-[#FBF7EE]/90 leading-relaxed"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#155742] border border-[#C9A24B]/50 flex items-center justify-center font-bold text-[9px] text-[#E8D08B] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gokul Quality Guarantee for this test */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#155742]/90 to-[#0A2B20]/90 border border-[#E8D08B]/40 flex items-center gap-2 text-xs text-[#E8D08B]">
                    <Award className="w-4 h-4 text-[#C9A24B] shrink-0" />
                    <p className="text-[11px] text-[#FBF7EE]/90 leading-snug">
                      {isHi ? selectedTest.gokulPromiseHi : selectedTest.gokulPromise}
                    </p>
                  </div>
                </div>

                {/* Bottom Trust Certification Bar */}
                <div className="pt-2 border-t border-[#C9A24B]/20 flex items-center justify-between text-[11px] text-[#E8D08B]/90">
                  <span className="flex items-center gap-1 font-bold text-[#FBF7EE]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B]" />
                    FSSAI Verified
                  </span>
                  <Link
                    to="/shop/desi-ghee"
                    className="hover:text-[#FBF7EE] underline underline-offset-2 flex items-center gap-1 font-semibold"
                  >
                    <span>Order Pure Ghee</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
