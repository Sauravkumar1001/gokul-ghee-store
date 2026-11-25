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

describe('Phase 4 Listing (/shop, /search) & Product Detail Redesign', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    STORE_CONFIG.showSampleBadge = true;
  });

  it('renders /shop with Kitchen Selection banner, sticky category chips, price-only sidebar & bottom sheet, product descriptions, and zero technical wording', async () => {
    const user = userEvent.setup();
    renderRoute('/shop');

    expect(screen.getByRole('navigation', { name: /Breadcrumb/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: /All Gokul Ghee Offerings/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/Kitchen Selection/i);
    expect(screen.getByRole('tablist', { name: /Filter by category/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort products/i)).toBeInTheDocument();

    // Product card descriptions now render cleanly (shortDescription)
    expect(
      screen.getByText(/Rich golden, naturally granular cow ghee prepared using traditional/i)
    ).toBeInTheDocument();

    // Desktop sidebar contains ONLY Price Range (no duplicate Categories section)
    const aside = document.querySelector('aside');
    expect(aside).toBeTruthy();
    expect(within(aside).getByRole('heading', { name: /Price Range/i })).toBeInTheDocument();
    expect(within(aside).queryByRole('heading', { name: /Categories/i })).not.toBeInTheDocument();

    // Choose Samosa from sticky category bar, then open mobile bottom sheet filter drawer for Above ₹1,200
    await user.click(screen.getByRole('tab', { name: /^Samosa$/i }));
    await user.click(screen.getByRole('button', { name: /^Filters$/i }));
    const sheet = screen.getByRole('dialog', { name: /Filter products/i });
    expect(sheet).toBeInTheDocument();

    // Bottom sheet shows ONLY Price Range (no duplicate category buttons)
    expect(within(sheet).queryByRole('button', { name: /^Mithai$/i })).not.toBeInTheDocument();

    await user.click(within(sheet).getByLabelText(/Above ₹1,200/i));
    await user.click(within(sheet).getByRole('button', { name: /Show 0 Items/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Filter products/i })).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
    const resetBtns = screen.getAllByRole('button', { name: /Reset Filters/i });
    await user.click(resetBtns[resetBtns.length - 1]);
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();

    expect(
      screen.queryByText(/MongoDB|Admin|Phase 3|Phase 4|Sample Price Range/i)
    ).not.toBeInTheDocument();
  });

  it('hides Kitchen Selection banner on category pages (/shop/desi-ghee) and honors STORE_CONFIG.showSampleBadge', () => {
    STORE_CONFIG.showSampleBadge = false;
    renderRoute('/shop/desi-ghee');

    expect(screen.getByRole('heading', { level: 1, name: /^Desi Ghee$/i })).toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.queryByText(/^Sample$/i)).not.toBeInTheDocument();
  });

  it('renders /search cleanly without internal wording and recovers from zero results', async () => {
    const user = userEvent.setup();
    renderRoute('/search?q=notfoundxyz');

    expect(screen.getByRole('heading', { level: 1, name: /Search Gokul Ghee/i })).toBeInTheDocument();
    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
    expect(screen.queryByText(/sample item/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(screen.getByText(/Shahi Desi Cow Ghee/i)).toBeInTheDocument();
  });

  it('renders /product/:slug with gallery, rating, buy box, pincode checker, trust row, accordions, FBT bundle, and mobile quick bar cleanly', async () => {
    const user = userEvent.setup();
    vi.spyOn(orderService, 'checkPincode')
      .mockResolvedValueOnce({
        ok: true,
        data: {
          serviceable: true,
          pincode: '801503',
          deliveryCharge: 0,
          minimumOrderValue: 199,
          estimatedDeliveryTime: 'Same-day dispatch',
          message: 'Local delivery available to Anand Bazar, Danapur.',
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          serviceable: false,
          pincode: '110001',
          deliveryCharge: 0,
          minimumOrderValue: 0,
          estimatedDeliveryTime: '',
          message: 'Outside local Danapur/Patna delivery route.',
        },
      });

    renderRoute('/product/sample-shahi-desi-cow-ghee');

    // Title & rating
    expect(
      screen.getByRole('heading', { level: 1, name: /Shahi Desi Cow Ghee/i })
    ).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();

    // Trust row
    expect(screen.getByText(/FSSAI Standard/i)).toBeInTheDocument();
    expect(screen.getByText(/Batch-Packed Fresh/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure Payment/i)).toBeInTheDocument();

    // Accordions open/toggle
    const ingredientsButtons = screen.getAllByRole('button', { name: /Ingredients & Purity/i });
    await user.click(ingredientsButtons[0]);
    expect(ingredientsButtons[0]).toHaveAttribute('aria-expanded', 'true');

    // Frequently Bought Together bundle & Related section
    expect(
      screen.getByRole('heading', { name: /Frequently Bought Together/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Related Gokul Ghee Selections/i })
    ).toBeInTheDocument();

    // Mobile quick purchase bar
    expect(screen.getByLabelText(/Mobile quick purchase bar/i)).toBeInTheDocument();

    // Pincode serviceable & non-serviceable states
    const pinInput = screen.getByLabelText(/Delivery pincode/i);
    await user.clear(pinInput);
    await user.type(pinInput, '801503');
    await user.click(screen.getByRole('button', { name: /^Check$/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Anand Bazar, Danapur/i);

    await user.clear(pinInput);
    await user.type(pinInput, '110001');
    await user.click(screen.getByRole('button', { name: /^Check$/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Outside local Danapur\/Patna/i);

    // Zero customer-facing technical jargon
    expect(
      screen.queryByText(/MongoDB|Admin|Phase 3|Phase 4|Sample Seed Item|sample units/i)
    ).not.toBeInTheDocument();
  });
});
