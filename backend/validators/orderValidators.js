import { z } from 'zod';

const pincodeRegex = /^[1-9][0-9]{5}$/;

export const cartLineItemSchema = z
  .object({
    productId: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    variantId: z.string().trim().min(1).optional(),
    sku: z.string().trim().min(1).optional(),
    quantity: z.coerce.number().int().min(1, 'Minimum quantity is 1.').max(50, 'Maximum 50 packs per line item.'),
  })
  .refine((item) => Boolean(item.productId || item.slug), {
    message: 'Product identifier (productId or slug) is required.',
  })
  .refine((item) => Boolean(item.variantId || item.sku), {
    message: 'Product variant identifier (variantId or sku) is required.',
  });

export const pincodeCheckSchema = z.object({
  pincode: z
    .string()
    .trim()
    .regex(pincodeRegex, 'Please enter a valid 6-digit Indian pincode.'),
  subtotal: z.coerce.number().min(0).optional().default(0),
});

export const couponValidateSchema = z.object({
  code: z.string().trim().min(2, 'Please enter a coupon code.').max(40),
  subtotal: z.coerce.number().min(0),
});

export const checkoutQuoteSchema = z.object({
  items: z.array(cartLineItemSchema).min(1, 'Cart cannot be empty.'),
  pincode: z
    .string()
    .trim()
    .regex(pincodeRegex, 'Please enter a valid 6-digit Indian pincode.'),
  couponCode: z.string().trim().max(40).optional().default(''),
});

export const shippingAddressSchema = z.object({
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
    .regex(pincodeRegex, 'Please enter a valid 6-digit Indian pincode.'),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90).nullable().optional(),
      lng: z.number().min(-180).max(180).nullable().optional(),
    })
    .optional(),
});

export const placeOrderSchema = z
  .object({
    items: z.array(cartLineItemSchema).min(1, 'Cart cannot be empty.'),
    addressId: z.string().trim().min(1).optional(),
    shippingAddress: shippingAddressSchema.optional(),
    saveAddress: z.boolean().optional().default(false),
    couponCode: z.string().trim().max(40).optional().default(''),
    paymentMethod: z.enum(['COD', 'RAZORPAY']).default('COD'),
  })
  .refine((data) => Boolean(data.addressId || data.shippingAddress), {
    message: 'Select a saved delivery address or provide complete shipping details.',
  });

export const razorpayVerifySchema = z.object({
  orderId: z.string().trim().min(1, 'Order identifier is required.'),
  razorpay_order_id: z.string().trim().min(1, 'Razorpay order ID is required.'),
  razorpay_payment_id: z.string().trim().min(1, 'Razorpay payment ID is required.'),
  razorpay_signature: z.string().trim().min(1, 'Razorpay signature is required.'),
});

export const razorpayFailureSchema = z.object({
  orderId: z.string().trim().min(1, 'Order identifier is required.'),
  reason: z
    .string()
    .trim()
    .max(300)
    .optional()
    .default('Payment was not completed by customer.'),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(300).optional().default('Cancelled by customer'),
});

export const createReviewSchema = z.object({
  productId: z.string().trim().min(1, 'Product identifier is required.'),
  orderId: z.string().trim().min(1, 'Delivered order identifier is required.'),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(''),
  comment: z
    .string()
    .trim()
    .min(5, 'Please write at least 5 characters in your review.')
    .max(1000),
});
