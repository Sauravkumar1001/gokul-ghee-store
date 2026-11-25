import { env } from '../config/env.js';
import { DEFAULT_STORE_SETTINGS } from '../controllers/storeController.js';
import { AIUsage } from '../models/AIUsage.js';
import { Category } from '../models/Category.js';
import { Conversation } from '../models/Conversation.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { StoreSettings } from '../models/StoreSettings.js';

// Estimated reference rates for gemini-2.5-flash ($0.15 / 1M input tokens, $0.60 / 1M output tokens)
const INPUT_COST_PER_TOKEN = 0.15 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 0.60 / 1_000_000;

const ACTION_LINK_MAP = {
  NONE: null,
  SHOP: { label: 'Explore Store Catalog', to: '/shop' },
  CONTACT: { label: 'Open Store Map & Contact', to: '/contact' },
  ORDERS: { label: 'View Order History', to: '/account/orders' },
  CART: { label: 'Review Cart & Check Pincode', to: '/cart' },
  LOGIN: { label: 'Sign In to Check Orders', to: '/login?next=/account/orders' },
};

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

function estimateBudgetFromQuery(lower) {
  const budgetCue =
    /\b(under|below|andar|within|upto|up to|budget|rupaye|rupees|rs|inr)\b/.test(lower) ||
    lower.includes('₹') ||
    lower.includes('रुपये') ||
    lower.includes('अंदर') ||
    lower.includes('कम');
  if (!budgetCue) return null;
  const match = lower.match(/(?:under|below|andar|within|upto|up to|rs\.?|₹|budget)?\s*(\d{2,5})\b/);
  return match ? Number(match[1]) : null;
}

function hasAnyTerm(text, terms) {
  return terms.some((term) => text.includes(term));
}

function normalizeAiLanguage(language) {
  if (language === 'hi' || language === 'hinglish') return language;
  return 'en';
}

function localizeActionLink(actionLink, language) {
  if (!actionLink) return null;
  const lang = normalizeAiLanguage(language);
  if (lang === 'en') return actionLink;

  if (actionLink.to && actionLink.to.startsWith('/login')) {
    return {
      ...actionLink,
      label: lang === 'hi' ? 'ऑर्डर देखने के लिए लॉगिन करें' : 'Orders dekhne ke liye Login karein',
    };
  }
  if (actionLink.to === '/shop') {
    return {
      ...actionLink,
      label: lang === 'hi' ? 'सभी उत्पाद देखें' : 'Sabhi Products Dekhein',
    };
  }
  if (actionLink.to === '/cart') {
    return {
      ...actionLink,
      label: lang === 'hi' ? 'कार्ट और पिनकोड जाँचें' : 'Cart & Pincode Check Karein',
    };
  }
  if (actionLink.to === '/contact') {
    return {
      ...actionLink,
      label: lang === 'hi' ? 'दुकान पता व समय देखें' : 'Store Details & Directions Dekhein',
    };
  }
  if (actionLink.to && actionLink.to.startsWith('/account/orders/')) {
    const orderNum = String(actionLink.label || '').replace(/^Track\s+/i, '');
    return {
      ...actionLink,
      label: lang === 'hi' ? `ऑर्डर ${orderNum} ट्रैक करें` : `Order ${orderNum} Track Karein`,
    };
  }
  return actionLink;
}

