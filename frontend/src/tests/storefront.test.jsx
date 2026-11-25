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

describe('Phase 1 Storefront Routes & Interactive Flows', () => {
  it('renders homepage with hero, 7 categories, verified reviews policy, and footer store card', () => {
    renderRoute('/');

    expect(
      screen.getByRole('heading', { name: /Tradition in Every Taste\./i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Shop Now/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Products/i })).toBeInTheDocument();

    // All 7 category headings inside category showcase
    const categorySection = document.getElementById('featured-categories');
    expect(categorySection).toBeTruthy();
    const scoped = within(categorySection);
    for (const name of [
      'Desi Ghee',
      'Mithai',
      'Samosa',
      'Namkeen',
      'Traditional Snacks',
      'Special Combos',
      'Festival Specials',
    ]) {
      expect(scoped.getByRole('heading', { name })).toBeInTheDocument();
    }

    // Verified Reviews policy check
    expect(
      screen.getByText(/Zero Fake Reviews Policy/i)
    ).toBeInTheDocument();

    // Footer store location section
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText(/Visit Our Store/i)).toBeInTheDocument();
    expect(within(footer).getByText(/\+91 89863 65592/)).toBeInTheDocument();
  });

  it('filters products by category and price range on /shop', async () => {
    const user = userEvent.setup();
    renderRoute('/shop');

    expect(
      screen.getByRole('heading', { name: /All Gokul Ghee Offerings/i })
    ).toBeInTheDocument();

    // Filter to Under ₹250
    await user.click(screen.getByLabelText(/Under ₹250/i));
    expect(screen.getByText(/Anand Bazar Crispy Samosa Pack/i)).toBeInTheDocument();
    expect(screen.queryByText(/Shahi Desi Cow Ghee/i)).not.toBeInTheDocument();
  });

  it('renders category-specific route /shop/desi-ghee', () => {
    renderRoute('/shop/desi-ghee');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Desi Ghee' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Shahi Desi Cow Ghee/i)).toBeInTheDocument();
  });

  it('switches pack variants and updates live price on /product/:slug', async () => {
    const user = userEvent.setup();
    renderRoute('/product/sample-shahi-desi-cow-ghee');

    expect(
      screen.getByRole('heading', { level: 1, name: /Shahi Desi Cow Ghee/i })
    ).toBeInTheDocument();

    // Click 1kg variant button
    await user.click(screen.getByRole('button', { name: /1kg Sample Jar/i }));
    expect(screen.getByRole('button', { name: /Add to Cart • ₹1,190/i })).toBeInTheDocument();

    // Clicking Add to Cart updates real cart state and opens Cart Drawer
    await user.click(screen.getByRole('button', { name: /Add to Cart/i }));
    expect(screen.getByRole('dialog', { name: /Shopping Cart Drawer/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Added 1 × Shahi Desi Cow Ghee/i);
  });

  it('filters catalog items on /search?q=samosa', () => {
    renderRoute('/search?q=samosa');

    expect(screen.getByText(/Anand Bazar Crispy Samosa Pack/i)).toBeInTheDocument();
    expect(screen.queryByText(/Royal Kaju Katli/i)).not.toBeInTheDocument();
  });

  it('displays official store details, Get Directions, Call Now, and validates enquiry form on /contact', async () => {
    const user = userEvent.setup();
    renderRoute('/contact');

    expect(screen.getAllByText(/Math Road, Near Hindu Society Mandir/i).length).toBeGreaterThan(0);
    const directionsLinks = screen.getAllByRole('link', { name: /Get Directions/i });
    expect(directionsLinks.length).toBeGreaterThanOrEqual(2);
    for (const link of directionsLinks) {
      expect(link).toHaveAttribute('href', expect.stringContaining('ChIJ53Oz9XZX7TkRW_5zLDQrlaI'));
    }
    expect(screen.getByRole('link', { name: /Call Now/i })).toHaveAttribute(
      'href',
      'tel:+918986365592'
    );

    // Submit empty contact form -> validation error
    await user.click(screen.getByRole('button', { name: /Submit Enquiry/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Please enter your name/i);

    // Fill and submit -> clean validation message
    await user.type(screen.getByPlaceholderText('Your name'), 'Rohan Sharma');
    await user.type(
      screen.getByPlaceholderText('Share how we can assist you...'),
      'Enquiring about festival mithai gift packs.'
    );
    await user.click(screen.getByRole('button', { name: /Submit Enquiry/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Form validated cleanly/i);
  });

  it('paginates products on /shop and handles mobile navigation toggle', async () => {
    const user = userEvent.setup();
    renderRoute('/shop');

    // Page 1 shows 6 of 9 sample items
    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();

    // Open mobile menu toggle
    const menuBtn = screen.getByRole('button', { name: /Open navigation menu/i });
    await user.click(menuBtn);
    expect(screen.getByRole('button', { name: /Close navigation menu/i })).toBeInTheDocument();
  });

  it('validates newsletter email on homepage without faking DB persistence', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    const emailInput = screen.getByLabelText(/Email address for store updates/i);
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: /^Subscribe$/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Please enter a valid email/i);

    await user.clear(emailInput);
    await user.type(emailInput, 'customer@example.com');
    await user.click(screen.getByRole('button', { name: /^Subscribe$/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Subscribed cleanly/i);
  });
});
