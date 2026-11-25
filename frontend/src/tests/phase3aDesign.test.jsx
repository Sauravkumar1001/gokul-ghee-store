import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import CategoryShowcase from '../components/home/CategoryShowcase';
import BestsellingSection from '../components/home/BestsellingSection';
import FeaturedGheeSection from '../components/home/FeaturedGheeSection';
import MithaiSnacksSection from '../components/home/MithaiSnacksSection';
import WhyChooseSection from '../components/home/WhyChooseSection';
import { LanguageProvider } from '../context/LanguageContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

function renderHomePartA() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <CartProvider>
          <WishlistProvider>
            <HeroSection />
            <CategoryShowcase />
            <BestsellingSection />
            <FeaturedGheeSection />
            <MithaiSnacksSection />
            <WhyChooseSection />
          </WishlistProvider>
        </CartProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('Phase 3A Home Page Sections 1 to 6 Redesign', () => {
  it('renders sections 1-6 with elevated design primitives and zero internal customer jargon', () => {
    renderHomePartA();

    expect(screen.getByRole('heading', { level: 1, name: /Tradition in Every Taste\./i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Shop Now/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Explore Our Seven Collections/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Bestselling Products/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Featured Desi Ghee Collection/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mithai & Traditional Snacks Showcase/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Why Families Choose Gokul Ghee/i })).toBeInTheDocument();

    expect(screen.queryByText(/Sample seed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/configurable by weight in Admin/i)).not.toBeInTheDocument();
  });

  it('filters Mithai & Snacks cleanly via interactive pill tabs in section 5', async () => {
    const user = userEvent.setup();
    renderHomePartA();

    const tablist = screen.getByRole('tablist', { name: /Filter Mithai and Snacks/i });
    const mithaiSection = tablist.closest('section');
    expect(mithaiSection).toBeTruthy();

    await user.click(within(tablist).getByRole('tab', { name: /^Samosa$/i }));

    expect(within(mithaiSection).getByText(/Anand Bazar Crispy Samosa Pack/i)).toBeInTheDocument();
    expect(within(mithaiSection).queryByText(/Royal Kaju Katli/i)).not.toBeInTheDocument();
  });
});
