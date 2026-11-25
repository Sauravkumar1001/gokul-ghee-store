import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, Phone, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '../config/storeConfig';
import { useLanguage } from '../context/LanguageContext';
import { Badge, Button, Card, Container } from '../components/ui';

function buildFaqs(language) {
  if (language === 'hi') {
    return [
      {
        q: 'अनिल जी का गोकुल घी स्टोर कहाँ स्थित है?',
        a: `हमारा स्टोर मठ रोड, हिंदू सोसाइटी मंदिर के पास, आनंद बाजार, दानापुर कैंटोनमेंट, पटना, बिहार – 801503 में स्थित है। आप हमारे Visit Store पेज से लाइव Google Maps दिशा-निर्देश भी खोल सकते हैं।`,
      },
      {
        q: 'दुकान खुलने का समय क्या है?',
        a: `हमारा स्टोर प्रतिदिन सुबह 9:00 बजे से रात 9:00 बजे तक खुला रहता है। प्रमुख त्योहारों पर ताज़ा बैच की उपलब्धता या विशेष पूछताछ के लिए ${STORE_CONFIG.phone} पर कॉल करें।`,
      },
      {
        q: 'क्या आप घर बैठे होम डिलीवरी करते हैं?',
        a: 'जी हाँ! ताज़ा खोया मिठाई, गरमा-गरम समोसे और शुद्ध देसी घी की गुणवत्ता बनाए रखने के लिए हम दानापुर और पटना के सभी प्रमुख पिनकोड पर तेज़ स्थानीय डिलीवरी प्रदान करते हैं। आप किसी भी उत्पाद पेज पर अपना 6 अंकों का पिनकोड डालकर तुरंत उपलब्धता जांच सकते हैं।',
      },
      {
        q: 'क्या स्टोर पिकअप की सुविधा उपलब्ध है?',
        a: 'जी हाँ! आनंद बाजार, दानापुर स्टोर काउंटर से नि:शुल्क स्टोर पिकअप सभी ऑनलाइन ऑर्डर के लिए हमेशा उपलब्ध है।',
      },
      {
        q: 'चेकआउट पर कौन से भुगतान विकल्प उपलब्ध हैं?',
        a: 'हम कैश ऑन डिलीवरी (COD / डिलीवरी पर नकद व UPI) तथा रेज़रपे (Razorpay) के माध्यम से सुरक्षित ऑनलाइन भुगतान (UPI, Google Pay, PhonePe, क्रेडिट/डेबिट कार्ड, नेट बैंकिंग) दोनों स्वीकार करते हैं।',
      },
      {
        q: 'क्या त्योहारों व शादी-विवाह के लिए थोक ऑर्डर दिए जा सकते हैं?',
        a: `बिल्कुल! दिवाली, छठ, पारिवारिक आयोजनों व उपहारों के लिए विशेष ड्राई-फ्रूट मिठाई डिब्बे और देसी घी के जार तैयार किए जाते हैं। विशेष दरों व प्री-ऑर्डर के लिए सीधे काउंटर पर आएं या ${STORE_CONFIG.phone} पर संपर्क करें।`,
      },
    ];
  }

  if (language === 'hinglish') {
    return [
      {
        q: 'Anil Ji Ka Gokul Ghee store kahan located hai?',
        a: `Hamara store Math Road, Near Hindu Society Mandir, Anand Bazar, Danapur Cantonment, Patna – 801503 par hai. Aap Contact page se live Google Maps directions khol sakte hain.`,
      },
      {
        q: 'Store khulne ki daily timing kya hai?',
        a: `Store roz subah 9:00 AM se raat 9:00 PM tak khula rehta hai. Kisi bhi festive order ya enquiry ke liye ${STORE_CONFIG.phone} par call karein.`,
      },
      {
        q: 'Kya doorstep delivery available hai?',
        a: 'Haan! Fresh mithai, samose aur Bilona Desi Ghee ki taazgi ke liye hum Danapur aur Patna ke verified pincodes par doorstep delivery karte hain. Product page par apna pincode enter karke eligibility check karein.',
      },
      {
        q: 'Kya Store Pickup ka option milega?',
        a: 'Haan bilkul! Anand Bazar, Danapur counter se 100% Free Store Pickup hamesha available hai.',
      },
      {
        q: 'Checkout par payment kaise kar sakte hain?',
        a: 'Cash on Delivery (COD / doorstep par cash ya UPI) aur Razorpay secure online payment (UPI, Cards, Net Banking) dono available hain.',
      },
      {
        q: 'Festivals aur bulk gifting ke liye order kaise karein?',
        a: `Diwali, Chhath aur family functions ke liye special mithai hampers aur custom ghee gift packs available hain. Bulk orders ke liye call karein: ${STORE_CONFIG.phone}.`,
      },
    ];
  }

  return [
    {
      q: 'Where is Anil Ji Ka Gokul Ghee located?',
      a: `Our physical store and kitchen are located at ${STORE_CONFIG.address.fullFormatted}. You can easily view live Google Maps directions directly from our Visit Store page.`,
    },
    {
      q: 'What are your store hours?',
      a: `We are open daily from ${STORE_CONFIG.hours}. For major festival inquiries or bulk pre-orders, feel free to call our Danapur counter at ${STORE_CONFIG.phone}.`,
    },
    {
      q: 'Do you provide local doorstep delivery?',
      a: 'Yes! To preserve the warm aroma and fresh texture of our Bilona Desi Ghee, traditional Khoya Mithai, and crisp snacks, express delivery is available across serviceable pincodes in Danapur Cantonment and Patna. You can test your 6-digit postal code on any product page.',
    },
    {
      q: 'Can I pick up my online order at the store?',
      a: 'Absolutely! Free Store Pickup is always available at our Anand Bazar counter with no minimum order value.',
    },
    {
      q: 'Which payment methods are accepted at checkout?',
      a: 'We accept Cash on Delivery (COD — cash or UPI upon arrival) as well as secure online payments via Razorpay (supporting UPI, Google Pay, PhonePe, Credit/Debit Cards, and Net Banking).',
    },
    {
      q: 'Can I order bulk gift hampers for weddings and festivals?',
      a: `Yes! We curate custom Desi Ghee jars and traditional Mithai gift hampers for Diwali, Chhath, weddings, and corporate gifting. Please reach out via our Contact page or call ${STORE_CONFIG.phone} to arrange tailored quantities.`,
    },
  ];
}

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState(0);
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const faqs = buildFaqs(language);

  return (
    <div className="bg-[#FBF7EE] py-8 sm:py-12 lg:py-16 space-y-10 sm:space-y-12">
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
            {isHi ? 'अक्सर पूछे जाने वाले सवाल' : isHinglish ? 'FAQs' : 'Frequently Asked Questions'}
          </span>
        </nav>

        {/* Page Header */}
        <div className="space-y-3 border-b border-[#E6DEC9] pb-6 sm:pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
            {isHi ? 'मदद व जानकारी' : 'Help & Information'}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F3D2E]">
            {t('pages.faq.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5A554C] max-w-2xl leading-relaxed">
            {isHi
              ? 'दानापुर स्टोर, ताज़ा डिलीवरी, बिलोना घी व भुगतान से संबंधित सामान्य प्रश्नों के उत्तर।'
              : 'Everything you need to know about our Danapur kitchen counter, local delivery, Bilona ghee, and ordering.'}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.q}
                className="rounded-[20px] border border-[#E6DEC9] bg-[#FFFDF8] overflow-hidden gg-shadow-xs transition-colors hover:border-[#C9A24B]/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-editorial text-lg sm:text-xl font-semibold text-[#0F3D2E] leading-snug">
                    {item.q}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full border border-[#E6DEC9] flex items-center justify-center shrink-0 text-[#9A7624] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-[#F3EAD7]' : 'bg-[#FBF7EE]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-[#5A554C] leading-relaxed border-t border-[#E6DEC9]/70 pt-3.5">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Banner */}
        <Card
          variant="sand"
          radius="xl"
          padding="lg"
          className="border-[#C9A24B]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h2 className="font-editorial text-xl font-semibold text-[#0F3D2E]">
              {isHi ? 'कोई अन्य प्रश्न है?' : 'Still have a question?'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5A554C]">
              {isHi
                ? 'हमारी आनंद बाजार दानापुर टीम आपकी सहायता के लिए सदैव उपलब्ध है।'
                : 'Our Anand Bazar team is happy to assist with any custom orders or queries.'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              as={Link}
              to="/contact"
              variant="forest"
              size="sm"
            >
              {isHi ? 'संपर्क करें' : 'Contact Us'}
            </Button>
            <Button
              href={STORE_CONFIG.phoneHref}
              variant="secondary"
              size="sm"
              leftIcon={<Phone className="w-3.5 h-3.5" />}
            >
              {isHi ? 'कॉल करें' : 'Call Counter'}
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
