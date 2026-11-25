import { SAMPLE_PRODUCTS } from '../data/sampleCatalog';
import { STORE_CONFIG } from '../config/storeConfig';
import { formatINR } from '../utils/formatters';
import apiClient, { normalizeApiError } from './apiClient';

const AI_SESSION_KEY = 'gokul_ai_session_id_v1';

/**
 * GOKUL AI — Catalog-Grounded Assistant Engine (Phase 2 Client Guide).
 * In Phase 6, this routes to `POST /api/v1/ai/chat` backed by Google Gemini
 * and live MongoDB queries.
 *
 * STRICT GUARDRAILS:
 * - Never fabricates products, prices, or stock availability.
 * - Never promises delivery without backend pincode validation.
 * - Flags all Phase 1/2 catalog figures clearly as Sample Seed Data.
 */
function normalizeAiLanguage(language) {
  if (language === 'hi' || language === 'hinglish') return language;
  return 'en';
}

function hasAnyTerm(text, terms) {
  return terms.some((term) => text.includes(term));
}

export function askGokulAi(rawInput, language = 'en') {
  const query = (rawInput || '').trim();
  const lower = query.toLowerCase();
  const lang = normalizeAiLanguage(language);

  if (!query) {
    return {
      text:
        lang === 'hi'
          ? 'नमस्ते! मुझसे देसी घी के पैक, बजट में मिठाई (जैसे "₹500 के अंदर मिठाई"), फेस्टिव गिफ्ट बॉक्स, दुकान का समय या ऑर्डर की जानकारी पूछें।'
          : lang === 'hinglish'
          ? 'Namaste! Mujhse Desi Ghee packs, budget mein Mithai (jaise "₹500 ke andar mithai"), festive gift boxes, store timing ya order karne ka tarika poochein.'
          : 'Namaste! Ask me for Desi Ghee packs, Mithai under a budget (e.g., "₹500 ke andar mithai"), festive gift boxes, store timings, or how to place an order.',
      recommendations: [],
    };
  }

  // 1. Delivery / Pincode Check Guardrail
  if (
    /\b(pincode|pin code|deliver|delivery|shipping|bhej|area|801503)\b/.test(lower) ||
    hasAnyTerm(lower, ['पिनकोड', 'पिन कोड', 'डिलीवरी', 'भेज', 'एरिया'])
  ) {
    const text =
      lang === 'hi'
        ? `हम पूरे देश में या बिना जाँचे डिलीवरी का वादा नहीं करते। डिलीवरी उपलब्धता, शुल्क और अनुमानित समय केवल निर्धारित स्थानीय पिनकोड के आधार पर तय होते हैं। आप ${STORE_CONFIG.businessName}, ${STORE_CONFIG.address.fullFormatted} से सीधे स्टोर पिकअप भी ले सकते हैं।`
        : lang === 'hinglish'
        ? `Hum nationwide ya unverified delivery ka wada nahi karte. Delivery availability, fees aur ETA Admin-configured serviceable pincodes ke basis par verify hoti hai. Tab tak aap ${STORE_CONFIG.businessName} (${STORE_CONFIG.address.fullFormatted}) par direct store pickup bhi kar sakte hain.`
        : `We do not promise nationwide or unverified delivery. Delivery availability, fees, and estimated arrival times are strictly validated against Admin-configured serviceable pincodes in the backend (activating in Phases 3 & 6). Meanwhile, you can pick up directly from ${STORE_CONFIG.businessName} at ${STORE_CONFIG.address.fullFormatted}.`;
    return {
      text,
      recommendations: [],
      actionLink: {
        label:
          lang === 'hi'
            ? 'दुकान पता व दिशा देखें'
            : lang === 'hinglish'
            ? 'Store & Directions Dekhein'
            : 'View Store & Directions',
        to: '/contact',
      },
    };
  }

  // 2. Order Status Guardrail
  if (
    /\b(order status|track order|mera order|where is my order|my order)\b/.test(lower) ||
    hasAnyTerm(lower, ['ऑर्डर', 'ट्रैक', 'स्टेटस'])
  ) {
    const text =
      lang === 'hi'
        ? 'अपना वास्तविक ऑर्डर स्टेटस देखने के लिए कृपया अपने ग्राहक खाते में लॉगिन करें। लॉगिन के बाद आप Account → Orders में जाकर हर चरण (PLACED से DELIVERED तक) ट्रैक कर सकते हैं।'
        : lang === 'hinglish'
        ? 'Apna real order status dekhne ke liye please Sign In karein. Login karne ke baad aap Account → Orders mein jaakar PLACED se DELIVERED tak saare stages live track kar sakte hain.'
        : 'Checking a real order status requires signing in and querying your verified MongoDB orders (activating with backend APIs in Phases 3–4). Once signed in, you can track all stages from PLACED to DELIVERED under Account → Orders.';
    return {
      text,
      recommendations: [],
      actionLink: {
        label:
          lang === 'hi'
            ? 'ऑर्डर इतिहास देखें'
            : lang === 'hinglish'
            ? 'Order History Dekhein'
            : 'Go to Order History',
        to: '/account/orders',
      },
    };
  }

  // 3. Store Location / Hours / Contact
  if (
    /\b(address|location|kahan|where|time|timing|hours|phone|call|contact|mandir|danapur)\b/.test(
      lower
    ) ||
    hasAnyTerm(lower, ['पता', 'कहाँ', 'कहां', 'समय', 'टाइम', 'फ़ोन', 'फोन', 'संपर्क', 'दानापुर'])
  ) {
    const text =
      lang === 'hi'
        ? `${STORE_CONFIG.businessName} का पता: ${STORE_CONFIG.address.fullFormatted}। समय: ${STORE_CONFIG.hours}। फ़ोन: ${STORE_CONFIG.phone}।`
        : lang === 'hinglish'
        ? `${STORE_CONFIG.businessName} ka address hai: ${STORE_CONFIG.address.fullFormatted}. Store timing: ${STORE_CONFIG.hours}. Phone: ${STORE_CONFIG.phone}.`
        : `${STORE_CONFIG.businessName} is located at ${STORE_CONFIG.address.fullFormatted}. Store hours: ${STORE_CONFIG.hours}. Phone: ${STORE_CONFIG.phone}.`;
    return {
      text,
      recommendations: [],
      actionLink: {
        label:
          lang === 'hi'
            ? 'दुकान मैप और संपर्क खोलें'
            : lang === 'hinglish'
            ? 'Store Map & Contact Kholein'
            : 'Open Store Map & Contact',
        to: '/contact',
      },
    };
  }

  // 4. How to order
  if (
    /\b(how to order|kaise order|order kaise|payment|cod|razorpay)\b/.test(lower) ||
    hasAnyTerm(lower, ['ऑर्डर कैसे', 'कैसे मंगा', 'पेमेंट', 'कैश ऑन डिलीवरी'])
  ) {
    const text =
      lang === 'hi'
        ? 'ऑर्डर करने का तरीका: 1) कलेक्शन देखें और पैक/वज़न चुनें, 2) कार्ट में आइटम जोड़ें, 3) लॉगिन करके चेकआउट पर पिनकोड जाँचें और पता चुनें, 4) Razorpay या कैश ऑन डिलीवरी चुनें। तुरंत ऑर्डर के लिए आप दुकान पर कॉल भी कर सकते हैं।'
        : lang === 'hinglish'
        ? 'Order karne ke steps: 1) Collections dekhein aur apna pack/weight select karein, 2) Cart mein add karein, 3) Sign In karke Checkout par delivery pincode verify karein, 4) Razorpay ya COD se pay karein. Turant order ke liye store par seedha call bhi kar sakte hain.'
        : 'To order: 1) Browse our collections and choose your pack/weight variant, 2) Add items to your Cart, 3) Sign in and verify your delivery pincode at Checkout (live server validation, COD & Razorpay launch in Phases 3–4). For immediate orders right now, call the store directly.';
    return {
      text,
      recommendations: [],
      actionLink: {
        label:
          lang === 'hi'
            ? 'सभी उत्पाद देखें'
            : lang === 'hinglish'
            ? 'Sabhi Products Dekhein'
            : 'Browse All Products',
        to: '/shop',
      },
    };
  }

  // 5. Budget extraction (e.g., "500 rupaye ke andar", "under 600", "within 400")
  const budgetMatch = lower.match(/(?:under|below|andar|within|upto|up to|rs\.?|₹|budget)?\s*(\d{2,5})\s*(?:rupaye|rupees|rs|inr|ke andar)?/);
  const hasBudgetCue =
    /\b(under|below|andar|within|upto|budget|rupaye|rupees|rs)\b/.test(lower) ||
    lower.includes('₹') ||
    hasAnyTerm(lower, ['रुपये', 'अंदर', 'कम', 'बजट']);
  const maxBudget = budgetMatch && hasBudgetCue ? Number(budgetMatch[1]) : null;

  // 6. Category keyword matching strictly against SAMPLE_PRODUCTS
  const categoryMatches = [];
  if (/\b(ghee|cow|buffalo|danedar)\b/.test(lower) || hasAnyTerm(lower, ['घी', 'गाय', 'भैंस']))
    categoryMatches.push('desi-ghee');
  if (
    /\b(mithai|sweet|sweets|laddoo|laddu|katli|barfi|kaju)\b/.test(lower) ||
    hasAnyTerm(lower, ['मिठाई', 'लड्डू', 'कतली', 'बर्फी', 'काजू'])
  )
    categoryMatches.push('mithai');
  if (/\b(samosa|samosas)\b/.test(lower) || hasAnyTerm(lower, ['समोसा', 'समोसे']))
    categoryMatches.push('samosa');
  if (/\b(namkeen|sev|mixture|chivda)\b/.test(lower) || hasAnyTerm(lower, ['नमकीन', 'सेव', 'चिवड़ा']))
    categoryMatches.push('namkeen');
  if (
    /\b(snack|snacks|mathri|kachori)\b/.test(lower) ||
    hasAnyTerm(lower, ['स्नैक्स', 'मठरी', 'कचौरी'])
  )
    categoryMatches.push('traditional-snacks');
  if (
    /\b(gift|box|boxes|combo|combos|hamper|hampers)\b/.test(lower) ||
    hasAnyTerm(lower, ['गिफ्ट', 'हैंपर', 'कॉम्बो', 'बॉक्स'])
  )
    categoryMatches.push('special-combos');
  if (
    /\b(festival|festive|diwali|holi|chhath|gujiya|puja)\b/.test(lower) ||
    hasAnyTerm(lower, ['त्योहार', 'दीवाली', 'होली', 'छठ', 'गुजिया', 'पूजा'])
  )
    categoryMatches.push('festival-specials');

  const candidateProducts =
    categoryMatches.length > 0
      ? SAMPLE_PRODUCTS.filter((p) => categoryMatches.includes(p.categorySlug))
      : SAMPLE_PRODUCTS;

  const matchedRecommendations = [];
  for (const product of candidateProducts) {
    const validVariants = maxBudget
      ? product.variants.filter((v) => v.price <= maxBudget && v.stock > 0)
      : product.variants.filter((v) => v.stock > 0);

    if (validVariants.length > 0) {
      // Pick the best value variant within budget (highest price under budget if budget specified, otherwise first variant)
      const chosenVariant = maxBudget
        ? [...validVariants].sort((a, b) => b.price - a.price)[0]
        : validVariants[0];

      matchedRecommendations.push({
        product,
        variant: chosenVariant,
      });
    }
  }

  if (matchedRecommendations.length > 0) {
    const topMatches = matchedRecommendations.slice(0, 3);
    const budgetText = maxBudget
      ? lang === 'hi'
        ? ` (${formatINR(maxBudget)} के अंदर)`
        : lang === 'hinglish'
        ? ` (${formatINR(maxBudget)} ke andar)`
        : ` under ${formatINR(maxBudget)}`
      : '';
    const summaryLines = topMatches
      .map(
        ({ product, variant }) =>
          `• ${product.name} (${variant.label}) — ${formatINR(variant.price)}`
      )
      .join('\n');

    const intro =
      lang === 'hi'
        ? `सैंपल कैटलॉग से आपके लिए उपलब्ध विकल्प${budgetText}:`
        : lang === 'hinglish'
        ? `Sample catalog se aapke liye best options${budgetText} yeh rahe:`
        : `Here are genuine sample catalog options${budgetText} (prices & stock are sample entries until owner setup in Phase 3):`;

    return {
      text: `${intro}\n${summaryLines}`,
      recommendations: topMatches,
    };
  }

  if (maxBudget) {
    const text =
      lang === 'hi'
        ? `इस श्रेणी में ${formatINR(
            maxBudget
          )} के अंदर कोई सैंपल पैक नहीं मिला। कृपया पूरा कैटलॉग देखें या अपना बजट थोड़ा बढ़ाकर पूछें।`
        : lang === 'hinglish'
        ? `Is category mein ${formatINR(
            maxBudget
          )} ke andar koi matching sample pack nahi mila. Aap poora catalog dekh sakte hain ya thoda alag budget pooch sakte hain.`
        : `I did not find any matching sample catalog pack under ${formatINR(
            maxBudget
          )} in that category. Try exploring our full catalog or adjusting your budget.`;
    return {
      text,
      recommendations: [],
      actionLink: {
        label:
          lang === 'hi'
            ? 'पूरी दुकान देखें'
            : lang === 'hinglish'
            ? 'Poora Shop Dekhein'
            : 'Explore Full Shop',
        to: '/shop',
      },
    };
  }

  // Fallback grounded guidance
  const fallbackText =
    lang === 'hi'
      ? 'मैं आपको देसी घी, मिठाई, समोसा, नमकीन, पारंपरिक स्नैक्स, स्पेशल कॉम्बो और फेस्टिवल स्पेशल उत्पाद दिखाने या अनिल जी का गोकुल घी (आनंद बाजार, दानापुर) का पता व समय बताने में मदद कर सकता हूँ।'
      : lang === 'hinglish'
      ? 'Main aapko Desi Ghee, Mithai, Samosa, Namkeen, Traditional Snacks, Special Combos aur Festival Specials dikhane ya Anil Ji Ka Gokul Ghee (Anand Bazar, Danapur) ka address aur timing batane mein madad kar sakta hoon.'
      : 'I can help you explore sample products in Desi Ghee, Mithai, Samosa, Namkeen, Traditional Snacks, Special Combos, or Festival Specials — or share store timings and directions for Anil Ji Ka Gokul Ghee (Anand Bazar, Danapur).';

  return {
    text: fallbackText,
    recommendations: SAMPLE_PRODUCTS.slice(0, 2).map((product) => ({
      product,
      variant: product.variants[0],
    })),
  };
}

export const gokulAiClient = {
  getOrCreateSessionId() {
    try {
      const existing = window.localStorage.getItem(AI_SESSION_KEY);
      if (existing && existing.length >= 4) return existing;
      const created = `gg-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      window.localStorage.setItem(AI_SESSION_KEY, created);
      return created;
    } catch {
      return `gg-ai-${Date.now()}`;
    }
  },

  async fetchHistory(sessionId) {
    try {
      const res = await apiClient.get(`/ai/history/${encodeURIComponent(sessionId)}`);
      return { ok: true, messages: res.data?.messages || [] };
    } catch (error) {
      return { ok: false, error: normalizeApiError(error), messages: [] };
    }
  },

  async sendMessage({ sessionId, message, language = 'en' }) {
    const lang = normalizeAiLanguage(language);
    try {
      const res = await apiClient.post('/ai/chat', { sessionId, message, language: lang });
      return {
        ok: true,
        sessionId: res.data?.sessionId || sessionId,
        reply: res.data?.reply,
      };
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.isNetworkError) {
        return {
          ok: true,
          sessionId,
          reply: {
            ...askGokulAi(message, lang),
            source: 'offline_fallback',
          },
        };
      }
      return {
        ok: false,
        error: normalized,
      };
    }
  },
};
