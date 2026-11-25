import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';

function renderRoute(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('3-Mode Storefront & GOKUL AI Language Switcher (EN | हिंदी | Hinglish)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('switches header, hero, categories, footer, and GOKUL AI across EN -> हिंदी -> Hinglish -> EN and persists in localStorage', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    // 1. Default EN state
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dataset.gokulLang).toBe('en');
    expect(
      screen.getByRole('heading', { name: /Tradition in Every Taste\./i })
    ).toBeInTheDocument();
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Our Story' })).toBeInTheDocument();
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText(/Visit Our Store/i)).toBeInTheDocument();

    // 2. Switch to हिंदी
    await user.click(within(header).getByRole('button', { name: 'हिंदी' }));

    expect(window.localStorage.getItem('gokul_ghee_lang_v1')).toBe('hi');
    expect(document.documentElement.lang).toBe('hi');
    expect(document.documentElement.dataset.gokulLang).toBe('hi');
    expect(
      screen.getByRole('heading', {
        name: /हर चम्मच में शुद्धता। हर स्वाद में परंपरा।/,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'अभी खरीदें' })).toBeInTheDocument();
    expect(within(header).getByRole('link', { name: 'हमारी कहानी' })).toBeInTheDocument();
    expect(within(footer).getByText(/हमारा पता/)).toBeInTheDocument();

    const categorySection = document.getElementById('featured-categories');
    expect(categorySection).toBeTruthy();
    expect(within(categorySection).getByRole('heading', { name: 'देसी घी' })).toBeInTheDocument();
    expect(
      within(categorySection).getByRole('heading', { name: 'पारंपरिक मिठाई' })
    ).toBeInTheDocument();

    // Verify GOKUL AI UI & localized quick prompt reply in Hindi
    await user.click(screen.getByRole('button', { name: /GOKUL AI सहायक खोलें/ }));
    const assistantHi = screen.getByRole('region', { name: /GOKUL AI शॉपिंग सहायक/ });
    expect(within(assistantHi).getByText(/आपका पर्सनल टेस्ट गाइड/)).toBeInTheDocument();
    await user.click(
      within(assistantHi).getByRole('button', { name: 'डिलीवरी पिनकोड जांचें' })
    );
    expect(
      await within(assistantHi).findByText(/पूरे देश में या बिना जाँचे डिलीवरी का वादा नहीं करते/)
    ).toBeInTheDocument();

    // 3. Switch to Hinglish while assistant is open
    await user.click(within(header).getByRole('button', { name: 'Hinglish' }));

    expect(window.localStorage.getItem('gokul_ghee_lang_v1')).toBe('hinglish');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dataset.gokulLang).toBe('hinglish');
    expect(
      screen.getByRole('heading', {
        name: /Har Chammach Mein Shuddhata\. Har Swaad Mein Parampara\./i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abhi Khareedein' })).toBeInTheDocument();
    expect(within(header).getByRole('link', { name: 'Hamari Kahani' })).toBeInTheDocument();
    expect(within(footer).getByText(/Hamara Store/i)).toBeInTheDocument();

    const assistantHinglish = screen.getByRole('region', { name: /GOKUL AI Shopping Assistant/i });
    await user.click(
      within(assistantHinglish).getByRole('button', { name: 'Delivery pincode check karein' })
    );
    expect(
      await within(assistantHinglish).findByText(
        /Hum nationwide ya unverified delivery ka wada nahi karte/i
      )
    ).toBeInTheDocument();

    // 4. Switch back to EN
    await user.click(within(header).getByRole('button', { name: 'EN' }));
    expect(window.localStorage.getItem('gokul_ghee_lang_v1')).toBe('en');
    expect(document.documentElement.dataset.gokulLang).toBe('en');
    expect(
      screen.getByRole('heading', { name: /Tradition in Every Taste\./i })
    ).toBeInTheDocument();
  });

  it('hydrates initial storefront language from localStorage on mount', () => {
    window.localStorage.setItem('gokul_ghee_lang_v1', 'hinglish');
    renderRoute('/');

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dataset.gokulLang).toBe('hinglish');
    expect(
      screen.getByRole('heading', {
        name: /Har Chammach Mein Shuddhata\. Har Swaad Mein Parampara\./i,
      })
    ).toBeInTheDocument();
  });
});
