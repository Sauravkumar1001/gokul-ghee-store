import { useEffect, useState } from 'react';
import { CheckCircle2, MapPin, Truck, XCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatINR } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

const LOCAL_PATNA_PREFIXES = ['800', '801'];

function evaluateLocalPincodeFallback(pin, subtotal, language) {
  const isPatnaZone = LOCAL_PATNA_PREFIXES.some((prefix) => pin.startsWith(prefix));
  const isCoreDanapur = pin === '801503' || pin === '801105' || pin === '801505';
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  if (isPatnaZone) {
    const charge = isCoreDanapur && subtotal >= 499 ? 0 : isCoreDanapur ? 30 : 49;
    return {
      serviceable: true,
      pincode: pin,
      deliveryCharge: charge,
      minimumOrderValue: isCoreDanapur ? 199 : 299,
      estimatedDeliveryTime: isCoreDanapur
        ? isHi
          ? 'उसी दिन या अगले दिन डिलीवरी'
          : 'Same-day / Next-day'
        : isHi
          ? '1–2 कार्यदिवस'
          : '1–2 days',
      message: isCoreDanapur
        ? isHi
          ? `पिनकोड ${pin} (दानापुर कैंट / आनंद बाजार) में होम डिलीवरी उपलब्ध है।`
          : isHinglish
            ? `Pincode ${pin} (Danapur / Anand Bazar) par home delivery available hai.`
            : `Local doorstep delivery is available for ${pin} (Danapur & Anand Bazar zone).`
        : isHi
          ? `पिनकोड ${pin} (पटना क्षेत्र) में डिलीवरी उपलब्ध है।`
          : isHinglish
            ? `Pincode ${pin} (Patna zone) par delivery available hai.`
            : `Doorstep delivery is available across Patna zone for ${pin}.`,
    };
  }

  return {
    serviceable: false,
    pincode: pin,
    deliveryCharge: 0,
    minimumOrderValue: 0,
    estimatedDeliveryTime: '',
    message: isHi
      ? `पिनकोड ${pin} के लिए ताज़ा उत्पाद डिलीवरी अभी सीमित है। घी/मिठाई शिपमेंट हेतु +91 89863 65592 पर संपर्क करें।`
      : isHinglish
        ? `Pincode ${pin} abhi local delivery zone se bahar hai. Dispatch enquiry ke liye +91 89863 65592 par call karein.`
        : `Pincode ${pin} is currently outside our local Patna/Danapur fresh-delivery route. Call +91 89863 65592 for packaged ghee dispatch.`,
  };
}

export default function PincodeCheckerCard({
  pincode,
  subtotal = 0,
  onPincodeResolved,
  compact = false,
}) {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';
  const [inputPin, setInputPin] = useState(pincode || '801503');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (pincode) {
      setInputPin(pincode);
    }
  }, [pincode]);

  const handleCheck = async (e) => {
    if (e) e.preventDefault();
    const cleanPin = inputPin.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setErrorMsg(
        language === 'en'
          ? 'Please enter a valid 6-digit Indian pincode (e.g. 801503).'
          : t('pages.pincode.validError')
      );
      setResult(null);
      return;
    }

    setErrorMsg('');
    setChecking(true);
    const res = await orderService.checkPincode({ pincode: cleanPin, subtotal });
    setChecking(false);

    if (res.ok && res.data) {
      setResult(res.data);
      if (onPincodeResolved) {
        onPincodeResolved(cleanPin, res.data);
      }
    } else if (res.error?.isNetworkError) {
      const localResult = evaluateLocalPincodeFallback(cleanPin, subtotal, language);
      setResult(localResult);
      if (onPincodeResolved) {
        onPincodeResolved(cleanPin, localResult);
      }
    } else {
      setResult(null);
      setErrorMsg(res.error?.message || 'Unable to verify delivery availability.');
    }
  };

  return (
    <div
      className={`rounded-[18px] border border-[#C9A24B]/35 bg-[#FBF7EE] ${
        compact ? 'p-4 space-y-3' : 'p-5 space-y-3.5'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0F3D2E]">
          <Truck className="w-4 h-4 text-[#9C7725]" aria-hidden="true" />
          <span>{t('pages.pincode.title')}</span>
        </div>
        <span className="text-[11px] font-medium text-[#5A554C]">
          {isHi ? 'आनंद बाजार • पटना क्षेत्र' : 'Anand Bazar • Patna Zones'}
        </span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin
            className="w-3.5 h-3.5 text-[#7A7468] absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder={
              language === 'en' ? '6-digit pincode (e.g. 801503)' : t('pages.pincode.placeholder')
            }
            aria-label="Delivery pincode"
            className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#FFFDF8] border border-[#0F3D2E]/18 text-sm text-[#1B1B1B] tabular-nums focus:outline-none focus:border-[#0F3D2E] focus:ring-2 focus:ring-[#C9A24B]/30"
          />
        </div>
        <button
          type="submit"
          disabled={checking}
          className="px-5 py-2.5 rounded-full bg-[#0F3D2E] text-[#FBF7EE] text-xs font-semibold uppercase tracking-[0.12em] hover:bg-[#155742] disabled:opacity-60 transition-colors cursor-pointer shrink-0"
        >
          {checking ? t('pages.pincode.checking') : t('pages.pincode.button')}
        </button>
      </form>

      {errorMsg && (
        <p role="alert" className="text-xs text-[#B84A24] font-medium leading-relaxed">
          {errorMsg}
        </p>
      )}

      {result && (
        <div
          role="status"
          className={`rounded-[14px] p-3.5 text-xs space-y-2 border ${
            result.serviceable
              ? 'bg-[#E9F3EC] border-[#0F3D2E]/20 text-[#0F3D2E]'
              : 'bg-[#FDF1EC] border-[#B84A24]/30 text-[#9B3B1A]'
          }`}
        >
          <div className="flex items-start gap-2 font-semibold leading-snug">
            {result.serviceable ? (
              <CheckCircle2 className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-[#B84A24] shrink-0 mt-0.5" />
            )}
            <span>{result.message}</span>
          </div>

          {result.serviceable && (
            <div className="pl-6 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] text-[#35322C] tabular-nums">
              <span>
                {isHi ? 'डिलीवरी शुल्क: ' : isHinglish ? 'Delivery Fee: ' : 'Delivery Fee: '}
                <strong className="text-[#0F3D2E]">
                  {result.deliveryCharge === 0
                    ? isHi
                      ? 'मुफ़्त'
                      : 'FREE'
                    : formatINR(result.deliveryCharge)}
                </strong>
              </span>
              <span>
                {isHi ? 'न्यूनतम ऑर्डर: ' : 'Min. Order: '}
                <strong className="text-[#0F3D2E]">
                  {formatINR(result.minimumOrderValue)}
                </strong>
              </span>
              <span>
                ETA: <strong className="text-[#0F3D2E]">{result.estimatedDeliveryTime}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