function inferCategorySlugsFromQuery(lower) {
  const slugs = [];
  if (/\b(ghee|cow|buffalo|danedar|bilona)\b/.test(lower) || hasAnyTerm(lower, ['घी', 'गाय', 'भैंस', 'दानेदार']))
    slugs.push('desi-ghee');
  if (
    /\b(mithai|sweet|sweets|laddoo|laddu|katli|barfi|kaju|peda|besan)\b/.test(lower) ||
    hasAnyTerm(lower, ['मिठाई', 'लड्डू', 'कतली', 'बर्फी', 'काजू', 'पेड़ा', 'बेसन'])
  )
    slugs.push('mithai');
  if (/\b(samosa|samosas)\b/.test(lower) || hasAnyTerm(lower, ['समोसा', 'समोसे']))
    slugs.push('samosa');
  if (/\b(namkeen|sev|mixture|chivda)\b/.test(lower) || hasAnyTerm(lower, ['नमकीन', 'सेव', 'चिवड़ा', 'मिक्सचर']))
    slugs.push('namkeen');
  if (
    /\b(snack|snacks|mathri|kachori|thekua|nimki)\b/.test(lower) ||
    hasAnyTerm(lower, ['स्नैक्स', 'मठरी', 'कचौरी', 'ठेकुआ', 'निमकी'])
  )
    slugs.push('traditional-snacks');
  if (
    /\b(gift|box|boxes|combo|combos|hamper|hampers|corporate)\b/.test(lower) ||
    hasAnyTerm(lower, ['गिफ्ट', 'हैंपर', 'कॉम्बो', 'बॉक्स'])
  )
    slugs.push('special-combos');
  if (
    /\b(festival|festive|diwali|holi|chhath|gujiya|puja)\b/.test(lower) ||
    hasAnyTerm(lower, ['त्योहार', 'दीवाली', 'होली', 'छठ', 'गुजिया', 'पूजा'])
  )
    slugs.push('festival-specials');
  return slugs;
}

async function loadGroundedStoreContext({ user }) {
  const [settingsDoc, categories, productDocs, deliveryZones, customerOrders] = await Promise.all([
    StoreSettings.findOne({ singletonKey: 'PRIMARY_STORE' }).lean(),
    Category.find({ isActive: true }).sort({ displayOrder: 1 }).select('name slug').lean(),
    Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ isBestseller: -1, isFeatured: -1, createdAt: 1 })
      .lean(),
    DeliveryZone.find({ isActive: true })
      .select(
        'pincode areaName city state deliveryCharge freeDeliveryAbove minimumOrderValue estimatedDeliveryTime'
      )
      .sort({ pincode: 1 })
      .lean(),
    user?._id
      ? Order.find({ user: user._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .select(
            'orderNumber status paymentMethod paymentStatus pricing.totalAmount deliveryAddress.pincode items.name items.quantity createdAt'
          )
          .lean()
      : Promise.resolve([]),
  ]);

  const storeSettings = settingsDoc || DEFAULT_STORE_SETTINGS;

  const products = productDocs
    .map((p) => {
      const activeVariants = (p.variants || [])
        .filter((v) => v.isActive !== false)
        .map((v) => ({
          id: String(v._id),
          _id: String(v._id),
          sku: v.sku || '',
          label: v.label,
          weightGrams: v.weightGrams,
          price: v.price,
          mrp: v.mrp || v.price,
          stock: Number(v.stock || 0),
        }));
      return {
        id: String(p._id),
        _id: String(p._id),
        slug: p.slug,
        name: p.name,
        categorySlug: p.category?.slug || p.categorySlug || '',
        categoryName: p.category?.name || '',
        shortDescription: p.shortDescription || '',
        badge: p.badge || '',
        isSampleData: Boolean(p.isSampleData),
        images: p.images && p.images.length > 0 ? p.images : ['/images/gokul_desi_ghee_jar.jpg'],
        variants: activeVariants,
      };
    })
    .filter((p) => p.variants.length > 0);

  return {
    storeSettings,
    categories,
    products,
    deliveryZones,
    customerOrders,
    isAuthenticated: Boolean(user?._id),
  };
}

function hydrateVerifiedRecommendations({ slugs = [], products = [], maxBudget = null }) {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const cards = [];

  for (const rawSlug of slugs) {
    const product = bySlug.get(String(rawSlug).trim());
    if (!product) continue;

    const inStockVariants = product.variants.filter((v) => v.stock > 0);
    if (inStockVariants.length === 0) continue;

    let selectedVariant = inStockVariants[0];
    if (maxBudget) {
      const underBudget = inStockVariants.filter((v) => v.price <= maxBudget);
      if (underBudget.length === 0) continue;
      selectedVariant = [...underBudget].sort((a, b) => b.price - a.price)[0];
    }

    cards.push({ product, variant: selectedVariant });
    if (cards.length >= 4) break;
  }

  return cards;
}

