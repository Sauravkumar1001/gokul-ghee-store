import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';

function renderRoute(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('Phase 4 Checkout, Pincode Delivery Check, COD Order & Cancellation Flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('validates 6-digit pincode delivery availability on /cart cleanly', async () => {
    const user = userEvent.setup();
    vi.spyOn(orderService, 'checkPincode').mockResolvedValue({
      ok: true,
      data: {
        serviceable: true,
        pincode: '801503',
        deliveryCharge: 0,
        minimumOrderValue: 199,
        estimatedDeliveryTime: 'Same-day dispatch',
        message: 'Delivery available to Anand Bazar & Danapur Cantonment, Patna.',
      },
    });

    renderRoute('/product/sample-shahi-desi-cow-ghee');
    await user.click(screen.getByRole('button', { name: /Add to Cart/i }));
    const drawer = screen.getByRole('dialog', { name: /Shopping Cart Drawer/i });
    await user.click(within(drawer).getByRole('link', { name: /View Cart/i }));

    const pinInput = screen.getByLabelText(/Delivery pincode/i);
    await user.clear(pinInput);
    await user.type(pinInput, '801503');
    await user.click(screen.getByRole('button', { name: /^Check$/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      /Anand Bazar & Danapur Cantonment/i
    );
  });

  it('shows empty cart notice cleanly when visiting /checkout directly with an empty cart', () => {
    renderRoute('/checkout');
    expect(screen.getByRole('heading', { name: /Your Cart Is Empty/i })).toBeInTheDocument();
  });

  it('redirects unauthenticated customer through /login?next=/checkout, places a COD order, and supports cancellation on /account/orders/:id', async () => {
    const user = userEvent.setup();

    vi.spyOn(orderService, 'getPaymentConfig').mockResolvedValue({
      ok: true,
      data: { razorpayEnabled: false, keyId: null, codEnabled: true },
    });
    vi.spyOn(orderService, 'getAddresses').mockResolvedValue({
      ok: true,
      data: { addresses: [] },
    });
    vi.spyOn(orderService, 'getNotifications').mockResolvedValue({
      ok: true,
      data: { notifications: [] },
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
          pricing: {
            subtotal: 325,
            discountAmount: 0,
            deliveryCharge: 30,
            totalAmount: 355,
            couponCode: '',
          },
        },
      },
    });

    vi.spyOn(authService, 'login').mockResolvedValue({
      ok: true,
      data: {
        user: {
          _id: 'user-1',
          name: 'Anil Customer',
          email: 'customer@gokulghee.in',
          phone: '+91 89863 65592',
        },
      },
    });

    const placedOrderDoc = {
      _id: 'order-123',
      orderNumber: 'GG-20261111-TEST01',
      status: 'PLACED',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      items: [
        {
          product: 'prod-1',
          variantId: 'var-1',
          name: 'Shahi Desi Cow Ghee (Sample)',
          variantLabel: '250g Sample Pack',
          unitPrice: 325,
          quantity: 1,
          lineTotal: 325,
          image: '/images/cat-desi-ghee.jpg',
        },
      ],
      deliveryAddress: {
        recipientName: 'Anil Customer',
        phone: '+91 89863 65592',
        houseNumber: 'Plot 8',
        street: 'Math Road, Anand Bazar',
        landmark: 'Near Hindu Society Mandir',
        city: 'Patna',
        state: 'Bihar',
        pincode: '801503',
      },
      deliveryMeta: {
        zoneName: 'Anand Bazar & Danapur Cantonment',
        estimatedDeliveryTime: 'Same-day dispatch',
      },
      pricing: {
        subtotal: 325,
        discountAmount: 0,
        deliveryCharge: 30,
        totalAmount: 355,
        couponCode: '',
      },
      statusHistory: [
        { status: 'PLACED', note: 'Order placed with Cash on Delivery.', changedAt: new Date().toISOString() },
      ],
    };

    vi.spyOn(orderService, 'placeOrder').mockResolvedValue({
      ok: true,
      data: { order: placedOrderDoc, razorpayOrder: null },
    });
    vi.spyOn(orderService, 'getOrderById').mockResolvedValue({
      ok: true,
      data: { order: placedOrderDoc },
    });
    vi.spyOn(orderService, 'getMyReviews').mockResolvedValue({
      ok: true,
      data: { reviews: [] },
    });
    vi.spyOn(orderService, 'cancelOrder').mockResolvedValue({
      ok: true,
      data: {
        message: 'Order #GG-20261111-TEST01 cancelled cleanly and stock restored.',
        order: { ...placedOrderDoc, status: 'CANCELLED', cancellationReason: 'Cancelled by customer' },
      },
    });

    // 1. Add product and visit /checkout
    renderRoute('/product/sample-shahi-desi-cow-ghee');
    await user.click(screen.getByRole('button', { name: /Add to Cart/i }));
    const drawer = screen.getByRole('dialog', { name: /Shopping Cart Drawer/i });
    await user.click(within(drawer).getByRole('link', { name: /^Checkout$/i }));

    expect(
      screen.getByText(/Sign In Required to Place & Track Real Orders/i)
    ).toBeInTheDocument();

    // 2. Sign in cleanly and bounce straight back to /checkout
    const signInBannerLink = screen
      .getAllByRole('link', { name: /^Sign In$/i })
      .find((el) => el.getAttribute('href') === '/login?next=/checkout');
    await user.click(signInBannerLink);

    await user.type(screen.getByLabelText(/Email Address/i), 'customer@gokulghee.in');
    await user.type(screen.getByPlaceholderText(/Enter your password/i), 'StrongPass123');
    await user.click(screen.getByRole('button', { name: /^Sign In$/i }));

    // 3. Back on /checkout: fill missing address fields and place COD order
    expect(
      await screen.findByRole('heading', { name: /Complete Your Order/i })
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/House \/ Flat \/ Shop No\./i), 'Plot 8');
    await user.type(screen.getByLabelText(/Street \/ Mohalla \/ Locality/i), 'Math Road, Anand Bazar');
    await user.click(
      screen.getByRole('button', { name: /Place Order \(Cash on Delivery\)/i })
    );

    // 4. Navigated to live Order Receipt with friendly COD confirmation
    expect(
      await screen.findByText(/Order #GG-20261111-TEST01 Confirmed!/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cash on Delivery — pay in cash or UPI upon delivery/i)
    ).toBeInTheDocument();

    // 5. Cancel order cleanly
    await user.click(screen.getByRole('button', { name: /Cancel Order/i }));
    expect(await screen.findByText(/Order CANCELLED/i)).toBeInTheDocument();
  });
});
