import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(40).default('Home'),
  recipientName: z.string().trim().min(2, 'Recipient name is required.').max(100),
  phone: z.string().trim().min(10, 'Valid phone number is required.').max(20),
  houseNumber: z.string().trim().min(1, 'House or flat number is required.').max(100),
  street: z.string().trim().min(2, 'Street or locality is required.').max(200),
  landmark: z.string().trim().max(150).optional().default(''),
  city: z.string().trim().min(2).max(80).default('Patna'),
  state: z.string().trim().min(2).max(80).default('Bihar'),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian pincode.'),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90).nullable().optional(),
      lng: z.number().min(-180).max(180).nullable().optional(),
    })
    .optional(),
  formattedAddress: z.string().trim().max(400).optional().default(''),
  isDefault: z.boolean().optional().default(false),
});

export const contactEnquirySchema = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(100),
  phone: z.string().trim().max(20).optional().default(''),
  email: z.string().trim().email('Invalid email address.').or(z.literal('')).optional().default(''),
  topic: z.string().trim().max(100).optional().default('Store Enquiry'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters.').max(2000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),
});

export const analyticsEventSchema = z.object({
  eventType: z.enum([
    'PAGE_VIEW',
    'PRODUCT_VIEW',
    'ADD_TO_CART',
    'CHECKOUT_START',
    'PURCHASE_COMPLETED',
  ]),
  visitorId: z.string().trim().max(120).optional().default(''),
  path: z.string().trim().max(300).optional().default(''),
  productId: z.string().trim().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const geocodeQuerySchema = z
  .object({
    query: z.string().trim().max(300).optional().default(''),
    lat: z.coerce.number().min(-90).max(90).optional().nullable(),
    lng: z.coerce.number().min(-180).max(180).optional().nullable(),
  })
  .refine(
    (val) => Boolean(val.query) || (val.lat != null && val.lng != null),
    { message: 'Provide an address query or valid latitude/longitude coordinates.' }
  );
