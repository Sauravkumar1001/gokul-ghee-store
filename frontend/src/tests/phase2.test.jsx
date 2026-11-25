import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';

function renderRoute(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('Phase 2 Cart, Wishlist, Account & GOKUL AI Floating Assistant', () => {
  it('adds items to cart, updates quantities, and persists on /cart', async () => {
    const user = userEvent.setup();
    renderRoute('/product/sample-shahi-desi-cow-ghee');

    await user.click(screen.getByRole('button', { name: /Add to Cart/i }));

    const drawer = screen.getByRole('dialog', { name: /Shopping Cart Drawer/i });
    expect(within(drawer).getByText(/Shahi Desi Cow Ghee/i)).toBeInTheDocument();

    // Navigate to /cart via View Cart link inside drawer
    await user.click(within(drawer).getByRole('link', { name: /View Cart/i }));
    expect(
      screen.getByRole('heading', { name: /Your Shopping Cart/i })
    ).toBeInTheDocument();

    // Increase quantity on /cart
    await user.click(
      screen.getByRole('button', { name: /Increase quantity of Shahi Desi Cow Ghee/i })
    );
    expect(screen.getByText(/2 items selected/i)).toBeInTheDocument();

    // Validate coupon field notes checkout verification
    await user.type(screen.getByLabelText(/Coupon code/i), 'GOKUL10');
    await user.click(screen.getByRole('button', { name: /^Apply$/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      /verified automatically at checkout/i
    );
  });

  it('saves items to wishlist and moves them to cart from /wishlist', async () => {
    const user = userEvent.setup();
    renderRoute('/product/sample-royal-kaju-katli');

    await user.click(screen.getByRole('button', { name: /Save to Wishlist/i }));
    await user.click(screen.getByRole('link', { name: /Wishlist \(1 saved\)/i }));

    expect(screen.getByRole('heading', { name: /Your Wishlist/i })).toBeInTheDocument();
    expect(screen.getByText(/Royal Kaju Katli/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Move to Cart/i }));
    expect(screen.getByText(/No Saved Items Yet/i)).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /Shopping Cart Drawer/i })).toBeInTheDocument();
  });

  it('validates login and register forms and renders account/order lifecycle timeline', async () => {
    const user = userEvent.setup();
    renderRoute('/login');

    await user.click(screen.getByRole('button', { name: /^Sign In$/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/email address and password/i);

    await user.click(screen.getByRole('link', { name: /Create an Account/i }));
    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/fill in your name/i);

    renderRoute('/account/orders/preview-lifecycle');
    const timeline = screen.getByRole('list', { name: /Order status timeline/i });
    for (const stage of [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY FOR DISPATCH',
      'SHIPPED',
      'OUT FOR DELIVERY',
      'DELIVERED',
    ]) {
      expect(within(timeline).getByText(stage)).toBeInTheDocument();
    }
  });

  it('opens floating GOKUL AI assistant, suggests catalog mithai under ₹500, and enforces delivery guardrails', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    await user.click(screen.getByRole('button', { name: /Open GOKUL AI Assistant/i }));
    const assistant = screen.getByRole('region', { name: /GOKUL AI Shopping Assistant/i });
    expect(
      within(assistant).getAllByText(/Your Personal Taste Guide/i).length
    ).toBeGreaterThanOrEqual(1);

    // Ask budget mithai prompt
    await user.type(
      within(assistant).getByLabelText(/Ask GOKUL AI/i),
      'Mujhe 500 rupaye ke andar kuch achhi mithai chahiye.'
    );
    await user.click(within(assistant).getByRole('button', { name: /Send message/i }));

    expect(
      await within(assistant).findByRole('link', { name: /Royal Kaju Katli \(Sample\)/i })
    ).toBeInTheDocument();
    expect(
      within(assistant).getByRole('link', {
        name: /Desi Ghee Motichoor Laddoo \(Sample\)/i,
      })
    ).toBeInTheDocument();

    // Ask delivery pincode question -> honest guardrail
    await user.click(within(assistant).getByRole('button', { name: /Check delivery pincode/i }));
    expect(
      await within(assistant).findByText(/We do not promise nationwide or unverified delivery/i)
    ).toBeInTheDocument();
  });
});
