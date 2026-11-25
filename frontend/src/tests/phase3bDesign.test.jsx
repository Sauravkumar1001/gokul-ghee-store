import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { SAMPLE_PRODUCTS } from '../data/sampleCatalog';

describe('Phase 3B Home Page Sections 7 to 12 & Clean Storefront Copy', () => {
  it('renders sections 7-12 cleanly on / with zero customer-facing technical jargon', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Section 7: Brand Story
    expect(
      screen.getByRole('heading', { name: /From Anand Bazar’s Counter to Your Family Table/i })
    ).toBeInTheDocument();

    // Section 8: Verified Reviews Hero Card
    expect(
      screen.getByRole('heading', { name: /Customer Reviews & Store Reputation/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Zero Fake Reviews Policy/i)).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText(/169 Google reviews/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Google Reviews/i })).toBeInTheDocument();

    // Section 9: Special Offers & Hampers with hamper image + countdown
    expect(
      screen.getByRole('heading', { name: /Special Offers & Curated Hampers/i })
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(/Heritage Kitchen Pairing festive desi ghee and mithai gift hamper/i)
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(/Diwali and Chhath handcrafted Kesar Pista Gujiya and festive offerings/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Diwali\/Chhath pre-orders|Fresh festival batch pre-orders/i)
    ).toBeInTheDocument();

    // Section 10: Visit Store Preview
    expect(
      screen.getByRole('heading', { name: /Anil Ji Ka Gokul Ghee — Anand Bazar, Danapur/i })
    ).toBeInTheDocument();

    // Section 11: Newsletter
    expect(
      screen.getByRole('heading', { name: /Receive Festival Pre-Order & Fresh Batch Alerts/i })
    ).toBeInTheDocument();

    // Section 12: Gallery
    expect(
      screen.getByRole('heading', { name: /From Our Kitchen & Counter/i })
    ).toBeInTheDocument();

    // Navbar links stay nowrap and clean
    const desiGheeLinks = screen.getAllByRole('link', { name: /^Desi Ghee$/i });
    expect(desiGheeLinks[0].className).toContain('whitespace-nowrap');

    // Product card titles strip repeated "(Sample)" suffix
    expect(screen.getAllByRole('heading', { name: /^Shahi Desi Cow Ghee$/i }).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByRole('heading', { name: /^Royal Kaju Katli$/i }).length).toBeGreaterThan(
      0
    );

    // Strict customer copy check across entire Home route DOM
    expect(screen.queryByText(/Admin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/MongoDB/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Phase 3/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/database orders/i)).not.toBeInTheDocument();
  });

  it('uses unique primary images for every catalog product including Kaju Katli vs Motichoor Laddoo', () => {
    const primaryImages = SAMPLE_PRODUCTS.map((p) => p.images?.[0]);
    const uniqueImages = new Set(primaryImages);
    expect(uniqueImages.size).toBe(SAMPLE_PRODUCTS.length);

    const kajuKatli = SAMPLE_PRODUCTS.find((p) => p.slug.includes('kaju-katli'));
    const laddoo = SAMPLE_PRODUCTS.find((p) => p.slug.includes('motichoor-laddoo'));
    expect(kajuKatli?.images?.[0]).toBeTruthy();
    expect(laddoo?.images?.[0]).toBeTruthy();
    expect(kajuKatli?.images?.[0]).not.toBe(laddoo?.images?.[0]);
  });

  it('submits newsletter cleanly without exposing Phase 3 copy', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email address for store updates/i);
    await user.type(emailInput, 'family@example.com');
    await user.click(screen.getByRole('button', { name: /^Subscribe$/i }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/Subscribed cleanly/i);
    expect(status).not.toHaveTextContent(/Phase 3/i);
  });
});
