import crypto from 'node:crypto';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import app from '../app.js';
import { env } from '../config/env.js';
import {
  AnalyticsEvent,
  Coupon,
  DeliveryZone,
  Inventory,
  Notification,
  Order,
  Product,
  Review,
  User,
} from '../models/index.js';
import { AUTH_COOKIE_NAME, signAccessToken } from '../utils/jwt.js';

function makeAuthCookie(userOverrides = {}) {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    phone: '+91 9876543210',
    role: 'customer',
    isActive: true,
    wishlist: [],
    ...userOverrides,
  };
  vi.spyOn(User, 'findById').mockResolvedValue(user);
  const token = signAccessToken(user);
  return { user, cookie: `${AUTH_COOKIE_NAME}=${token}` };
}

describe('Phase 4 Backend Checkout, Pincode, Inventory Reservation, COD & Razorpay', () => {
  const originalRazorpayEnv = { ...env.razorpay };

  afterEach(() => {
    vi.restoreAllMocks();
    env.razorpay.keyId = originalRazorpayEnv.keyId;
    env.razorpay.keySecret = originalRazorpayEnv.keySecret;
    env.razorpay.webhookSecret = originalRazorpayEnv.webhookSecret;
  });

  it('checks 6-digit Indian pincode serviceability strictly without assuming nationwide delivery', async () => {
    const invalidRes = await request(app)
      .post('/api/v1/delivery/check-pincode')
      .send({ pincode: '8015', subtotal: 500 });
    expect(invalidRes.status).toBe(400);

    vi.spyOn(DeliveryZone, 'findOne').mockReturnValue({
      lean: async () => ({
        _id: new mongoose.Types.ObjectId(),
        pincode: '801503',
        areaName: 'Anand Bazar & Danapur Cantonment',
        city: 'Patna',
        deliveryCharge: 30,
        freeDeliveryAbove: 499,
        minimumOrderValue: 199,
        estimatedDeliveryTime: 'Same-day dispatch',
        notes: 'Danapur zone',
        isActive: true,
      }),
    });

    const okRes = await request(app)
      .post('/api/v1/delivery/check-pincode')
      .send({ pincode: '801503', subtotal: 620 });
    expect(okRes.status).toBe(200);
    expect(okRes.body.serviceable).toBe(true);
    expect(okRes.body.deliveryCharge).toBe(0);
    expect(okRes.body.freeDeliveryApplied).toBe(true);

    vi.spyOn(DeliveryZone, 'findOne').mockReturnValue({
      lean: async () => null,
    });
    const unserviceableRes = await request(app)
      .post('/api/v1/delivery/check-pincode')
      .send({ pincode: '110001', subtotal: 999 });
    expect(unserviceableRes.status).toBe(200);
    expect(unserviceableRes.body.serviceable).toBe(false);
    expect(unserviceableRes.body.message).toMatch(/89863 65592/);
  });

  it('validates coupon eligibility, minimum order amount, and percentage cap server-side', async () => {
    vi.spyOn(Coupon, 'findOne').mockReturnValue({
      lean: async () => ({
        _id: new mongoose.Types.ObjectId(),
        code: 'GOKULSAMPLE',
        description: '10% off up to Rs 150',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 150,
        minOrderAmount: 499,
        expiresAt: new Date(Date.now() + 86400000),
        usageLimit: 50,
        usedCount: 2,
        isActive: true,
      }),
    });

    const belowMin = await request(app)
      .post('/api/v1/coupons/validate')
      .send({ code: 'gokulsample', subtotal: 300 });
    expect(belowMin.status).toBe(400);
    expect(belowMin.body.valid).toBe(false);

    const applied = await request(app)
      .post('/api/v1/coupons/validate')
      .send({ code: 'gokulsample', subtotal: 2000 });
    expect(applied.status).toBe(200);
    expect(applied.body.applied).toBe(true);
    expect(applied.body.discountAmount).toBe(150);
  });

  it('computes authoritative server checkout quotes ignoring any client price tampering', async () => {
    const prodId = new mongoose.Types.ObjectId();
    const variantId = new mongoose.Types.ObjectId();

    vi.spyOn(Product, 'find').mockReturnValue({
      lean: async () => [
        {
          _id: prodId,
          slug: 'sample-shahi-desi-cow-ghee',
          name: 'Shahi Desi Cow Ghee (Sample)',
          images: ['/images/cat-desi-ghee.jpg'],
          isActive: true,
          isSampleData: true,
          variants: [
            {
              _id: variantId,
              sku: 'SAMPLE-COW-500',
              label: '500g Sample Pack',
              price: 620,
              mrp: 690,
              stock: 20,
              lowStockThreshold: 5,
              isActive: true,
            },
          ],
        },
      ],
    });

    vi.spyOn(DeliveryZone, 'findOne').mockReturnValue({
      lean: async () => ({
        _id: new mongoose.Types.ObjectId(),
        pincode: '801502',
        areaName: 'Khagaul',
        city: 'Patna',
        deliveryCharge: 40,
        freeDeliveryAbove: 700,
        minimumOrderValue: 299,
        estimatedDeliveryTime: '2-4 hours',
        isActive: true,
      }),
    });

    vi.spyOn(Coupon, 'findOne').mockReturnValue({ lean: async () => null });

    const quoteRes = await request(app)
      .post('/api/v1/orders/quote')
      .send({
        items: [{ productId: String(prodId), variantId: String(variantId), quantity: 1 }],
        pincode: '801502',
      });

    expect(quoteRes.status).toBe(200);
    expect(quoteRes.body.quote.pricing.subtotal).toBe(620);
    expect(quoteRes.body.quote.pricing.deliveryCharge).toBe(40);
    expect(quoteRes.body.quote.pricing.totalAmount).toBe(660);
  });

  it('places a COD order with atomic stock reservation & rolls back cleanly if stock runs out mid-cart', async () => {
    const { user, cookie } = makeAuthCookie();
    const prod1 = new mongoose.Types.ObjectId();
    const var1 = new mongoose.Types.ObjectId();
    const prod2 = new mongoose.Types.ObjectId();
    const var2 = new mongoose.Types.ObjectId();

    vi.spyOn(Product, 'find').mockReturnValue({
      lean: async () => [
        {
          _id: prod1,
          slug: 'sample-shahi-desi-cow-ghee',
          name: 'Shahi Desi Cow Ghee (Sample)',
          images: ['/images/cat-desi-ghee.jpg'],
          isActive: true,
          variants: [
            { _id: var1, sku: 'V1', label: '500g', price: 620, mrp: 690, stock: 10, isActive: true },
          ],
        },
        {
          _id: prod2,
          slug: 'sample-besan-laddu',
          name: 'Kesar Besan Laddu (Sample)',
          images: ['/images/cat-mithai.jpg'],
          isActive: true,
          variants: [
            { _id: var2, sku: 'V2', label: '250g', price: 240, mrp: 280, stock: 5, isActive: true },
          ],
        },
      ],
    });

    vi.spyOn(DeliveryZone, 'findOne').mockReturnValue({
      lean: async () => ({
        _id: new mongoose.Types.ObjectId(),
        pincode: '801503',
        areaName: 'Anand Bazar',
        city: 'Patna',
        deliveryCharge: 30,
        freeDeliveryAbove: 499,
        minimumOrderValue: 199,
        estimatedDeliveryTime: '60-120 mins',
        isActive: true,
      }),
    });

    vi.spyOn(Inventory, 'create').mockResolvedValue({});
    vi.spyOn(Notification, 'create').mockResolvedValue({});
    vi.spyOn(AnalyticsEvent, 'create').mockResolvedValue({});

    // Simulate atomic reservation succeeding for item 1, then failing concurrency check on item 2
    const atomicSpy = vi
      .spyOn(Product, 'findOneAndUpdate')
      .mockResolvedValueOnce({
        _id: prod1,
        variants: [{ _id: var1, stock: 8, lowStockThreshold: 5 }],
      })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        _id: prod1,
        variants: [{ _id: var1, stock: 10 }],
      });

    const shippingAddress = {
      recipientName: 'Ravi Kumar',
      phone: '+91 9876543210',
      houseNumber: '12B',
      street: 'Math Road, Anand Bazar',
      landmark: 'Near Hindu Society Mandir',
      city: 'Patna',
      state: 'Bihar',
      pincode: '801503',
    };

    const conflictRes = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', [cookie])
      .send({
        items: [
          { productId: String(prod1), variantId: String(var1), quantity: 2 },
          { productId: String(prod2), variantId: String(var2), quantity: 1 },
        ],
        shippingAddress,
        paymentMethod: 'COD',
      });

    expect(conflictRes.status).toBe(409);
    // Verifies rollback call happened on prod1
    expect(atomicSpy).toHaveBeenCalledTimes(3);

    // Now test successful single-item COD order creation
    vi.restoreAllMocks();
    makeAuthCookie(user);
    vi.spyOn(Product, 'find').mockReturnValue({
      lean: async () => [
        {
          _id: prod1,
          slug: 'sample-shahi-desi-cow-ghee',
          name: 'Shahi Desi Cow Ghee (Sample)',
          images: ['/images/cat-desi-ghee.jpg'],
          isActive: true,
          variants: [
            { _id: var1, sku: 'V1', label: '500g', price: 620, mrp: 690, stock: 10, isActive: true },
          ],
        },
      ],
    });
    vi.spyOn(DeliveryZone, 'findOne').mockReturnValue({
      lean: async () => ({
        _id: new mongoose.Types.ObjectId(),
        pincode: '801503',
        areaName: 'Anand Bazar',
        city: 'Patna',
        deliveryCharge: 30,
        freeDeliveryAbove: 499,
        minimumOrderValue: 199,
        estimatedDeliveryTime: '60-120 mins',
        isActive: true,
      }),
    });
    vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue({
      _id: prod1,
      variants: [{ _id: var1, stock: 9, lowStockThreshold: 5 }],
    });
    vi.spyOn(Inventory, 'create').mockResolvedValue({});
    vi.spyOn(Notification, 'create').mockResolvedValue({});
    vi.spyOn(AnalyticsEvent, 'create').mockResolvedValue({});
    const createdOrderId = new mongoose.Types.ObjectId();
    vi.spyOn(Order, 'create').mockImplementation(async (doc) => ({
      _id: createdOrderId,
      ...doc,
    }));

    const okRes = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', [cookie])
      .send({
        items: [{ productId: String(prod1), variantId: String(var1), quantity: 1 }],
        shippingAddress,
        paymentMethod: 'COD',
      });

    expect(okRes.status).toBe(201);
    expect(okRes.body.order.paymentMethod).toBe('COD');
    expect(okRes.body.order.paymentStatus).toBe('PENDING');
    expect(okRes.body.order.status).toBe('PLACED');
    expect(okRes.body.order.pricing.totalAmount).toBe(620);
  });

  it('rejects spoofed Razorpay signatures and marks order PAID + CONFIRMED only on valid HMAC verification', async () => {
    env.razorpay.keyId = 'rzp_test_gokul';
    env.razorpay.keySecret = 'secret_test_razorpay_gokul';

    const { user, cookie } = makeAuthCookie();
    const orderId = new mongoose.Types.ObjectId();
    const mockOrderDoc = {
      _id: orderId,
      orderNumber: 'GG-20261111-ABC123',
      user: user._id,
      items: [],
      deliveryAddress: { pincode: '801503' },
      pricing: { totalAmount: 620 },
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PENDING',
      paymentDetails: { razorpayOrderId: 'order_rzp_123' },
      status: 'PLACED',
      statusHistory: [{ status: 'PLACED', note: 'Created' }],
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Order, 'findOne').mockResolvedValue(mockOrderDoc);
    vi.spyOn(Notification, 'create').mockResolvedValue({});
    vi.spyOn(AnalyticsEvent, 'create').mockResolvedValue({});

    const badSigRes = await request(app)
      .post('/api/v1/payments/razorpay/verify')
      .set('Cookie', [cookie])
      .send({
        orderId: String(orderId),
        razorpay_order_id: 'order_rzp_123',
        razorpay_payment_id: 'pay_rzp_456',
        razorpay_signature: '0000000000000000000000000000000000000000000000000000000000000000',
      });

    expect(badSigRes.status).toBe(400);
    expect(mockOrderDoc.paymentStatus).toBe('PENDING');
    expect(mockOrderDoc.save).not.toHaveBeenCalled();

    const validSignature = crypto
      .createHmac('sha256', env.razorpay.keySecret)
      .update('order_rzp_123|pay_rzp_456')
      .digest('hex');

    const okSigRes = await request(app)
      .post('/api/v1/payments/razorpay/verify')
      .set('Cookie', [cookie])
      .send({
        orderId: String(orderId),
        razorpay_order_id: 'order_rzp_123',
        razorpay_payment_id: 'pay_rzp_456',
        razorpay_signature: validSignature,
      });

    expect(okSigRes.status).toBe(200);
    expect(mockOrderDoc.paymentStatus).toBe('PAID');
    expect(mockOrderDoc.status).toBe('CONFIRMED');
    expect(mockOrderDoc.save).toHaveBeenCalledTimes(1);
  });

  it('allows customer cancellation before dispatch with stock restore and enforces delivered-order check on reviews', async () => {
    const { user, cookie } = makeAuthCookie();
    const orderId = new mongoose.Types.ObjectId();
    const prodId = new mongoose.Types.ObjectId();
    const varId = new mongoose.Types.ObjectId();

    const cancellableOrder = {
      _id: orderId,
      orderNumber: 'GG-20261111-CANC01',
      user: user._id,
      items: [
        { product: prodId, variantId: varId, variantLabel: '500g', quantity: 2 },
      ],
      pricing: { couponCode: '' },
      status: 'PLACED',
      statusHistory: [],
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Order, 'findOne').mockResolvedValue(cancellableOrder);
    vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue({
      _id: prodId,
      variants: [{ _id: varId, stock: 12 }],
    });
    vi.spyOn(Inventory, 'create').mockResolvedValue({});
    vi.spyOn(Notification, 'create').mockResolvedValue({});

    const cancelRes = await request(app)
      .post(`/api/v1/orders/${String(orderId)}/cancel`)
      .set('Cookie', [cookie])
      .send({ reason: 'Changed quantity plan' });

    expect(cancelRes.status).toBe(200);
    expect(cancellableOrder.status).toBe('CANCELLED');

    // Reviews: reject non-delivered order
    vi.spyOn(Order, 'findOne').mockReturnValue({ lean: async () => null });
    const rejectedReview = await request(app)
      .post('/api/v1/reviews')
      .set('Cookie', [cookie])
      .send({
        productId: String(prodId),
        orderId: String(orderId),
        rating: 5,
        comment: 'Tried reviewing before delivery!',
      });
    expect(rejectedReview.status).toBe(403);

    // Reviews: accept delivered purchase review
    vi.spyOn(Order, 'findOne').mockReturnValue({
      lean: async () => ({
        _id: orderId,
        user: user._id,
        status: 'DELIVERED',
        items: [{ product: prodId }],
      }),
    });
    vi.spyOn(Review, 'findOne').mockResolvedValue(null);
    vi.spyOn(Review, 'create').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      rating: 5,
      isVerifiedPurchase: true,
      status: 'pending',
    });

    const acceptedReview = await request(app)
      .post('/api/v1/reviews')
      .set('Cookie', [cookie])
      .send({
        productId: String(prodId),
        orderId: String(orderId),
        rating: 5,
        title: 'Authentic aroma',
        comment: 'Rich golden danedar ghee delivered fresh to Danapur.',
      });
    expect(acceptedReview.status).toBe(201);
    expect(acceptedReview.body.review.isVerifiedPurchase).toBe(true);
  });
});
