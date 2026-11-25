import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';

const pincodeRegex = /^[1-9][0-9]{5}$/;

export const adminVariantSchema = z.object({
  _id: z.string().trim().optional(),
  sku: z.string().trim().min(2, 'Variant SKU is required.').max(60),
  label: z.string().trim().min(1, 'Variant pack label is required.').max(80),
  weightGrams: z.coerce.number().min(1, 'Weight in grams must be positive.'),
  price: z.coerce.number().min(0, 'Selling price cannot be negative.'),
  mrp: z.coerce.number().min(0, 'MRP cannot be negative.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.').default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  isActive: z.boolean().optional().default(true),
});

export const adminProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required.').max(140),
  slug: z.string().trim().toLowerCase().max(160).optional(),
  categoryId: z.string().trim().min(1, 'Category selection is required.'),
  shortDescription: z.string().trim().min(5, 'Short description is required.').max(400),
  description: z.string().trim().min(5, 'Full description is required.').max(4000),
  images: z.array(z.string().trim().min(1)).default([]),
  variants: z.array(adminVariantSchema).min(1, 'Add at least one pack variant.'),
  tags: z.array(z.string().trim()).optional().default([]),
  highlights: z.array(z.string().trim()).optional().default([]),
  storageNote: z.string().trim().max(300).optional().default(''),
  isBestseller: z.boolean().optional().default(false),
  isFeaturedGhee: z.boolean().optional().default(false),
  isSpecialOffer: z.boolean().optional().default(false),
  offerBadge: z.string().trim().max(60).optional().default(''),
  isActive: z.boolean().optional().default(true),
  isSampleData: z.boolean().optional().default(false),
});

export const adminCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required.').max(80),
  slug: z.string().trim().toLowerCase().max(100).optional(),
  eyebrow: z.string().trim().max(80).optional().default(''),
  description: z.string().trim().max(500).optional().default(''),
  image: z.string().trim().optional().default(''),
  displayOrder: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  isSampleData: z.boolean().optional().default(false),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  note: z.string().trim().max(300).optional().default(''),
});

export const adminInventoryAdjustSchema = z.object({
  productId: z.string().trim().min(1, 'Product ID is required.'),
  variantId: z.string().trim().min(1, 'Variant ID is required.'),
  delta: z.coerce.number().int().refine((n) => n !== 0, 'Adjustment delta cannot be zero.'),
  note: z.string().trim().max(250).optional().default('Manual admin stock adjustment'),
});

export const adminDeliveryZoneSchema = z.object({
  pincode: z.string().trim().regex(pincodeRegex, 'Enter a valid 6-digit Indian pincode.'),
  areaName: z.string().trim().min(2, 'Area name is required.').max(120),
  city: z.string().trim().min(2).max(80).default('Patna'),
  deliveryCharge: z.coerce.number().min(0, 'Delivery charge cannot be negative.'),
  freeDeliveryAbove: z.coerce.number().min(0).nullable().optional().default(null),
  minimumOrderValue: z.coerce.number().min(0).default(0),
  estimatedDeliveryTime: z.string().trim().min(2, 'Estimated delivery window is required.').max(120),
  notes: z.string().trim().max(300).optional().default(''),
  isActive: z.boolean().optional().default(true),
});

export const adminCouponSchema = z.object({
  code: z.string().trim().toUpperCase().min(2, 'Coupon code is required.').max(40),
  description: z.string().trim().max(250).optional().default(''),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().min(1, 'Discount value must be positive.'),
  maxDiscountAmount: z.coerce.number().min(0).nullable().optional().default(null),
  minOrderAmount: z.coerce.number().min(0).default(0),
  expiresAt: z.string().trim().min(4, 'Expiry date is required.'),
  usageLimit: z.coerce.number().int().min(1).nullable().optional().default(null),
  isActive: z.boolean().optional().default(true),
});

export const adminReviewModerateSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
});

export const adminStoreSettingsSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  brandDisplayName: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(180).optional().default(''),
  phone: z.string().trim().min(7).max(40),
  hours: z.string().trim().min(3).max(120),
  address: z.object({
    line1: z.string().trim().min(2).max(200),
    line2: z.string().trim().max(200).optional().default(''),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    country: z.string().trim().min(2).max(80).default('India'),
    postalCode: z.string().trim().min(4).max(20),
    landmark: z.string().trim().max(200).optional().default(''),
    fullFormatted: z.string().trim().min(5).max(350),
  }),
  googleBusinessUrl: z.string().trim().max(400).optional().default(''),
  googleMapsPlaceId: z.string().trim().max(200).optional().default(''),
  announcementItems: z.array(z.string().trim().min(1)).optional().default([]),
});
