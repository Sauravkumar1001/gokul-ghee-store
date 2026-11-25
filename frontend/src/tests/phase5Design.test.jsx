import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { STORE_CONFIG } from '../config/storeConfig';
import { orderService } from '../services/orderService';

function renderRoute(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('Phase 5 Cart, Mini-Cart, Checkout & Orders Redesign', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('shows configurable free-delivery progress bar and 2-line title wrapping in mini-cart drawer', async () => {
    const user = userEvent.setup();
    renderRoute('/product/sample-shahi-desi-cow-ghee');

    await user.click(screen.getByRole('button', { name: /Add to Cart/i }));
    const drawer = screen.getByRole('dialog', { name: /Shopping Cart Drawer/i });

    expect(
      within(drawer).getByText(/Add ₹174 more for free delivery/i)
    ).toBeInTheDocument();
    expect(within(drawer).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      String(Math.round((325 / (STORE_CONFIG.freeDeliveryThreshold || 499)) * 100))
    );

    const itemTitleLinks = within(drawer).getAllByRole('link', {
      name: /Shahi Desi Cow Ghee/i,
    });
    const itemTitleLink = itemTitleLinks[itemTitleLinks.length - 1];
    expect(itemTitleLink.className).toContain('line-clamp-2');
    expect(itemTitleLink.className).not.toContain('truncate');

    // Increase quantity to cross Rs 499 threshold
    await user.click(
      within(drawer).getByRole('button', { name: /Increase quantity of Shahi Desi Cow Ghee/i })
    );
    expect(
      within(drawer).getByText(/unlocked FREE local delivery/i)
    ).toBeInTheDocument();
  });

  it('renders /cart without Kitchen Selection banner or technical wording, with sticky checkout bar on mobile', async () => {
    const user = userEvent.setup();
    renderRoute('/product/sample-shahi-desi-cow-ghee');
    await user.click(screen.getByRole('button', { name: /Add to Cart/i }));
    const drawer = screen.getByRole('dialog', { name: /Shopping Cart Drawer/i });
    await user.click(within(drawer).getByRole('link', { name: /View Cart/i }));

    expect(screen.queryByText(/Kitchen Selection/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/enforced on the backend|server-side|MongoDB|Phase \d/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Your order is confirmed by our team before dispatch/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Proceed to Checkout/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Checkout \(1\)/i })).toBeInTheDocument();

    // Floating buttons hide below desktop (lg) on /cart so mobile & tablet sticky checkout bar is unobstructed
    expect(screen.getByRole('link', { name: /WhatsApp/i }).className).toContain('hidden lg:');
  });

  it('renders /checkout with 4-step progress, inline validation, friendly offline notice, and zero technical jargon', async () => {
    const user = userEvent.setup();
    vi.spyOn(orderService, 'getPaymentConfig').mockResolvedValue({
      ok: true,
      data: { razorpayEnabled: false, keyId: null, codEnabled: true },
    });
    vi.spyOn(orderService, 'getCheckoutQuote').mockResolvedValue({
      ok: false,
      error: { isNetworkError: true, message: 'Network Error' },
    });

    renderRoute('/product/sample-shahi-desi-cow-ghee');
    await user.click(screen.getByRole('button', { name: /Add to Cart/i }));
    const drawer = screen.getByRole('dialog', { name: /Shopping Cart Drawer/i });
    await user.click(within(drawer).getByRole('link', { name: /^Checkout$/i }));

    // 4-step progress bar: Cart > Address > Payment > Confirm
    const progressNav = screen.getByRole('navigation', { name: /Checkout progress/i });
    expect(within(progressNav).getByText('Cart')).toBeInTheDocument();
    expect(within(progressNav).getByText('Address')).toBeInTheDocument();
    expect(within(progressNav).getByText('Payment')).toBeInTheDocument();
    expect(within(progressNav).getByText('Confirm')).toBeInTheDocument();

    expect(screen.queryByText(/Kitchen Selection/i)).not.toBeInTheDocument();
    expect(
      await screen.findByText(/We couldn't reach the store right now/i)
    ).toBeInTheDocument();

    // Ensure ALL customer-visible technical wording is absent
    expect(
      screen.queryByText(
        /Server-validated checkout|verified directly on the backend|Backend API server is offline|VITE_GOOGLE_MAPS_API_KEY|SHA-256|Payment status remains PENDING|Keys Not Set Yet|Phase 6|MongoDB|Express/i
      )
    ).not.toBeInTheDocument();

    // Check inline field validation feedback when blurring an empty required field
    const nameInput = screen.getByLabelText(/Recipient Full Name/i);
    await user.click(nameInput);
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText(/Enter the recipient full name/i)).toBeInTheDocument();
    });
  });

  it('renders /account/orders and order confirmation timeline without technical wording', () => {
    renderRoute('/account/orders');
    expect(screen.queryByText(/MongoDB|PENDING/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Sign In Required to View Orders/i })
    ).toBeInTheDocument();

    renderRoute('/account/orders/preview-lifecycle');
    expect(screen.queryByText(/MongoDB|server-validated/i)).not.toBeInTheDocument();
  });
});