function buildDeterministicCatalogReply({ message, context, language = 'en' }) {
  const lower = message.toLowerCase();
  const lang = normalizeAiLanguage(language);
  const { storeSettings, products, deliveryZones, customerOrders, isAuthenticated } = context;

  // 1. Authenticated Customer Order Status Check
  if (
    /\b(order status|track order|mera order|my order|where is my order|orders)\b/.test(lower) ||
    hasAnyTerm(lower, ['ऑर्डर', 'ट्रैक', 'स्टेटस'])
  ) {
    if (!isAuthenticated) {
      const text =
        lang === 'hi'
          ? 'अपना वास्तविक ऑर्डर स्टेटस देखने के लिए कृपया अपने ग्राहक खाते में लॉगिन करें। गोपनीयता और सुरक्षा के लिए, मैं केवल आपके लॉगिन प्रोफ़ाइल से जुड़े सत्यापित MongoDB ऑर्डर ही देखता हूँ।'
          : lang === 'hinglish'
          ? 'Apna real order status check karne ke liye please apne customer account mein Login karein. Privacy aur security ke liye main sirf aapke authenticated profile se jude verified orders hi check karta hoon.'
          : 'To check your real order status, please sign in to your customer account. For privacy and security, I only inspect verified MongoDB orders linked to your authenticated profile.';
      return {
        text,
        recommendations: [],
        actionLink: localizeActionLink(ACTION_LINK_MAP.LOGIN, lang),
      };
    }
    if (customerOrders.length === 0) {
      const text =
        lang === 'hi'
          ? 'मैंने आपके खाते की जाँच की और अभी तक कोई ऑर्डर दर्ज नहीं है। ऑर्डर करने के लिए हमारे ताज़ा देसी घी, मिठाई और फेस्टिव गिफ्ट बॉक्स देखें!'
          : lang === 'hinglish'
          ? 'Maine aapka account check kiya aur abhi tak koi order recorded nahi hai. Order karne ke liye humare fresh Desi Ghee, Mithai aur Festive Gift Boxes explore karein!'
          : 'I checked your account and there are no orders recorded yet. Explore our fresh Desi Ghee, Mithai, and Festive Gift Boxes whenever you are ready to order!';
      return {
        text,
        recommendations: [],
        actionLink: localizeActionLink(ACTION_LINK_MAP.SHOP, lang),
      };
    }

    const latest = customerOrders[0];
    const summaryLines = customerOrders
      .slice(0, 3)
      .map((o) =>
        lang === 'hi'
          ? `• #${o.orderNumber} — ${o.status} (${o.paymentMethod} • भुगतान: ${o.paymentStatus}) • ${formatINR(
              o.pricing?.totalAmount
            )}`
          : `• #${o.orderNumber} — ${o.status} (${o.paymentMethod} • Payment: ${o.paymentStatus}) • ${formatINR(
              o.pricing?.totalAmount
            )}`
      )
      .join('\n');

    const heading =
      lang === 'hi'
        ? 'यहाँ आपका नवीनतम सत्यापित ऑर्डर स्टेटस है:'
        : lang === 'hinglish'
        ? 'Yeh raha aapka latest verified order status:'
        : 'Here is your latest verified order status:';

    return {
      text: `${heading}\n${summaryLines}`,
      recommendations: [],
      actionLink: localizeActionLink(
        { label: `Track #${latest.orderNumber}`, to: `/account/orders/${latest._id}` },
        lang
      ),
    };
  }

  // 2. Delivery Availability / Pincode Verification
  const pinMatch = lower.match(/\b([1-9][0-9]{5})\b/);
  if (
    pinMatch ||
    /\b(pincode|pin code|deliver|delivery|shipping|bhej|area|serviceable)\b/.test(lower) ||
    hasAnyTerm(lower, ['पिनकोड', 'पिन कोड', 'डिलीवरी', 'भेज', 'एरिया'])
  ) {
    if (pinMatch) {
      const pin = pinMatch[1];
      const matchedZone = deliveryZones.find((z) => z.pincode === pin);
      if (matchedZone) {
        const freeNote = matchedZone.freeDeliveryAbove
          ? lang === 'hi'
            ? ` ${formatINR(matchedZone.freeDeliveryAbove)} से ऊपर मुफ्त डिलीवरी।`
            : lang === 'hinglish'
            ? ` ${formatINR(matchedZone.freeDeliveryAbove)} ke upar Free delivery.`
            : ` Free delivery above ${formatINR(matchedZone.freeDeliveryAbove)}.`
          : '';
        const text =
          lang === 'hi'
            ? `जी हाँ! ${pin} (${matchedZone.areaName}, ${matchedZone.city}) में डिलीवरी उपलब्ध है। डिलीवरी शुल्क: ${formatINR(
                matchedZone.deliveryCharge
              )}, न्यूनतम ऑर्डर: ${formatINR(matchedZone.minimumOrderValue)}, अनुमानित समय: ${
                matchedZone.estimatedDeliveryTime
              }।${freeNote}`
            : lang === 'hinglish'
            ? `Ji bilkul! ${pin} (${matchedZone.areaName}, ${matchedZone.city}) par delivery available hai. Delivery charge: ${formatINR(
                matchedZone.deliveryCharge
              )}, Minimum order: ${formatINR(matchedZone.minimumOrderValue)}, ETA: ${
                matchedZone.estimatedDeliveryTime
              }.${freeNote}`
            : `Yes! Delivery is available to ${pin} (${matchedZone.areaName}, ${matchedZone.city}). Delivery charge: ${formatINR(
                matchedZone.deliveryCharge
              )}, Minimum order: ${formatINR(matchedZone.minimumOrderValue)}, ETA: ${
                matchedZone.estimatedDeliveryTime
              }.${freeNote}`;
        return {
          text,
          recommendations: [],
          actionLink: localizeActionLink(ACTION_LINK_MAP.CART, lang),
        };
      }

      const activePins = deliveryZones
        .slice(0, 6)
        .map((z) => `${z.pincode} (${z.areaName})`)
        .join(', ');
      const text =
        lang === 'hi'
          ? `फिलहाल पिनकोड ${pin} पर डिलीवरी उपलब्ध नहीं है। हम केवल निर्धारित स्थानीय बिहार ज़ोन में ही डिलीवरी करते हैं (पूरे देश में अनसत्यापित डिलीवरी का वादा नहीं करते)।${
              activePins ? ` उपलब्ध पिनकोड: ${activePins}।` : ''
            } आप ${storeSettings.businessName}, ${
              storeSettings.address?.fullFormatted || ''
            } से स्टोर काउंटर पिकअप ले सकते हैं।`
          : lang === 'hinglish'
          ? `Filhal pincode ${pin} par delivery available NAHI hai. Hum sirf configured local Bihar zones mein deliver karte hain (no nationwide assumption).${
              activePins ? ` Serviceable pincodes: ${activePins}.` : ''
            } Aap ${storeSettings.businessName}, ${
              storeSettings.address?.fullFormatted || ''
            } par direct store counter pickup bhi le sakte hain.`
          : `Currently, delivery is NOT available to pincode ${pin}. We only deliver to configured local Bihar zones (no nationwide assumption).${
              activePins ? ` Serviceable pincodes include: ${activePins}.` : ''
            } Store counter pickup is available at ${storeSettings.businessName}, ${
              storeSettings.address?.fullFormatted || ''
            }.`;
      return {
        text,
        recommendations: [],
        actionLink: localizeActionLink(ACTION_LINK_MAP.CONTACT, lang),
      };
    }

    const pinSummary = deliveryZones
      .slice(0, 5)
      .map((z) => `${z.pincode} (${z.areaName})`)
      .join(', ');
    const text =
      lang === 'hi'
        ? `कृपया अपना 6-अंकीय पिनकोड साझा करें, मैं तुरंत डिलीवरी उपलब्धता जाँचूँगा! हम केवल सत्यापित बिहार डिलीवरी ज़ोन में डिलीवरी करते हैं${
            pinSummary ? ` (जैसे ${pinSummary})` : ''
          }, या आप ${storeSettings.address?.fullFormatted || 'आनंद बाजार, दानापुर'} पर हमारी दुकान से ले सकते हैं।`
        : lang === 'hinglish'
        ? `Apna 6-digit pincode share karein, main turant live delivery check kar dunga! Hum sirf verified Bihar zones mein ship karte hain${
            pinSummary ? ` jaise ${pinSummary}` : ''
          }, ya aap ${storeSettings.address?.fullFormatted || 'Anand Bazar, Danapur'} par shop se pick up kar sakte hain.`
        : `Share your 6-digit pincode and I will check live delivery availability for you! We only ship to Admin-verified Bihar delivery zones${
            pinSummary ? ` including ${pinSummary}` : ''
          }, or you can visit our shop at ${storeSettings.address?.fullFormatted || 'Anand Bazar, Danapur'}.`;
    return {
      text,
      recommendations: [],
      actionLink: localizeActionLink(ACTION_LINK_MAP.CART, lang),
    };
  }

  // 3. Official Store Details / Hours / Contact
  if (
    /\b(address|location|kahan|where|time|timing|hours|phone|call|contact|mandir|danapur)\b/.test(
      lower
    ) ||
    hasAnyTerm(lower, ['पता', 'कहाँ', 'कहां', 'समय', 'टाइम', 'फ़ोन', 'फोन', 'संपर्क', 'दानापुर'])
  ) {
    const text =
      lang === 'hi'
        ? `${storeSettings.businessName} का पता: ${storeSettings.address?.fullFormatted || ''}। समय: ${
            storeSettings.hours
          }। फ़ोन: ${storeSettings.phone}।`
        : lang === 'hinglish'
        ? `${storeSettings.businessName} ka address hai: ${
            storeSettings.address?.fullFormatted || ''
          }. Timing: ${storeSettings.hours}. Phone: ${storeSettings.phone}.`
        : `${storeSettings.businessName} is located at ${
            storeSettings.address?.fullFormatted || ''
          }. Hours: ${storeSettings.hours}. Phone: ${storeSettings.phone}.`;
    return {
      text,
      recommendations: [],
      actionLink: localizeActionLink(ACTION_LINK_MAP.CONTACT, lang),
    };
  }

  // 4. How to Order / Payment Methods
  if (
    /\b(how to order|kaise order|order kaise|payment|cod|razorpay|checkout)\b/.test(lower) ||
    hasAnyTerm(lower, ['ऑर्डर कैसे', 'कैसे मंगा', 'पेमेंट', 'कैश ऑन डिलीवरी', 'मंगवाना'])
  ) {
    const text =
      lang === 'hi'
        ? 'ऑर्डर करना बहुत आसान है: 1) अपना पसंदीदा उत्पाद और पैक साइज़ चुनें, 2) कार्ट या चेकआउट में 6-अंकीय पिनकोड जाँचें, 3) लॉगिन करके मानचित्र पर पता चुनें, और 4) Razorpay या कैश ऑन डिलीवरी (COD) से भुगतान करें।'
        : lang === 'hinglish'
        ? 'Order karna bahut aasan hai: 1) Apna product aur pack weight chunein, 2) Cart ya Checkout mein 6-digit pincode verify karein, 3) Login karke map par delivery address set karein, aur 4) Razorpay ya Cash on Delivery (COD) se pay karein.'
        : 'Ordering is quick: 1) Choose your item & pack weight, 2) Verify your 6-digit delivery pincode in Cart or Checkout, 3) Sign in and enter or pin your delivery address on the map, and 4) Pay via Razorpay or Cash on Delivery (COD).';
    return {
      text,
      recommendations: [],
      actionLink: localizeActionLink(ACTION_LINK_MAP.SHOP, lang),
    };
  }

  // 5. Catalog Search / Budget Recommendation
  const maxBudget = estimateBudgetFromQuery(lower);
  const categorySlugs = inferCategorySlugsFromQuery(lower);
  const candidateProducts =
    categorySlugs.length > 0
      ? products.filter((p) => categorySlugs.includes(p.categorySlug))
      : products;

  const cards = [];
  for (const product of candidateProducts) {
    const inStock = product.variants.filter((v) => v.stock > 0);
    if (inStock.length === 0) continue;

    const withinBudget = maxBudget ? inStock.filter((v) => v.price <= maxBudget) : inStock;
    if (withinBudget.length === 0) continue;

    const chosen = maxBudget
      ? [...withinBudget].sort((a, b) => b.price - a.price)[0]
      : withinBudget[0];

    cards.push({ product, variant: chosen });
    if (cards.length >= 3) break;
  }

  if (cards.length > 0) {
    const budgetNote = maxBudget
      ? lang === 'hi'
        ? ` (${formatINR(maxBudget)} के अंदर)`
        : lang === 'hinglish'
        ? ` (${formatINR(maxBudget)} ke andar)`
        : ` under ${formatINR(maxBudget)}`
      : '';
    const lines = cards
      .map(({ product, variant }) =>
        lang === 'hi'
          ? `• ${product.name} (${variant.label}) — ${formatINR(variant.price)} (${variant.stock} स्टॉक में)`
          : `• ${product.name} (${variant.label}) — ${formatINR(variant.price)} (${variant.stock} in stock)`
      )
      .join('\n');

    const intro =
      lang === 'hi'
        ? `हमारी रसोई से आपके लिए उपलब्ध ताज़ा विकल्प${budgetNote}:`
        : lang === 'hinglish'
        ? `Humari kitchen se aapke liye best in-stock options${budgetNote}:`
        : `Here are genuine in-stock recommendations${budgetNote} from our kitchen:`;

    return {
      text: `${intro}\n${lines}`,
      recommendations: cards,
      actionLink: localizeActionLink(ACTION_LINK_MAP.SHOP, lang),
    };
  }

  if (maxBudget && candidateProducts.length > 0) {
    const cheapestOptions = candidateProducts
      .flatMap((p) => p.variants.filter((v) => v.stock > 0).map((v) => ({ p, v })))
      .sort((a, b) => a.v.price - b.v.price);
    if (cheapestOptions.length > 0) {
      const lowest = cheapestOptions[0];
      const text =
        lang === 'hi'
          ? `फिलहाल इस श्रेणी में ${formatINR(
              maxBudget
            )} या उससे कम का कोई पैक स्टॉक में नहीं है। हमारा सबसे किफ़ायती उपलब्ध पैक ${formatINR(
              lowest.v.price
            )} से शुरू होता है: ${lowest.p.name} (${lowest.v.label})।`
          : lang === 'hinglish'
          ? `Abhi is category mein ${formatINR(
              maxBudget
            )} ke andar koi pack stock mein nahi hai. Humara sabse affordable available pack ${formatINR(
              lowest.v.price
            )} se shuru hota hai: ${lowest.p.name} (${lowest.v.label}).`
          : `Currently there are no in-stock items in that category at or below ${formatINR(
              maxBudget
            )}. Our closest available pack starts at ${formatINR(lowest.v.price)}: ${
              lowest.p.name
            } (${lowest.v.label}).`;
      return {
        text,
        recommendations: [{ product: lowest.p, variant: lowest.v }],
        actionLink: localizeActionLink(ACTION_LINK_MAP.SHOP, lang),
      };
    }
  }

  const fallbackText =
    lang === 'hi'
      ? `नमस्ते! मैं ${storeSettings.businessName} का GOKUL AI हूँ। मुझसे देसी घी के पैक, बजट में मिठाई (जैसे "500 रुपये के अंदर मिठाई"), फेस्टिव गिफ्ट बॉक्स, पिनकोड डिलीवरी (जैसे 801503) या अपने ऑर्डर का स्टेटस पूछें!`
      : lang === 'hinglish'
      ? `Namaste! Main ${storeSettings.businessName} ka GOKUL AI hoon. Mujhse Desi Ghee sizes, budget mein Mithai (jaise "500 rupaye ke andar mithai"), Festive Gift Boxes, pincode delivery (801503) ya apna order status poochein!`
      : `Namaste! I am GOKUL AI at ${storeSettings.businessName}. Ask me for Desi Ghee sizes, Mithai under a budget (e.g., "500 rupaye ke andar mithai"), Festive Gift Boxes, pincode delivery checks (e.g., 801503), or your order status!`;

  return {
    text: fallbackText,
    recommendations: [],
    actionLink: localizeActionLink(ACTION_LINK_MAP.SHOP, lang),
  };
}

