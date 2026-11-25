import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'PRIMARY_STORE',
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      default: 'Anil Ji Ka Gokul Ghee',
    },
    brandDisplayName: {
      type: String,
      required: true,
      default: 'GOKUL GHEE',
    },
    tagline: {
      type: String,
      default: 'Tradition in Every Taste.',
    },
    phone: {
      type: String,
      required: true,
      default: '+91 89863 65592',
    },
    hours: {
      type: String,
      required: true,
      default: '9:00 AM – 9:00 PM daily',
    },
    address: {
      line1: { type: String, default: 'Math Road, Near Hindu Society Mandir' },
      line2: { type: String, default: 'Anand Bazar, Danapur Cantonment' },
      city: { type: String, default: 'Patna' },
      state: { type: String, default: 'Bihar' },
      country: { type: String, default: 'India' },
      postalCode: { type: String, default: '801503' },
      landmark: { type: String, default: 'Near Hindu Society Mandir, Anand Bazar' },
      fullFormatted: {
        type: String,
        default:
          'Math Road, Near Hindu Society Mandir, Anand Bazar, Danapur Cantonment, Patna, Bihar, India – 801503',
      },
    },
    googleBusinessUrl: {
      type: String,
      default: 'https://www.google.com/search?q=gokul+ghee+anand+bazar+danapur',
    },
    googleMapsPlaceId: {
      type: String,
      default: 'ChIJ53Oz9XZX7TkRW_5zLDQrlaI',
    },
    announcementItems: {
      type: [String],
      default: [
        'Anil Ji Ka Gokul Ghee — Anand Bazar, Danapur Cantonment, Patna',
        'Open Daily: 9:00 AM – 9:00 PM | Store Enquiries: +91 89863 65592',
      ],
    },
  },
  { timestamps: true }
);

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
