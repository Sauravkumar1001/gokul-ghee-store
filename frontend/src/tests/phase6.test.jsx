import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { gokulAiClient } from '../services/gokulAiClient';
import { mapsService } from '../services/mapsService';
import { orderService } from '../services/orderService';
import * as socketClient from '../services/socketClient';

function renderRoute(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('Phase 6 Google Maps Address Picker, Live Gemini AI & Socket.IO Updates', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('captures current GPS location and address search on /checkout cleanly without confusing store location', async () => {
    const user = userEvent.setup();

    vi.spyOn(orderService, 'getPaymentConfig').mockResolvedValue({
      ok: true,
      data: { razorpayEnabled: false, keyId: null, codEnabled: true },
    });
    vi.spyOn(orderService, 'getCheckoutQuote').mockResolvedValue({
      ok: true,
      data: {
        quote: {
          delivery: {
            serviceable: true,
            meetsMinimumOrder: true,
            estimatedDeliveryTime: 'Same-day dispatch',
            message: 'Delivery available to Anand Bazar, Patna.',
          },
          coupon: { applied: false, code: '', discountAmount: 0 },
          pricing: { subtotal: 325, discountAmount: 0, deliveryCharge: 0, totalAmount: 325 },
        },
      },
    });
    vi.spyOn(mapsService, 'geocodeAddress').mockResolvedValue({
      ok: true,
      data: {
        source: 'google_maps_api',
        address: {
          formattedAddress: '14 Math Rd, Anand Bazar, Danapur, Patna 801503',
          houseNumber: '14',
          street: 'Math Road, Anand Bazar',
          landmark: 'Near Shiv Mandir',
          city: 'Patna',
          state: 'Bihar',
          pincode: '801503',
          coordinates: { lat: 25.635, lng: 85.041 },
        },
        message: 'Pin resolved (801503) — delivery serviceable in Anand Bazar.',
      },
    });

    // Mock navigator.geolocation cleanly
    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success) =>
          success({ coords: { latitude: 25.635, longitude: 85.041 } }),
      },
    });

    // Add an item first to open /checkout with items in cart
    renderRoute('/product/sample-shahi-desi-cow-ghee');
    await user.click(screen.getByRole('button', { name: /Add to Cart/i }));
    const drawer = screen.getByRole('dialog', { name: /Shopping Cart Drawer/i });
    await user.click(within(drawer).getByRole('link', { name: /^Checkout$/i }));

    await user.click(await screen.findByRole('button', { name: /Use Current Location/i }));

    expect(
      await screen.findByText(/Pin resolved \(801503\) — delivery serviceable in Anand Bazar\./i)
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Math Road, Anand Bazar')).toBeInTheDocument();
    expect(screen.getByText(/Customer delivery pin set: 25\.63500, 85\.04100/i)).toBeInTheDocument();
  });

  it('displays official Store Place ID and Google Places verification badge on /contact', async () => {
    vi.spyOn(mapsService, 'getStorePlace').mockResolvedValue({
      ok: true,
      data: {
        resolvedFromPlacesApi: true,
        placeId: 'ChIJ53Oz9XZX7TkRW_5zLDQrlaI',
        store: {
          businessName: 'Anil Ji Ka Gokul Ghee',
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
          },
        },
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination_place_id=ChIJ53Oz9XZX7TkRW_5zLDQrlaI',
        placeSearchUrl: 'https://www.google.com/maps/search/?api=1&query_place_id=ChIJ53Oz9XZX7TkRW_5zLDQrlaI',
      },
    });

    renderRoute('/contact');

    expect(await screen.findByText(/Google Places Verified/i)).toBeInTheDocument();
    expect(screen.getByText(/Place ID: ChIJ53Oz9XZX7TkRW_5zLDQrlaI/i)).toBeInTheDocument();
  });

  it('connects floating GOKUL AI widget to backend Gemini service cleanly and displays real product card', async () => {
    const user = userEvent.setup();

    vi.spyOn(gokulAiClient, 'fetchHistory').mockResolvedValue({ ok: true, messages: [] });
    const sendSpy = vi.spyOn(gokulAiClient, 'sendMessage').mockResolvedValue({
      ok: true,
      sessionId: 'gg-ai-test-01',
      reply: {
        source: 'gemini',
        text: 'Namaste! Try our pure Shahi Desi Cow Ghee (500ml) or 801503 same-day local delivery.',
        recommendations: [
          {
            product: {
              _id: 'prod-1',
              slug: 'sample-shahi-desi-cow-ghee',
              name: 'Shahi Desi Cow Ghee',
              categoryName: 'Desi Ghee',
              images: ['/images/gokul_desi_ghee_jar.jpg'],
            },
            variant: {
              id: 'var-500ml',
              label: '500ml Glass Jar',
              price: 650,
              mrp: 700,
              stock: 8,
            },
          },
        ],
        actionLink: { label: 'Explore Store Catalog', to: '/shop' },
      },
    });

    renderRoute('/');

    await user.click(screen.getByRole('button', { name: /Open GOKUL AI Assistant/i }));
    const assistant = screen.getByRole('region', { name: /GOKUL AI Shopping Assistant/i });

    await user.type(
      within(assistant).getByLabelText(/Ask GOKUL AI/i),
      'Suggest pure bilona cow ghee'
    );
    await user.click(within(assistant).getByRole('button', { name: /Send message/i }));

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(await within(assistant).findByText(/Gemini AI • Live DB/i)).toBeInTheDocument();
    expect(
      within(assistant).getByRole('link', { name: /Shahi Desi Cow Ghee/i })
    ).toBeInTheDocument();
  });

  it('wires Socket.IO order listener contract cleanly with subscribe/cleanup handlers', () => {
    const mockHandlers = {};
    const emitSpy = vi.fn();
    const offSpy = vi.fn();
    const connectSpy = vi.fn();

    const fakeSocket = {
      connected: true,
      connect: connectSpy,
      emit: emitSpy,
      on: (eventName, fn) => {
        mockHandlers[eventName] = fn;
      },
      off: offSpy,
    };

    const onUpdatedSpy = vi.fn();
    const cleanup = socketClient.subscribeToOrderEvents({
      enabled: true,
      orderId: 'order-900',
      onOrderUpdated: onUpdatedSpy,
      socketFactory: () => fakeSocket,
    });

    expect(emitSpy).toHaveBeenCalledWith('order:subscribe', { orderId: 'order-900' });

    mockHandlers['order:updated']({
      orderId: 'order-900',
      orderNumber: 'GG-20261111-900',
      status: 'OUT FOR DELIVERY',
    });

    expect(onUpdatedSpy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'OUT FOR DELIVERY' })
    );

    cleanup();
    expect(offSpy).toHaveBeenCalledWith('order:updated', onUpdatedSpy);
  });
});
