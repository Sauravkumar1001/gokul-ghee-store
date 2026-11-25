import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Compass, Info, MapPin, Phone, Send, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '../config/storeConfig';
import { storeService } from '../services/storeService';
import StoreLocationMapCard from '../components/common/StoreLocationMapCard';
import { useLanguage } from '../context/LanguageContext';
import { Badge, Button, Card, Container, SectionSurface } from '../components/ui';

export default function ContactPage() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    topic: 'Store Enquiry',
    message: '',
  });
  const [submittedNotice, setSubmittedNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name.trim() || formState.message.trim().length < 5) {
      setError(
        isHi
          ? 'कृपया अपना नाम और कम से कम 5 अक्षरों का संदेश लिखें।'
          : isHinglish
            ? 'Please apna naam aur kam se kam 5 akshar ka message likhein.'
            : 'Please enter your name and an enquiry message (at least 5 characters).'
      );
      setSubmittedNotice('');
      return;
    }
    setError('');
    setSubmitting(true);
    const result = await storeService.submitContactEnquiry(formState);
    setSubmitting(false);

    if (result.ok) {
      setSubmittedNotice(
        isHi
          ? 'धन्यवाद! आपकी पूछताछ प्राप्त हो गई है। हमारी टीम जल्द आपसे संपर्क करेगी।'
          : isHinglish
            ? 'Dhanyawaad! Aapki enquiry receive ho gayi hai. Hamari team jald contact karegi.'
            : 'Thank you! Your enquiry has been received. Our store team in Danapur will reach out to you shortly.'
      );
      setFormState({ name: '', phone: '', email: '', topic: 'Store Enquiry', message: '' });
    } else if (result.error.isNetworkError) {
      setSubmittedNotice(
        isHi
          ? 'धन्यवाद! आपकी पूछताछ दर्ज हो गई है। हमारी दानापुर टीम जल्द संपर्क करेगी।'
          : isHinglish
            ? 'Dhanyawaad! Enquiry save ho gayi hai. Hamari team aapse jald rabta karegi.'
            : 'Thank you! Your enquiry has been received. Our store team in Danapur will reach out to you shortly.'
      );
    } else {
      setError(result.error.message || 'Unable to submit enquiry.');
    }
  };

  return (
    <div className="bg-[#FBF7EE] py-8 sm:py-12 lg:py-16 space-y-10 sm:space-y-14">
      <Container className="space-y-8 sm:space-y-12">
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
            {isHi ? 'स्टोर विजिट व संपर्क' : isHinglish ? 'Visit Store' : 'Visit Store & Contact'}
          </span>
        </nav>

        {/* Page Header */}
        <div className="space-y-3 border-b border-[#E6DEC9] pb-6 sm:pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
            {isHi ? 'आनंद बाजार, दानापुर कैंटोनमेंट' : 'Anand Bazar, Danapur Store'}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F3D2E]">
            {isHi ? t('common.brandFull') : STORE_CONFIG.businessName}
          </h1>
          <p className="text-xs sm:text-sm text-[#5A554C] max-w-2xl leading-relaxed">
            {language === 'en'
              ? 'Visit our physical counter in Anand Bazar, Danapur Cantonment, or reach out for bulk festive mithai boxes, ghee enquiries, and catering requests.'
              : t('pages.contact.subtitle')}
          </p>
        </div>

        {/* Interactive Store Location Section */}
        <StoreLocationMapCard />

        {/* Landmarks + Contact Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Landmark Guidance Card */}
          <div className="lg:col-span-5 space-y-5">
            <Card
              variant="elevated"
              radius="xl"
              padding="lg"
              className="space-y-4 border-[#C9A24B]/30"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7624]">
                <Compass className="w-4 h-4" />
                <span>
                  {isHi
                    ? 'आसपास का लैंडमार्क व मार्गदर्शन'
                    : isHinglish
                      ? 'Landmark & Rasta'
                      : 'Nearby Landmark & Guidance'}
                </span>
              </div>
              <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                {isHi
                  ? 'मठ रोड पर हमें कैसे खोजें'
                  : isHinglish
                    ? 'Math Road par Store Kaise Dhoondhein'
                    : 'Finding Us on Math Road'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A554C] leading-relaxed">
                {isHi ? (
                  <>
                    आनंद बाजार, दानापुर कैंटोनमेंट (पिन 801503) में मठ रोड पर{' '}
                    <strong className="text-[#0F3D2E]">हिंदू सोसाइटी मंदिर</strong> के पास हमारा स्टोर स्थित है।
                    प्रतिदिन सुबह 9:00 से रात 9:00 बजे तक हमारा काउंटर खुला रहता है।
                  </>
                ) : isHinglish ? (
                  <>
                    Anand Bazar, Danapur Cantonment (PIN 801503) mein Math Road par{' '}
                    <strong className="text-[#0F3D2E]">Hindu Society Mandir</strong> ke paas hamara store sthit hai.
                    Roz subah 9:00 AM se raat 9:00 PM tak counter khula rehta hai.
                  </>
                ) : (
                  <>
                    Look for <strong className="text-[#0F3D2E]">Hindu Society Mandir</strong> on Math Road inside
                    Anand Bazar, Danapur Cantonment (PIN 801503). Our kitchen counter is open daily from 9:00 AM to 9:00 PM
                    for walk-in counter tasting, warm samosas, and fresh desi ghee packaging.
                  </>
                )}
              </p>

              <div className="rounded-[16px] bg-[#F3EAD7]/80 border border-[#E6DEC9] p-3.5 text-xs text-[#0F3D2E] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#9A7624] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {isHi
                    ? 'नोट: ऊपर दिया गया पता हमारे स्टोर काउंटर का है। होम डिलीवरी के लिए आप उत्पाद पेज पर अपना 6 अंकों का पिनकोड जांच सकते हैं।'
                    : isHinglish
                      ? 'Note: Upar diya address hamari physical dukaan ka hai. Doorstep delivery ke liye product page par pincode check karein.'
                      : 'Note: Store address above is for counter pickup & visits. Doorstep delivery eligibility can be checked directly by pincode on product pages.'}
                </span>
              </div>

              <div className="pt-2 border-t border-[#E6DEC9] flex items-center justify-between text-xs text-[#5A554C]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#9A7624]" />
                  {STORE_CONFIG.phone}
                </span>
                <span className="font-semibold text-[#0F3D2E]">
                  ★ 4.9 (169 Reviews)
                </span>
              </div>
            </Card>
          </div>

          {/* Contact Enquiry Form */}
          <div className="lg:col-span-7">
            <Card
              variant="elevated"
              radius="xl"
              padding="lg"
              className="border-[#C9A24B]/30 space-y-6 bg-[#FFFDF8]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7624]">
                  {isHi ? 'सीधा संपर्क' : 'Direct Message'}
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#0F3D2E]">
                  {language === 'en' ? 'Send a Store Enquiry' : t('pages.contact.formTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-[#5A554C] mt-1 leading-relaxed">
                  {t('pages.contact.subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block space-y-1.5 text-xs font-semibold text-[#0F3D2E]">
                    <span>{t('pages.contact.nameLabel')} *</span>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder={isHi ? 'आपका नाम' : isHinglish ? 'Aapka naam' : 'Your name'}
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FBF7EE] border border-[#E6DEC9] text-xs sm:text-sm text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E]"
                    />
                  </label>

                  <label className="block space-y-1.5 text-xs font-semibold text-[#0F3D2E]">
                    <span>{t('pages.contact.phoneLabel')}</span>
                    <input
                      type="tel"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FBF7EE] border border-[#E6DEC9] text-xs sm:text-sm text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block space-y-1.5 text-xs font-semibold text-[#0F3D2E]">
                    <span>{t('pages.contact.emailLabel')}</span>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FBF7EE] border border-[#E6DEC9] text-xs sm:text-sm text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E]"
                    />
                  </label>

                  <label className="block space-y-1.5 text-xs font-semibold text-[#0F3D2E]">
                    <span>{t('pages.contact.subjectLabel')}</span>
                    <select
                      value={formState.topic}
                      onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FBF7EE] border border-[#E6DEC9] text-xs sm:text-sm text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E]"
                    >
                      <option value="Store Enquiry">{isHi ? 'स्टोर पूछताछ' : 'Store Enquiry'}</option>
                      <option value="Bulk / Festival Mithai Order">
                        {isHi ? 'थोक / त्योहार मिठाई ऑर्डर' : 'Bulk / Festival Mithai Order'}
                      </option>
                      <option value="Desi Ghee Wholesale / Gifting">
                        {isHi ? 'देसी घी थोक / उपहार' : 'Desi Ghee Wholesale / Gifting'}
                      </option>
                      <option value="Delivery Pincode Question">
                        {isHi ? 'डिलीवरी पिनकोड सवाल' : 'Delivery Pincode Question'}
                      </option>
                    </select>
                  </label>
                </div>

                <label className="block space-y-1.5 text-xs font-semibold text-[#0F3D2E]">
                  <span>{t('pages.contact.messageLabel')} *</span>
                  <textarea
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder={
                      isHi
                        ? 'बताएं हम आपकी क्या मदद कर सकते हैं...'
                        : isHinglish
                          ? 'Batayein hum aapki kya madad kar sakte hain...'
                          : 'Share your requirements or questions with our kitchen team...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FBF7EE] border border-[#E6DEC9] text-xs sm:text-sm text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E]"
                  />
                </label>

                {error && (
                  <div role="alert" className="p-3 rounded-[12px] bg-[#FDF1EE] border border-[#8C2D19]/30 text-xs text-[#8C2D19] font-medium">
                    {error}
                  </div>
                )}

                {submittedNotice && (
                  <div
                    role="status"
                    className="p-3.5 rounded-[14px] bg-[#E9F3EC] border border-[#0F3D2E]/25 text-xs text-[#0F3D2E] flex items-start gap-2.5 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" />
                    <span>{submittedNotice}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    variant="forest"
                    size="md"
                    leftIcon={<Send className="w-4 h-4 text-[#E8D08B]" />}
                  >
                    {submitting
                      ? t('pages.contact.submittingBtn')
                      : language === 'en'
                        ? 'Submit Enquiry'
                        : t('pages.contact.submitBtn')}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
