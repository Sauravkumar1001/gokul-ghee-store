/**
 * Official verified store configuration for Anil Ji Ka Gokul Ghee (GOKUL GHEE).
 * In Phases 3-5, these defaults become editable by the owner via Admin Settings
 * stored in MongoDB while preserving verified fallback defaults.
 */
export const STORE_CONFIG = {
  businessName: 'Anil Ji Ka Gokul Ghee',
  brandDisplayName: 'GOKUL GHEE',
  tagline: 'Tradition in Every Taste.',
  locationIdentity: 'Anil Ji Ka Gokul Ghee, Anand Bazar, Danapur.',
  address: {
    line1: 'Math Road, Near Hindu Society Mandir',
    line2: 'Anand Bazar, Danapur Cantonment',
    city: 'Patna',
    state: 'Bihar',
    country: 'India',
    postalCode: '801503',
    landmark: 'Near Hindu Society Mandir, Anand Bazar',
    fullFormatted:
      'Math Road, Near Hindu Society Mandir, Anand Bazar, Danapur Cantonment, Patna, Bihar, India – 801503',
  },
  phone: '+91 89863 65592',
  phoneHref: 'tel:+918986365592',
  hours: '9:00 AM – 9:00 PM daily',
  googleBusinessUrl: 'https://www.google.com/search?q=gokul+ghee+anand+bazar+danapur',
  googleMapsPlaceId: 'ChIJ53Oz9XZX7TkRW_5zLDQrlaI',
  googleRating: {
    score: 4.9,
    outOf: 5,
    reviewCount: 169,
  },
  festivePreOrder: {
    occasion: 'Diwali / Chhath',
    occasionHi: 'दिवाली / छठ',
    closeDateIso: '2026-11-25T23:59:59+05:30',
  },
  // Set to false once verified catalog pricing & imagery replace initial sample items
  showSampleBadge: true,
  freeDeliveryThreshold: 499,
  verificationNotice:
    'Store phone, hours, and product catalog values should be verified by the owner prior to public launch.',
  announcementItems: [
    'Anil Ji Ka Gokul Ghee — Anand Bazar, Danapur Cantonment, Patna',
    'Open Daily: 9:00 AM – 9:00 PM | Store Enquiries: +91 89863 65592',
    'Pre-Launch Storefront Preview — Sample Catalog Active Pending Owner Inventory Setup',
  ],
};

export const STORE_ROUTES = [
  { label: 'Home', path: '/' },
  { label: 'Shop All', path: '/shop' },
  { label: 'Desi Ghee', path: '/shop/desi-ghee' },
  { label: 'Mithai', path: '/shop/mithai' },
  { label: 'Samosa & Snacks', path: '/shop/samosa' },
  { label: 'Festival Specials', path: '/shop/festival-specials' },
  { label: 'About', path: '/about' },
  { label: 'Visit Store', path: '/contact' },
];
