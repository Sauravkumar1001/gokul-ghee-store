import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import { Inquiry } from '../models/Inquiry.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const DEFAULT_STORE_SETTINGS = {
  businessName: 'Anil Ji Ka Gokul Ghee',
  brandDisplayName: 'GOKUL GHEE',
  tagline: 'Tradition in Every Taste.',
  phone: '+91 89863 65592',
  hours: '9:00 AM – 9:00 PM daily',
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
  googleBusinessUrl: 'https://www.google.com/search?q=gokul+ghee+anand+bazar+danapur',
  googleMapsPlaceId: 'ChIJ53Oz9XZX7TkRW_5zLDQrlaI',
};

export const getStoreSettings = asyncHandler(async (_req, res) => {
  const settings = await StoreSettings.findOne({ singletonKey: 'PRIMARY_STORE' }).lean();
  res.status(200).json({
    success: true,
    settings: settings || DEFAULT_STORE_SETTINGS,
  });
});

export const submitContactEnquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.create({
    kind: 'CONTACT',
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: 'Your enquiry has been received by Anil Ji Ka Gokul Ghee.',
    inquiryId: String(inquiry._id),
  });
});

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existing = await Inquiry.findOne({ kind: 'NEWSLETTER', email });

  if (!existing) {
    await Inquiry.create({
      kind: 'NEWSLETTER',
      email,
    });
  }

  res.status(201).json({
    success: true,
    message: existing
      ? 'This email is already subscribed to Gokul Ghee updates.'
      : 'Subscribed successfully to festival & fresh batch alerts.',
  });
});

export const trackAnalyticsEvent = asyncHandler(async (req, res) => {
  const { eventType, visitorId, path, productId, metadata } = req.body;

  const event = await AnalyticsEvent.create({
    eventType,
    visitorId,
    user: req.user ? req.user._id : null,
    path,
    product: productId || null,
    metadata,
  });

  res.status(201).json({
    success: true,
    eventId: String(event._id),
  });
});
