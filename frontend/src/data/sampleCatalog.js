/**
 * PHASE 1 SEED CATALOG (CLEARLY MARKED SAMPLE DATA)
 * ---------------------------------------------------------------------------
 * IMPORTANT BUSINESS REQUIREMENT:
 * Actual product prices, pack weights, stock quantities, and certifications
 * must NEVER be invented. All items below are clearly flagged with
 * `isSampleData: true` as initial template entries for the store owner to
 * edit, price, and verify via the Admin Panel before launch.
 */

export const SAMPLE_CATEGORIES = [
  {
    id: 'cat-desi-ghee',
    name: 'Desi Ghee',
    slug: 'desi-ghee',
    eyebrow: 'Heritage Signature',
    description:
      'Slow-simmered traditional golden ghee crafted for rich aroma and granular texture.',
    image: '/images/cat-desi-ghee.jpg',
    displayOrder: 1,
    isActive: true,
    isSampleData: true,
  },
  {
    id: 'cat-mithai',
    name: 'Mithai',
    slug: 'mithai',
    eyebrow: 'Celebration Craft',
    description:
      'Classic Indian sweets prepared in pure ghee with roasted nuts and aromatic saffron.',
    image: '/images/cat-mithai.jpg',
    displayOrder: 2,
    isActive: true,
    isSampleData: true,
  },
  {
    id: 'cat-samosa',
    name: 'Samosa',
    slug: 'samosa',
    eyebrow: 'Fresh Counter Classics',
    description:
      'Crisp golden hand-folded samosas paired with house-style mint and tamarind chutneys.',
    image: '/images/cat-samosa.jpg',
    displayOrder: 3,
    isActive: true,
    isSampleData: true,
  },
  {
    id: 'cat-namkeen',
    name: 'Namkeen',
    slug: 'namkeen',
    eyebrow: 'Artisanal Savory',
    description:
      'Small-batch spiced mixtures, crisp sev, and dry-fruit blends for tea-time gatherings.',
    image: '/images/cat-namkeen.jpg',
    displayOrder: 4,
    isActive: true,
    isSampleData: true,
  },
  {
    id: 'cat-traditional-snacks',
    name: 'Traditional Snacks',
    slug: 'traditional-snacks',
    eyebrow: 'Heirloom Pantry',
    description:
      'Flaky mathri, khasta kachori, and timeless savory bites rooted in Bihar hospitality.',
    image: '/images/cat-traditional-snacks.jpg',
    displayOrder: 5,
    isActive: true,
    isSampleData: true,
  },
  {
    id: 'cat-special-combos',
    name: 'Special Combos',
    slug: 'special-combos',
    eyebrow: 'Curated Hampers',
    description:
      'Thoughtful assortments pairing pure ghee, mithai boxes, and savory favorites.',
    image: '/images/cat-combos.jpg',
    displayOrder: 6,
    isActive: true,
    isSampleData: true,
  },
  {
    id: 'cat-festival-specials',
    name: 'Festival Specials',
    slug: 'festival-specials',
    eyebrow: 'Seasonal Craft',
    description:
      'Limited-batch festive delicacies crafted for Diwali, Holi, Chhath, and family milestones.',
    image: '/images/festival-specials.jpg',
    displayOrder: 7,
    isActive: true,
    isSampleData: true,
  },
];

