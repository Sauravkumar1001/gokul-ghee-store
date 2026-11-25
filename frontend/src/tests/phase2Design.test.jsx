import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('Phase 2 Design System Rollout (Header, Footer, Floating Controls & Shop Fixes)', () => {
  it.each(['/', '/shop', '/login', '/register'])(
    'renders elevated header, footer, WhatsApp button, and GOKUL AI launcher on %s without internal jargon',
    (route) => {
      renderRoute(route);

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Chat with Gokul Ghee on WhatsApp/i })
      ).toHaveAttribute('href', expect.stringContaining('wa.me/918986365592'));
      expect(
        screen.getByRole('button', { name: /Open GOKUL AI Assistant/i })
      ).toBeInTheDocument();

      expect(screen.queryByText(/store owner will configure/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Pending Owner Inventory Setup/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Live MongoDB Catalog/i)).not.toBeInTheDocument();
    }
  );

  it('renders dismissible slim notice banner and sleek product cards on /shop', async () => {
    const user = userEvent.setup();
    renderRoute('/shop');

    const note = screen.getByRole('note');
    expect(note).toHaveTextContent(/Kitchen Selection/i);
    expect(note).not.toHaveTextContent(/Pre-Launch Sample Catalog/i);
    expect(note).not.toHaveTextContent(/Admin/i);

    // Ensure product card i18n labels resolve cleanly (no raw translation keys)
    expect(screen.queryByText(/product\.(add|off|options|bestseller)/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Add$/i }).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /Dismiss notice/i }));
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});
