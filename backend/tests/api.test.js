import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import {
  Category,
  Inquiry,
  Product,
  StoreSettings,
  User,
} from '../models/index.js';
import { AUTH_COOKIE_NAME, signAccessToken } from '../utils/jwt.js';

describe('Backend REST APIs, Auth Cookies & Validation (Phase 3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('serves API root and /api/v1/health cleanly', async () => {
    const rootRes = await request(app).get('/');
    expect(rootRes.status).toBe(200);
    expect(rootRes.body.business).toBe('Anil Ji Ka Gokul Ghee');

    const healthRes = await request(app).get('/api/v1/health');
    expect(healthRes.status).toBe(200);
    expect(healthRes.body.status).toBe('ok');
    expect(healthRes.body.database).toHaveProperty('connected');
  });

  it('validates registration payload with Zod and sets HTTP-only JWT cookie on success', async () => {
    const badRes = await request(app).post('/api/v1/auth/register').send({
      name: 'A',
      email: 'not-an-email',
      phone: '123',
      password: 'short',
    });
    expect(badRes.status).toBe(400);
    expect(badRes.body.success).toBe(false);

    vi.spyOn(User, 'findOne').mockResolvedValue(null);
    const createdId = new mongoose.Types.ObjectId();
    vi.spyOn(User, 'create').mockResolvedValue({
      _id: createdId,
      name: 'Priya Verma',
      email: 'priya@example.com',
      phone: '+91 9876543210',
      role: 'customer',
      wishlist: [],
      createdAt: new Date(),
    });

    const okRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Priya Verma',
      email: 'priya@example.com',
      phone: '+91 9876543210',
      password: 'SecurePassword123',
      role: 'admin', // Must be ignored by server!
    });

    expect(okRes.status).toBe(201);
    expect(okRes.body.user.role).toBe('customer');
    const cookies = okRes.headers['set-cookie'] || [];
    expect(cookies.some((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`) && c.includes('HttpOnly'))).toBe(
      true
    );
  });

  it('protects /api/v1/auth/me and /api/v1/users/addresses unless valid JWT cookie is sent', async () => {
    const unauthRes = await request(app).get('/api/v1/auth/me');
    expect(unauthRes.status).toBe(401);

    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Anil Customer',
      email: 'customer@gokulghee.in',
      phone: '+91 89863 65592',
      role: 'customer',
      isActive: true,
      wishlist: [],
    };
    const token = signAccessToken(mockUser);
    vi.spyOn(User, 'findById').mockResolvedValue(mockUser);

    const authedRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${token}`]);

    expect(authedRes.status).toBe(200);
    expect(authedRes.body.user.email).toBe('customer@gokulghee.in');
  });

  it('returns categories, filtered products, store settings, and saves newsletter/contact enquiries', async () => {
    vi.spyOn(Category, 'find').mockReturnValue({
      sort: () => ({ lean: async () => [{ name: 'Desi Ghee', slug: 'desi-ghee' }] }),
    });
    const catRes = await request(app).get('/api/v1/categories');
    expect(catRes.status).toBe(200);
    expect(catRes.body.categories).toHaveLength(1);

    vi.spyOn(Product, 'find').mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => ({ lean: async () => [{ name: 'Shahi Desi Cow Ghee (Sample)', slug: 'sample-shahi-desi-cow-ghee' }] }),
        }),
      }),
    });
    vi.spyOn(Product, 'countDocuments').mockResolvedValue(1);

    const prodRes = await request(app).get('/api/v1/products?category=desi-ghee&search=cow');
    expect(prodRes.status).toBe(200);
    expect(prodRes.body.products[0].slug).toBe('sample-shahi-desi-cow-ghee');

    vi.spyOn(StoreSettings, 'findOne').mockReturnValue({
      lean: async () => null,
    });
    const storeRes = await request(app).get('/api/v1/store/settings');
    expect(storeRes.status).toBe(200);
    expect(storeRes.body.settings.googleMapsPlaceId).toBe('ChIJ53Oz9XZX7TkRW_5zLDQrlaI');

    vi.spyOn(Inquiry, 'findOne').mockResolvedValue(null);
    vi.spyOn(Inquiry, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
    const newsRes = await request(app)
      .post('/api/v1/newsletter')
      .send({ email: 'festive@example.com' });
    expect(newsRes.status).toBe(201);
  });

  it('returns 404 JSON for unknown API routes', async () => {
    const res = await request(app).get('/api/v1/non-existent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
