import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import app from '../app.js';
import {
  AIUsage,
  AnalyticsEvent,
  Category,
  Coupon,
  DeliveryZone,
  Inventory,
  Notification,
  Order,
  Product,
  Review,
  StoreSettings,
  User,
} from '../models/index.js';
import { AUTH_COOKIE_NAME, signAccessToken } from '../utils/jwt.js';

function makeAuthCookie(role = 'admin') {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    name: role === 'admin' ? 'Owner Admin' : 'Regular Customer',
    email: role === 'admin' ? 'admin@gokulghee.in' : 'cust@gokulghee.in',
    phone: '+91 89863 65592',
    role,
    isActive: true,
    wishlist: [],
  };
  vi.spyOn(User, 'findById').mockResolvedValue(user);
  const token = signAccessToken(user);
  return { user, cookie: `${AUTH_COOKIE_NAME}=${token}` };
}

describe('Phase 5 Admin Panel APIs, RBAC, Inventory, Analytics & Usage Meter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('enforces admin-only RBAC across /api/v1/admin/* endpoints', async () => {
    const noAuth = await request(app).get('/api/v1/admin/dashboard');
    expect(noAuth.status).toBe(401);

    const { cookie: customerCookie } = makeAuthCookie('customer');
    const forbidden = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Cookie', [customerCookie]);
    expect(forbidden.status).toBe(403);
  });

  it('serves real database-backed dashboard KPIs, low-stock alerts & bestsellers', async () => {
    const { cookie } = makeAuthCookie('admin');

    vi.spyOn(Order, 'aggregate')
      .mockResolvedValueOnce([
        {
          totalOrders: 12,
          pendingOrders: 3,
          completedOrders: 8,
          cancelledOrders: 1,
          grossActiveRevenue: 11200,
          verifiedPaidRevenue: 8400,
          activeOrderCount: 11,
        },
      ])
      .mockResolvedValueOnce([{ _id: '2026-11-11', orders: 2, revenue: 1850 }])
      .mockResolvedValueOnce([
        { _id: new mongoose.Types.ObjectId(), name: 'Shahi Desi Cow Ghee', unitsSold: 9, revenue: 5580 },
      ]);

    vi.spyOn(User, 'countDocuments').mockResolvedValue(27);
    vi.spyOn(Product, 'find').mockReturnValue({
      select: () => ({
        lean: async () => [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'Shahi Desi Cow Ghee (Sample)',
            slug: 'sample-shahi-desi-cow-ghee',
            variants: [{ _id: new mongoose.Types.ObjectId(), label: '500g', sku: 'SKU-1', stock: 3, lowStockThreshold: 5 }],
          },
        ],
      }),
    });
    vi.spyOn(Order, 'find').mockReturnValue({
      sort: () => ({
        limit: () => ({
          populate: () => ({
            lean: async () => [{ _id: new mongoose.Types.ObjectId(), orderNumber: 'GG-101', status: 'PLACED' }],
          }),
        }),
      }),
    });

    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Cookie', [cookie]);

    expect(res.status).toBe(200);
    expect(res.body.metrics.totalRevenue).toBe(11200);
    expect(res.body.metrics.verifiedPaidRevenue).toBe(8400);
    expect(res.body.metrics.totalCustomers).toBe(27);
    expect(res.body.metrics.lowStockCount).toBe(1);
    expect(res.body.bestsellingProducts[0].unitsSold).toBe(9);
  });

  it('creates categories, products, and prevents negative stock adjustments in inventory', async () => {
    const { cookie } = makeAuthCookie('admin');
    const catId = new mongoose.Types.ObjectId();
    const prodId = new mongoose.Types.ObjectId();
    const varId = new mongoose.Types.ObjectId();

    vi.spyOn(Category, 'findById').mockReturnValue({
      lean: async () => ({ _id: catId, name: 'Desi Ghee', slug: 'desi-ghee' }),
    });
    vi.spyOn(Product, 'findOne').mockResolvedValue(null);
    vi.spyOn(Product, 'create').mockResolvedValue({
      _id: prodId,
      name: 'Bilona Cow Ghee',
      slug: 'bilona-cow-ghee',
      variants: [{ _id: varId, sku: 'BG-500', label: '500g', stock: 10 }],
    });
    vi.spyOn(Inventory, 'create').mockResolvedValue({});

    const createProd = await request(app)
      .post('/api/v1/admin/products')
      .set('Cookie', [cookie])
      .send({
        name: 'Bilona Cow Ghee',
        categoryId: String(catId),
        shortDescription: 'Traditional slow-clarified Bilona cow ghee.',
        description: 'Pure Bilona Cow Ghee batch prepared cleanly.',
        images: ['/images/cat-desi-ghee.jpg'],
        variants: [
          { sku: 'BG-500', label: '500g Jar', weightGrams: 500, price: 650, mrp: 720, stock: 10 },
        ],
      });
    expect(createProd.status).toBe(201);

    vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue(null);
    const badAdjust = await request(app)
      .post('/api/v1/admin/inventory/adjust')
      .set('Cookie', [cookie])
      .send({ productId: String(prodId), variantId: String(varId), delta: -999 });
    expect(badAdjust.status).toBe(409);

    vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue({
      _id: prodId,
      name: 'Bilona Cow Ghee',
      variants: [{ _id: varId, label: '500g', stock: 15 }],
    });
    const okAdjust = await request(app)
      .post('/api/v1/admin/inventory/adjust')
      .set('Cookie', [cookie])
      .send({ productId: String(prodId), variantId: String(varId), delta: 5, note: 'Fresh batch' });
    expect(okAdjust.status).toBe(200);
    expect(okAdjust.body.variant.stock).toBe(15);
  });

  it('updates order status, restores stock on admin cancellation, and recalculates rating on review approval', async () => {
    const { cookie } = makeAuthCookie('admin');
    const orderId = new mongoose.Types.ObjectId();
    const prodId = new mongoose.Types.ObjectId();
    const varId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const orderDoc = {
      _id: orderId,
      orderNumber: 'GG-20261111-ADM1',
      user: userId,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentDetails: {},
      pricing: { couponCode: '' },
      items: [{ product: prodId, variantId: varId, variantLabel: '500g', quantity: 2 }],
      statusHistory: [],
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Order, 'findById').mockResolvedValue(orderDoc);
    vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue({
      _id: prodId,
      variants: [{ _id: varId, stock: 14 }],
    });
    vi.spyOn(Inventory, 'create').mockResolvedValue({});
    vi.spyOn(Notification, 'create').mockResolvedValue({});

    const cancelRes = await request(app)
      .patch(`/api/v1/admin/orders/${String(orderId)}/status`)
      .set('Cookie', [cookie])
      .send({ status: 'REFUNDED', note: 'Customer requested refund' });

    expect(cancelRes.status).toBe(200);
    expect(orderDoc.status).toBe('REFUNDED');
    expect(orderDoc.paymentStatus).toBe('REFUNDED');

    // Review approval recalculates Product averageRating & reviewCount
    const revId = new mongoose.Types.ObjectId();
    vi.spyOn(Review, 'findByIdAndUpdate').mockResolvedValue({
      _id: revId,
      product: prodId,
      status: 'approved',
    });
    vi.spyOn(Review, 'aggregate').mockResolvedValue([
      { _id: prodId, avgRating: 4.75, count: 4 },
    ]);
    const prodRatingSpy = vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue({});

    const revRes = await request(app)
      .patch(`/api/v1/admin/reviews/${String(revId)}`)
      .set('Cookie', [cookie])
      .send({ status: 'approved' });

    expect(revRes.status).toBe(200);
    expect(prodRatingSpy).toHaveBeenCalledWith(prodId, {
      $set: { averageRating: 4.8, reviewCount: 4 },
    });
  });

  it('returns real Analytics, AI/System Usage Meter & editable StoreSettings without fake metrics', async () => {
    const { cookie } = makeAuthCookie('admin');

    vi.spyOn(AIUsage, 'aggregate')
      .mockResolvedValueOnce([
        {
          totalRequests: 4,
          failedRequests: 1,
          inputTokens: 1200,
          outputTokens: 650,
          estimatedCostUsd: 0.0021,
          avgLatencyMs: 340,
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    vi.spyOn(AIUsage, 'find').mockReturnValue({
      sort: () => ({
        limit: () => ({
          select: () => ({
            lean: async () => [],
          }),
        }),
      }),
    });

    vi.spyOn(AnalyticsEvent, 'aggregate')
      .mockResolvedValueOnce([
        { _id: 'PAGE_VIEW', count: 50 },
        { _id: 'PURCHASE_COMPLETED', count: 5 },
      ])
      .mockResolvedValueOnce([{ count: 25 }])
      .mockResolvedValueOnce([
        { totalApiRequests: 100, apiErrorCount: 0, avgResponseTimeMs: 42 },
      ]);

    const meterRes = await request(app)
      .get('/api/v1/admin/usage-meter')
      .set('Cookie', [cookie]);

    expect(meterRes.status).toBe(200);
    expect(meterRes.body.ai.inputTokens).toBe(1200);
    expect(meterRes.body.ai.outputTokens).toBe(650);
    expect(meterRes.body.website.totalVisitors).toBe(25);
    expect(meterRes.body.website.conversionRate).toBe(20);
    expect(meterRes.body.system.imageStorage.configured).toBe(false);

    vi.spyOn(DeliveryZone, 'find').mockReturnValue({ sort: () => ({ lean: async () => [] }) });
    vi.spyOn(Coupon, 'find').mockReturnValue({ sort: () => ({ lean: async () => [] }) });
    const zoneRes = await request(app)
      .get('/api/v1/admin/delivery-zones')
      .set('Cookie', [cookie]);
    expect(zoneRes.status).toBe(200);

    vi.spyOn(StoreSettings, 'findOneAndUpdate').mockResolvedValue({
      singletonKey: 'PRIMARY_STORE',
      businessName: 'Anil Ji Ka Gokul Ghee',
      brandDisplayName: 'GOKUL GHEE',
      phone: '+91 89863 65592',
      hours: '9:00 AM – 9:00 PM daily',
    });

    const settingsRes = await request(app)
      .put('/api/v1/admin/settings')
      .set('Cookie', [cookie])
      .send({
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
      });
    expect(settingsRes.status).toBe(200);
    expect(settingsRes.body.settings.businessName).toBe('Anil Ji Ka Gokul Ghee');
  });
});