export const SAMPLE_PRODUCTS = [
  {
    id: 'prod-shahi-cow-ghee',
    slug: 'sample-shahi-desi-cow-ghee',
    name: 'Shahi Desi Cow Ghee (Sample)',
    categorySlug: 'desi-ghee',
    categoryName: 'Desi Ghee',
    shortDescription:
      'Rich golden, naturally granular cow ghee prepared using traditional slow-clarification.',
    description:
      'Sample placeholder description for the flagship Desi Cow Ghee listing. Designed to showcase granular danedar texture, warm nutty aroma, and glass jar packaging options. Store owner can replace exact batch details, pricing, and pack weights in Admin.',
    images: ['/images/cat-desi-ghee.jpg', '/images/ghee-pour.jpg', '/images/story-heritage.jpg'],
    variants: [
      { id: 'v-cow-250', label: '250g Sample Pack', weightGrams: 250, price: 325, mrp: 360, stock: 18 },
      { id: 'v-cow-500', label: '500g Sample Pack', weightGrams: 500, price: 620, mrp: 690, stock: 24 },
      { id: 'v-cow-1000', label: '1kg Sample Jar', weightGrams: 1000, price: 1190, mrp: 1320, stock: 12 },
    ],
    tags: ['Desi Ghee', 'Danedar', 'Kitchen Staple'],
    highlights: [
      'Sample culinary highlight — update with verified batch details',
      'Traditional golden granular texture & warm aroma',
      'Sealed food-grade jar packaging option',
    ],
    storageNote: 'Store in a cool, dry place away from direct sunlight. Use a clean, dry spoon.',
    isBestseller: true,
    isFeaturedGhee: true,
    isSpecialOffer: false,
    isSampleData: true,
  },
  {
    id: 'prod-bilona-buffalo-ghee',
    slug: 'sample-classic-buffalo-desi-ghee',
    name: 'Classic White Danedar Ghee (Sample)',
    categorySlug: 'desi-ghee',
    categoryName: 'Desi Ghee',
    shortDescription:
      'Velvety, aromatic traditional ghee ideal for festive mithai, dal tadka, and parathas.',
    description:
      'Sample catalog item representing classic household desi ghee favored in Bihari kitchens for daily cooking and festive preparation. Replace price, stock, and exact preparation method via Admin.',
    images: ['/images/ghee-pour.jpg', '/images/cat-desi-ghee.jpg'],
    variants: [
      { id: 'v-buf-500', label: '500g Sample Pack', weightGrams: 500, price: 580, mrp: 640, stock: 15 },
      { id: 'v-buf-1000', label: '1kg Sample Jar', weightGrams: 1000, price: 1120, mrp: 1250, stock: 9 },
    ],
    tags: ['Classic Ghee', 'High Smoke Point'],
    highlights: [
      'Sample specification — editable by store owner',
      'Rich mouthfeel suited for festive halwas and laddoos',
      'Batch-packed upon order confirmation',
    ],
    storageNote: 'Keep airtight at room temperature.',
    isBestseller: true,
    isFeaturedGhee: true,
    isSpecialOffer: true,
    offerBadge: 'Sample Combo Save',
    isSampleData: true,
  },
  {
    id: 'prod-kaju-katli-box',
    slug: 'sample-royal-kaju-katli',
    name: 'Royal Kaju Katli (Sample)',
    categorySlug: 'mithai',
    categoryName: 'Mithai',
    shortDescription:
      'Smooth diamond-cut cashew fudge delicately finished with traditional presentation.',
    description:
      'Sample mithai product entry illustrating fine cashew confection crafted for family celebrations and gifting. Owner will update final ingredient breakdown, shelf life, and per-box pricing before launch.',
    images: ['/images/cat-mithai.jpg', '/images/cat-combos.jpg'],
    variants: [
      { id: 'v-kk-250', label: '250g Sample Box', weightGrams: 250, price: 290, mrp: 320, stock: 20 },
      { id: 'v-kk-500', label: '500g Sample Box', weightGrams: 500, price: 560, mrp: 620, stock: 14 },
      { id: 'v-kk-1000', label: '1kg Family Box', weightGrams: 1000, price: 1080, mrp: 1200, stock: 7 },
    ],
    tags: ['Mithai', 'Gifting', 'Cashew'],
    highlights: [
      'Sample listing — replace with actual store pricing',
      'Neatly layered festive gift box presentation',
      'Freshly packed from the counter',
    ],
    storageNote: 'Best enjoyed fresh; refrigerate in an airtight box as advised by store.',
    isBestseller: true,
    isFeaturedGhee: false,
    isSpecialOffer: false,
    isSampleData: true,
  },
  {
    id: 'prod-desi-ghee-motichoor-laddoo',
    slug: 'sample-desi-ghee-motichoor-laddoo',
    name: 'Desi Ghee Motichoor Laddoo (Sample)',
    categorySlug: 'mithai',
    categoryName: 'Mithai',
    shortDescription:
      'Fine golden boondi pearls gently bound with cardamom, melon seeds, and pure ghee aroma.',
    description:
      'Sample heritage sweet entry showcasing classic Motichoor Laddoo prepared for pujas, weddings, and everyday sweet cravings. Owner configures live daily stock and exact pack pricing.',
    images: ['/images/prod-motichoor-laddoo.jpg', '/images/festival-specials.jpg'],
    variants: [
      { id: 'v-ml-500', label: '500g Sample Box', weightGrams: 500, price: 340, mrp: 380, stock: 22 },
      { id: 'v-ml-1000', label: '1kg Celebration Box', weightGrams: 1000, price: 660, mrp: 740, stock: 11 },
    ],
    tags: ['Desi Ghee Mithai', 'Puja Special'],
    highlights: [
      'Sample product template for store owner',
      'Fragrant cardamom and roasted melon seed garnish',
      'Ideal for temple offerings and festive gifting',
    ],
    storageNote: 'Consume fresh within store-recommended window.',
    isBestseller: true,
    isFeaturedGhee: false,
    isSpecialOffer: true,
    offerBadge: 'Festival Sample Offer',
    isSampleData: true,
  },
  {
    id: 'prod-crispy-aloo-samosa',
    slug: 'sample-danapur-special-samosa-pack',
    name: 'Anand Bazar Crispy Samosa Pack (Sample)',
    categorySlug: 'samosa',
    categoryName: 'Samosa',
    shortDescription:
      'Flaky golden pastry filled with tempered spiced potatoes and served with twin chutneys.',
    description:
      'Sample listing for fresh local-delivery counter samosas crafted hot throughout the day. Note: Eligible for hyperlocal serviceable pincodes only once delivery zones are configured by Admin.',
    images: ['/images/cat-samosa.jpg', '/images/cat-traditional-snacks.jpg'],
    variants: [
      { id: 'v-sam-4', label: 'Pack of 4 (Sample)', weightGrams: 300, price: 80, mrp: 90, stock: 30 },
      { id: 'v-sam-8', label: 'Pack of 8 (Sample)', weightGrams: 600, price: 155, mrp: 180, stock: 16 },
    ],
    tags: ['Fresh Counter', 'Evening Snack', 'Local Delivery'],
    highlights: [
      'Sample pack price — set local pricing in Admin',
      'Includes green mint-coriander & sweet tamarind chutney notes',
      'Hyperlocal Danapur / Patna zone serviceability check applies',
    ],
    storageNote: 'Best served warm immediately upon delivery.',
    isBestseller: true,
    isFeaturedGhee: false,
    isSpecialOffer: false,
    isSampleData: true,
  },
  {
    id: 'prod-shahi-dry-fruit-mixture',
    slug: 'sample-shahi-dry-fruit-namkeen',
    name: 'Shahi Dry-Fruit Mixture (Sample)',
    categorySlug: 'namkeen',
    categoryName: 'Namkeen',
    shortDescription:
      'Crisp golden sev, roasted cashews, almonds, curry leaves, and gentle spice balance.',
    description:
      'Sample artisanal namkeen item curated for evening tea tables and festive hosting boxes. Replace weight variants, price, and shelf life before going live.',
    images: ['/images/cat-namkeen.jpg', '/images/cat-traditional-snacks.jpg'],
    variants: [
      { id: 'v-nam-250', label: '250g Sample Pouch', weightGrams: 250, price: 165, mrp: 190, stock: 25 },
      { id: 'v-nam-500', label: '500g Sample Pouch', weightGrams: 500, price: 310, mrp: 350, stock: 19 },
    ],
    tags: ['Namkeen', 'Tea-Time', 'Crunchy'],
    highlights: [
      'Sample price & pack weight',
      'Small-batch crispness with aromatic whole spices',
      'Moisture-resistant resealable packaging option',
    ],
    storageNote: 'Seal tightly after opening to retain crispness.',
    isBestseller: false,
    isFeaturedGhee: false,
    isSpecialOffer: false,
    isSampleData: true,
  },
  {
    id: 'prod-khasta-mathri-jar',
    slug: 'sample-ajwain-khasta-mathri',
    name: 'Ajwain Khasta Mathri (Sample)',
    categorySlug: 'traditional-snacks',
    categoryName: 'Traditional Snacks',
    shortDescription:
      'Flaky, slow-fried savory crackers infused with roasted carom seeds and cracked pepper.',
    description:
      'Sample traditional snack item honoring classic North Indian pantry favorites. Configurable by Admin for weight packs and pricing.',
    images: ['/images/cat-traditional-snacks.jpg', '/images/cat-namkeen.jpg'],
    variants: [
      { id: 'v-mat-250', label: '250g Sample Pack', weightGrams: 250, price: 140, mrp: 160, stock: 21 },
      { id: 'v-mat-500', label: '500g Sample Pack', weightGrams: 500, price: 265, mrp: 300, stock: 10 },
    ],
    tags: ['Traditional Snacks', 'Tea Pairing'],
    highlights: [
      'Sample catalog entry',
      'Flaky layered bite with ajwain & black pepper',
      'Pairs naturally with mango pickle and evening chai',
    ],
    storageNote: 'Store in an airtight container at ambient temperature.',
    isBestseller: false,
    isFeaturedGhee: false,
    isSpecialOffer: false,
    isSampleData: true,
  },
  {
    id: 'prod-gokul-heritage-gift-box',
    slug: 'sample-gokul-heritage-celebration-hamper',
    name: 'Gokul Heritage Celebration Hamper (Sample)',
    categorySlug: 'special-combos',
    categoryName: 'Special Combos',
    shortDescription:
      'A curated forest-green & gold hamper combining Desi Ghee, assorted Mithai, and Namkeen.',
    description:
      'Sample luxury combo box demonstrating multi-category gifting sets for weddings, housewarmings, and corporate gifting. Owner customizes exact inclusions and combo pricing.',
    images: ['/images/cat-combos.jpg', '/images/cat-mithai.jpg', '/images/cat-desi-ghee.jpg'],
    variants: [
      { id: 'v-cmb-std', label: 'Classic Gift Hamper (Sample)', weightGrams: 1250, price: 1350, mrp: 1550, stock: 8 },
      { id: 'v-cmb-dlx', label: 'Grand Family Hamper (Sample)', weightGrams: 2000, price: 2150, mrp: 2450, stock: 5 },
    ],
    tags: ['Special Combos', 'Luxury Gifting'],
    highlights: [
      'Sample hamper pricing & contents',
      'Signature deep green & gold presentation box',
      'Includes customizable gift message card',
    ],
    storageNote: 'Keep sweet section refrigerated; store ghee jar in a cool dry cabinet.',
    isBestseller: true,
    isFeaturedGhee: true,
    isSpecialOffer: true,
    offerBadge: 'Sample Hamper Savings',
    isSampleData: true,
  },
  {
    id: 'prod-kesar-pista-gujiya',
    slug: 'sample-kesar-pista-mawa-gujiya',
    name: 'Kesar Pista Mawa Gujiya (Sample)',
    categorySlug: 'festival-specials',
    categoryName: 'Festival Specials',
    shortDescription:
      'Golden crescent pastries stuffed with slow-roasted khoya, green cardamom, and pistachios.',
    description:
      'Sample seasonal festive specialty created for Holi, Diwali, and celebratory occasions. Owner toggles seasonal availability and batch pricing via Admin.',
    images: ['/images/festival-specials.jpg', '/images/cat-mithai.jpg'],
    variants: [
      { id: 'v-guj-500', label: '500g Festive Box (Sample)', weightGrams: 500, price: 420, mrp: 480, stock: 12 },
      { id: 'v-guj-1000', label: '1kg Festive Box (Sample)', weightGrams: 1000, price: 810, mrp: 920, stock: 6 },
    ],
    tags: ['Festival Specials', 'Limited Batch'],
    highlights: [
      'Sample seasonal pricing',
      'Hand-pleated golden pastry crust',
      'Garnished with saffron threads and slivered pistachios',
    ],
    storageNote: 'Store airtight in a cool place.',
    isBestseller: false,
    isFeaturedGhee: false,
    isSpecialOffer: true,
    offerBadge: 'Seasonal Sample',
    isSampleData: true,
  },
];