async function callGoogleGeminiApi({ message, history, context, sessionId, user, language = 'en' }) {
  const lang = normalizeAiLanguage(language);
  const model = env.geminiModel || 'gemini-2.5-flash';
  const startedAt = process.hrtime.bigint();

  if (!env.geminiApiKey) {
    await AIUsage.create({
      conversationId: sessionId,
      user: user?._id || null,
      model,
      promptSnippet: message.slice(0, 140),
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      latencyMs: 0,
      success: false,
      errorMessage: 'GEMINI_API_KEY is not configured on backend',
    });
    return null;
  }

  const groundedCatalog = context.products.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.categorySlug,
    shortDescription: p.shortDescription,
    variants: p.variants.map((v) => ({
      label: v.label,
      priceINR: v.price,
      stock: v.stock,
    })),
  }));

  const groundedZones = context.deliveryZones.map((z) => ({
    pincode: z.pincode,
    area: z.areaName,
    city: z.city,
    deliveryChargeINR: z.deliveryCharge,
    freeDeliveryAboveINR: z.freeDeliveryAbove,
    minimumOrderINR: z.minimumOrderValue,
    eta: z.estimatedDeliveryTime,
  }));

  const groundedOrders = context.isAuthenticated
    ? context.customerOrders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        totalINR: o.pricing?.totalAmount ?? 0,
      }))
    : 'UNAUTHENTICATED_USER';

  const systemText = [
    `You are GOKUL AI ("Your Personal Taste Guide") for ${context.storeSettings.businessName} (Brand: GOKUL GHEE, Anand Bazar, Danapur Cantonment, Patna, Bihar 801503, Phone: ${context.storeSettings.phone}, Hours: ${context.storeSettings.hours}).`,
    'STRICT GROUNDING RULES:',
    '1. ONLY recommend products, variants, weights, INR prices, and stock quantities explicitly present in GROUNDED_CATALOG.',
    '2. NEVER invent products, discounts, certifications, or prices. Respect stock: only suggest variants with stock > 0.',
    '3. ONLY confirm delivery for pincodes present in GROUNDED_DELIVERY_ZONES. If a 6-digit pincode is not in that list, clearly say delivery is not available there and do not assume nationwide shipping.',
    '4. For order status requests: if CUSTOMER_ORDERS is UNAUTHENTICATED_USER, tell the customer to sign in first; otherwise summarize only orders from CUSTOMER_ORDERS.',
    '5. Respond concisely, warmly, and naturally strictly in the requested UI language: ' +
      (lang === 'hi'
        ? 'Hindi (Devanagari script only).'
        : lang === 'hinglish'
        ? 'Hinglish (Roman Hindi-English mix, e.g., "Ji bilkul, yeh options stock mein hain").'
        : 'clear English (or match the user’s phrasing naturally).'),
    '6. Output valid JSON strictly matching: {"replyText":"...","recommendedSlugs":["slug-1"],"actionLinkType":"NONE|SHOP|CONTACT|ORDERS|CART|LOGIN"}.',
    `GROUNDED_CATALOG=${JSON.stringify(groundedCatalog)}`,
    `GROUNDED_DELIVERY_ZONES=${JSON.stringify(groundedZones)}`,
    `CUSTOMER_ORDERS=${JSON.stringify(groundedOrders)}`,
  ].join('\n');

  const contents = [
    ...history.slice(-6).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.geminiApiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemText }] },
          contents,
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 700,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const latencyMs = Math.round(Number(process.hrtime.bigint() - startedAt) / 1_000_000);
    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || `Gemini HTTP ${response.status}`;
      await AIUsage.create({
        conversationId: sessionId,
        user: user?._id || null,
        model,
        promptSnippet: message.slice(0, 140),
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        latencyMs,
        success: false,
        errorMessage: errMsg,
      });
      return null;
    }

    const usage = data?.usageMetadata || {};
    const inputTokens = Number(usage.promptTokenCount || 0);
    const outputTokens = Number(usage.candidatesTokenCount || 0);
    const estimatedCostUsd = Number(
      (inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN).toFixed(6)
    );

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { replyText: rawText, recommendedSlugs: [], actionLinkType: 'NONE' };
    }

    await AIUsage.create({
      conversationId: sessionId,
      user: user?._id || null,
      model,
      promptSnippet: message.slice(0, 140),
      inputTokens,
      outputTokens,
      estimatedCostUsd,
      latencyMs,
      success: true,
      errorMessage: '',
    });

    const maxBudget = estimateBudgetFromQuery(message.toLowerCase());
    const recommendations = hydrateVerifiedRecommendations({
      slugs: Array.isArray(parsed.recommendedSlugs) ? parsed.recommendedSlugs : [],
      products: context.products,
      maxBudget,
    });

    return {
      text:
        String(parsed.replyText || '').trim() ||
        buildDeterministicCatalogReply({ message, context, language: lang }).text,
      recommendations,
      actionLink: localizeActionLink(ACTION_LINK_MAP[parsed.actionLinkType] || null, lang),
      source: 'gemini',
      usage: { inputTokens, outputTokens },
    };
  } catch (err) {
    const latencyMs = Math.round(Number(process.hrtime.bigint() - startedAt) / 1_000_000);
    await AIUsage.create({
      conversationId: sessionId,
      user: user?._id || null,
      model,
      promptSnippet: message.slice(0, 140),
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      latencyMs,
      success: false,
      errorMessage: err.message || 'Gemini request failed cleanly',
    });
    return null;
  }
}

