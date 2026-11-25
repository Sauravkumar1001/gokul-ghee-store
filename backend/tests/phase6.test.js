import http from 'node:http';
import request from 'supertest';
import { io as createSocketClient } from 'socket.io-client';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import app from '../app.js';
import { env } from '../config/env.js';
import { initSocketServer } from '../config/socket.js';
import { AIUsage } from '../models/AIUsage.js';
import { Category } from '../models/Category.js';
import { Conversation } from '../models/Conversation.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { User } from '../models/User.js';
import { signAccessToken } from '../utils/jwt.js';

describe('Phase 6 Maps Geocoding, GOKUL AI (Gemini + Grounding) & Socket.IO Real-Time Orders', () => {
  const originalGeminiKey = env.geminiApiKey;
  const originalMapsKey = env.googleMapsServerApiKey;

  afterEach(() => {
    vi.restoreAllMocks();
    env.geminiApiKey = originalGeminiKey;
    env.googleMapsServerApiKey = originalMapsKey;
  });

  afterAll(() => {
    env.geminiApiKey = originalGeminiKey;
    env.googleMapsServerApiKey = originalMapsKey;
  });

  it('resolves official Store Place ID fallback safely and calls Google Places API cleanly when key is configured', async () => {
    vi.spyOn(StoreSettings, 'findOne').mockReturnValue({
      lean: async () => null,
    });

    env.googleMapsServerApiKey = '';
    const resFallback = await request(app).get('/api/v1/maps/store-place');
    expect(resFallback.status).toBe(200);
    expect(resFallback.body.resolvedFromPlacesApi).toBe(false);
    expect(resFallback.body.placeId).toBe('ChIJ53Oz9XZX7TkRW_5zLDQrlaI');
    expect(resFallback.body.coordinates).toBeNull();
    expect(resFallback.body.directionsUrl).toContain('ChIJ53Oz9XZX7TkRW_5zLDQrlaI');

    env.googleMapsServerApiKey = 'fake-server-maps-key';
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'OK',
        result: {
          name: 'Anil Ji Ka Gokul Ghee',
          formatted_address: 'Math Rd, Anand Bazar, Danapur Cantonment, Patna, Bihar 801503',
          geometry: { location: { lat: 25.635, lng: 85.041 } },
          url: 'https://maps.google.com/?cid=12345',
          business_status: 'OPERATIONAL',
        },
      }),
    });

    const resLive = await request(app).get('/api/v1/maps/store-place');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(resLive.status).toBe(200);
    expect(resLive.body.resolvedFromPlacesApi).toBe(true);
    expect(resLive.body.coordinates).toEqual({ lat: 25.635, lng: 85.041 });
  });

  it('geocodes customer addresses using DeliveryZone pincode fallback and Google Geocoding JSON parsing', async () => {
    vi.spyOn(DeliveryZone, 'findOne').mockReturnValue({
      lean: async () => ({
        pincode: '801503',
        areaName: 'Anand Bazar & Danapur Cantonment',
        city: 'Patna',
        state: 'Bihar',
        deliveryCharge: 0,
        minimumOrderValue: 199,
        estimatedDeliveryTime: 'Same-day dispatch',
      }),
    });

    env.googleMapsServerApiKey = '';
    const fallbackRes = await request(app)
      .post('/api/v1/maps/geocode')
      .send({ query: 'Math Road 801503' });

    expect(fallbackRes.status).toBe(200);
    expect(fallbackRes.body.source).toBe('fallback');
    expect(fallbackRes.body.address.pincode).toBe('801503');
    expect(fallbackRes.body.deliveryZone.areaName).toContain('Danapur');

    env.googleMapsServerApiKey = 'fake-server-maps-key';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'OK',
        results: [
          {
            formatted_address: '14 Math Rd, Anand Bazar, Danapur, Patna, Bihar 801503, India',
            geometry: { location: { lat: 25.6349, lng: 85.0421 } },
            address_components: [
              { long_name: '14', types: ['street_number'] },
              { long_name: 'Math Road', types: ['route'] },
              { long_name: 'Anand Bazar', types: ['sublocality_level_1'] },
              { long_name: 'Patna', types: ['locality'] },
              { long_name: 'Bihar', types: ['administrative_area_level_1'] },
              { long_name: '801503', types: ['postal_code'] },
            ],
          },
        ],
      }),
    });

    const apiRes = await request(app)
      .post('/api/v1/maps/geocode')
      .send({ lat: 25.6349, lng: 85.0421 });

    expect(apiRes.status).toBe(200);
    expect(apiRes.body.source).toBe('google_maps_api');
    expect(apiRes.body.address.street).toBe('Math Road, Anand Bazar');
    expect(apiRes.body.address.pincode).toBe('801503');
    expect(apiRes.body.address.coordinates).toEqual({ lat: 25.6349, lng: 85.0421 });
  });

  it('runs catalog-grounded GOKUL AI fallback for Hindi/Hinglish budget & pincode queries and logs unconfigured AIUsage honestly', async () => {
    vi.spyOn(StoreSettings, 'findOne').mockReturnValue({ lean: async () => null });
    vi.spyOn(Category, 'find').mockReturnValue({
      sort: () => ({ select: () => ({ lean: async () => [{ name: 'Mithai', slug: 'mithai' }] }) }),
    });
    vi.spyOn(Product, 'find').mockReturnValue({
      populate: () => ({
        sort: () => ({
          lean: async () => [
            {
              _id: 'prod-1',
              name: 'Desi Ghee Besan Laddoo',
              slug: 'desi-ghee-besan-laddoo',
              category: { name: 'Mithai', slug: 'mithai' },
              shortDescription: 'Roasted besan in pure desi ghee.',
              images: ['/images/laddoo.jpg'],
              isSampleData: true,
              variants: [
                { _id: 'v1', label: '500g Box', weightGrams: 500, price: 390, mrp: 420, stock: 12, isActive: true },
                { _id: 'v2', label: '1kg Box', weightGrams: 1000, price: 760, mrp: 820, stock: 8, isActive: true },
              ],
            },
          ],
        }),
      }),
    });
    vi.spyOn(DeliveryZone, 'find').mockReturnValue({
      select: () => ({
        sort: () => ({
          lean: async () => [
            {
              pincode: '801503',
              areaName: 'Anand Bazar & Danapur Cantonment',
              city: 'Patna',
              state: 'Bihar',
              deliveryCharge: 0,
              freeDeliveryAbove: 199,
              minimumOrderValue: 199,
              estimatedDeliveryTime: 'Same-day dispatch',
            },
          ],
        }),
      }),
    });
    vi.spyOn(Conversation, 'findOne').mockResolvedValue(null);
    const convSaveSpy = vi.spyOn(Conversation, 'findOneAndUpdate').mockResolvedValue({});
    const usageSpy = vi.spyOn(AIUsage, 'create').mockResolvedValue({});

    env.geminiApiKey = '';

    const budgetRes = await request(app)
      .post('/api/v1/ai/chat')
      .send({
        sessionId: 'sess-guest-001',
        message: 'Mujhe 500 rupaye ke andar kuch achhi mithai chahiye.',
      });

    expect(budgetRes.status).toBe(200);
    expect(budgetRes.body.reply.source).toBe('catalog_fallback');
    expect(budgetRes.body.reply.recommendations).toHaveLength(1);
    expect(budgetRes.body.reply.recommendations[0].variant.price).toBe(390);
    expect(usageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, inputTokens: 0, outputTokens: 0 })
    );
    expect(convSaveSpy).toHaveBeenCalledTimes(1);

    const unserviceableRes = await request(app)
      .post('/api/v1/ai/chat')
      .send({
        sessionId: 'sess-guest-001',
        message: 'Can you deliver to 999999?',
      });
    expect(unserviceableRes.status).toBe(200);
    expect(unserviceableRes.body.reply.text).toMatch(/NOT available to pincode 999999/i);

    const unauthOrderRes = await request(app)
      .post('/api/v1/ai/chat')
      .send({
        sessionId: 'sess-guest-001',
        message: 'Check my order status please',
      });
    expect(unauthOrderRes.status).toBe(200);
    expect(unauthOrderRes.body.reply.text).toMatch(/please sign in/i);
  });

  it('calls live Google Gemini API when configured, logs real token telemetry, strips hallucinated slugs, and reads authenticated customer orders', async () => {
    vi.spyOn(User, 'findById').mockResolvedValue({
      _id: 'user-99',
      role: 'customer',
      isActive: true,
      name: 'Rohan',
      email: 'rohan@example.com',
    });
    vi.spyOn(StoreSettings, 'findOne').mockReturnValue({ lean: async () => null });
    vi.spyOn(Category, 'find').mockReturnValue({
      sort: () => ({ select: () => ({ lean: async () => [{ name: 'Desi Ghee', slug: 'desi-ghee' }] }) }),
    });
    vi.spyOn(Product, 'find').mockReturnValue({
      populate: () => ({
        sort: () => ({
          lean: async () => [
            {
              _id: 'prod-ghee',
              name: 'Shahi Desi Cow Ghee',
              slug: 'shahi-desi-cow-ghee',
              category: { name: 'Desi Ghee', slug: 'desi-ghee' },
              shortDescription: 'Traditional slow-simmered bilona ghee.',
              images: ['/images/ghee.jpg'],
              variants: [{ _id: 'vg-1', label: '500ml Jar', weightGrams: 500, price: 650, mrp: 700, stock: 10, isActive: true }],
            },
          ],
        }),
      }),
    });
    vi.spyOn(DeliveryZone, 'find').mockReturnValue({
      select: () => ({ sort: () => ({ lean: async () => [] }) }),
    });
    vi.spyOn(Order, 'find').mockReturnValue({
      sort: () => ({
        limit: () => ({
          select: () => ({
            lean: async () => [
              {
                _id: 'ord-55',
                orderNumber: 'GG-20261111-AAA111',
                status: 'PREPARING',
                paymentMethod: 'COD',
                paymentStatus: 'PENDING',
                pricing: { totalAmount: 650 },
              },
            ],
          }),
        }),
      }),
    });
    vi.spyOn(Conversation, 'findOne').mockResolvedValue(null);
    vi.spyOn(Conversation, 'findOneAndUpdate').mockResolvedValue({});
    const usageSpy = vi.spyOn(AIUsage, 'create').mockResolvedValue({});

    env.geminiApiKey = 'fake-gemini-key';
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        usageMetadata: {
          promptTokenCount: 320,
          candidatesTokenCount: 85,
        },
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    replyText: 'Your order #GG-20261111-AAA111 is currently PREPARING! Try our Shahi Desi Cow Ghee too.',
                    recommendedSlugs: ['shahi-desi-cow-ghee', 'fake-hallucinated-product'],
                    actionLinkType: 'ORDERS',
                  }),
                },
              ],
            },
          },
        ],
      }),
    });

    const token = signAccessToken({ _id: 'user-99', role: 'customer', email: 'rohan@example.com' });
    const res = await request(app)
      .post('/api/v1/ai/chat')
      .set('Cookie', [`gokul_access_token=${token}`])
      .send({ sessionId: 'sess-auth-01', message: 'Where is my order and show cow ghee' });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const geminiReqBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(geminiReqBody.systemInstruction.parts[0].text).toContain('GG-20261111-AAA111');
    expect(res.status).toBe(200);
    expect(res.body.reply.source).toBe('gemini');
    expect(res.body.reply.usage).toEqual({ inputTokens: 320, outputTokens: 85 });
    // Hallucinated product slug MUST be stripped strictly
    expect(res.body.reply.recommendations).toHaveLength(1);
    expect(res.body.reply.recommendations[0].product.slug).toBe('shahi-desi-cow-ghee');
    expect(usageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        inputTokens: 320,
        outputTokens: 85,
      })
    );
  });

  it('enforces Socket.IO JWT room authorization and emits live order:updated events', async () => {
    vi.spyOn(User, 'findById').mockImplementation((id) => ({
      select: async () =>
        String(id) === 'cust-1'
          ? { _id: 'cust-1', role: 'customer', isActive: true, name: 'Cust', email: 'c@x.com' }
          : null,
    }));

    const server = http.createServer(app);
    const io = initSocketServer(server);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // 1. Unauthenticated socket is rejected
    const badClient = createSocketClient(baseUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: false,
    });
    const authErr = await new Promise((resolve) => {
      badClient.on('connect_error', (err) => resolve(err.message));
    });
    expect(authErr).toMatch(/Authentication required/i);
    badClient.close();

    // 2. Authenticated customer receives live order:updated emit for user:<id>
    const token = signAccessToken({ _id: 'cust-1', role: 'customer', email: 'c@x.com' });
    const goodClient = createSocketClient(baseUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnection: false,
    });

    await new Promise((resolve, reject) => {
      goodClient.on('connect', resolve);
      goodClient.on('connect_error', reject);
    });

    const receivedEventPromise = new Promise((resolve) => {
      goodClient.on('order:updated', resolve);
    });

    const { emitOrderLifecycleEvent } = await import('../config/socket.js');
    emitOrderLifecycleEvent('order:updated', {
      _id: 'order-live-1',
      orderNumber: 'GG-20261111-LIVE1',
      user: 'cust-1',
      status: 'OUT FOR DELIVERY',
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',
      pricing: { totalAmount: 950 },
    });

    const payload = await receivedEventPromise;
    expect(payload.orderNumber).toBe('GG-20261111-LIVE1');
    expect(payload.status).toBe('OUT FOR DELIVERY');

    goodClient.close();
    await new Promise((resolve) => io.close(resolve));
  });

  it('localizes GOKUL AI replies and action links for hi and hinglish language modes', async () => {
    vi.spyOn(StoreSettings, 'findOne').mockReturnValue({ lean: async () => null });
    vi.spyOn(Category, 'find').mockReturnValue({
      sort: () => ({ select: () => ({ lean: async () => [{ name: 'Mithai', slug: 'mithai' }] }) }),
    });
    vi.spyOn(Product, 'find').mockReturnValue({
      populate: () => ({
        sort: () => ({
          lean: async () => [
            {
              _id: 'prod-1',
              name: 'Desi Ghee Besan Laddoo',
              slug: 'desi-ghee-besan-laddoo',
              category: { name: 'Mithai', slug: 'mithai' },
              shortDescription: 'Roasted besan in pure desi ghee.',
              images: ['/images/laddoo.jpg'],
              isSampleData: true,
              variants: [
                { _id: 'v1', label: '500g Box', weightGrams: 500, price: 390, mrp: 420, stock: 12, isActive: true },
              ],
            },
          ],
        }),
      }),
    });
    vi.spyOn(DeliveryZone, 'find').mockReturnValue({
      select: () => ({
        sort: () => ({
          lean: async () => [
            {
              pincode: '801503',
              areaName: 'Anand Bazar & Danapur Cantonment',
              city: 'Patna',
              state: 'Bihar',
              deliveryCharge: 0,
              freeDeliveryAbove: 199,
              minimumOrderValue: 199,
              estimatedDeliveryTime: 'Same-day dispatch',
            },
          ],
        }),
      }),
    });
    vi.spyOn(Conversation, 'findOne').mockResolvedValue(null);
    vi.spyOn(Conversation, 'findOneAndUpdate').mockResolvedValue({});
    vi.spyOn(AIUsage, 'create').mockResolvedValue({});

    env.geminiApiKey = '';

    const hiRes = await request(app)
      .post('/api/v1/ai/chat')
      .send({
        sessionId: 'sess-lang-hi',
        message: '801503 पर डिलीवरी होगी क्या?',
        language: 'hi',
      });

    expect(hiRes.status).toBe(200);
    expect(hiRes.body.reply.text).toMatch(/जी हाँ! 801503/);
    expect(hiRes.body.reply.actionLink?.label).toBe('कार्ट और पिनकोड जाँचें');

    const hinglishRes = await request(app)
      .post('/api/v1/ai/chat')
      .send({
        sessionId: 'sess-lang-hinglish',
        message: 'Mera order status kya hai?',
        language: 'hinglish',
      });

    expect(hinglishRes.status).toBe(200);
    expect(hinglishRes.body.reply.text).toMatch(/Login karein/i);
    expect(hinglishRes.body.reply.actionLink?.label).toBe('Orders dekhne ke liye Login karein');
  });
});