export const WHY_CHOOSE_PILLARS = [
  {
    id: 'pillar-craft',
    title: 'Time-Honored Culinary Craft',
    description:
      'Rooted in traditional slow-simmering and handcrafted sweet-making practices from Anand Bazar, Danapur.',
  },
  {
    id: 'pillar-local',
    title: 'Real Neighbourhood Storefront',
    description:
      'Visit Anil Ji Ka Gokul Ghee in person on Math Road, Near Hindu Society Mandir, daily from 9:00 AM to 9:00 PM.',
  },
  {
    id: 'pillar-fresh',
    title: 'Batch-Packed Freshness',
    description:
      'Prepared with attentive small-batch discipline so ghee aroma, mithai texture, and snack crispness stay true.',
  },
  {
    id: 'pillar-transparent',
    title: 'Transparent Pincode Serviceability',
    description:
      'Honest hyperlocal and regional delivery zones configured directly by the store to preserve food freshness.',
  },
];

export const SPECIAL_OFFER_BANNERS = [
  {
    id: 'offer-ghee-combo',
    eyebrow: 'Curated Kitchen Pairing',
    title: 'Heritage Kitchen Pairing',
    subtitle:
      'Combine pure Bilona Desi Ghee jars with festive mithai hampers for auspicious pujas, weddings, and memorable family gifting.',
    ctaLabel: 'Explore Special Combos',
    ctaLink: '/shop/special-combos',
    badge: 'Combo Savings',
  },
  {
    id: 'offer-festive',
    eyebrow: 'Seasonal Craft',
    title: 'Festival & Puja Orders',
    subtitle:
      'Pre-order curated celebratory assortments and freshly prepared sweets for family gatherings in Danapur and Patna.',
    ctaLabel: 'Browse Festival Specials',
    ctaLink: '/shop/festival-specials',
    badge: 'Seasonal Selection',
  },
];