export async function processGokulAiChat({ sessionId, message, user = null, language = 'en' }) {
  const lang = normalizeAiLanguage(language);
  const existingConv = await Conversation.findOne({ sessionId });

  // Ownership check if session belongs to a different registered customer
  const belongsToOtherUser = Boolean(
    existingConv &&
      existingConv.user &&
      (!user || String(existingConv.user) !== String(user._id))
  );
  const resolvedSessionId = belongsToOtherUser
    ? `${sessionId}-${Date.now()}`
    : sessionId;

  const context = await loadGroundedStoreContext({ user });
  const history = belongsToOtherUser ? [] : existingConv?.messages || [];

  const geminiResult = await callGoogleGeminiApi({
    message,
    history,
    context,
    sessionId: resolvedSessionId,
    user,
    language: lang,
  });

  const finalReply = geminiResult || {
    ...buildDeterministicCatalogReply({ message, context, language: lang }),
    source: 'catalog_fallback',
    usage: { inputTokens: 0, outputTokens: 0 },
  };

  const recommendedProductSlugs = (finalReply.recommendations || [])
    .map((r) => r.product?.slug)
    .filter(Boolean);

  await Conversation.findOneAndUpdate(
    { sessionId: resolvedSessionId },
    {
      $setOnInsert: { sessionId: resolvedSessionId },
      $set: {
        user: user?._id || (!belongsToOtherUser ? existingConv?.user : null) || null,
        lastActivityAt: new Date(),
      },
      $push: {
        messages: {
          $each: [
            { role: 'user', content: message, recommendedProductSlugs: [] },
            {
              role: 'assistant',
              content: finalReply.text,
              recommendedProductSlugs,
            },
          ],
          $slice: -40,
        },
      },
    },
    { upsert: true, new: true }
  );

  return {
    sessionId: resolvedSessionId,
    reply: finalReply,
  };
}
