import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('Phase 6 Login, Register & Account Pages Redesign', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('renders /login with split-screen layout, brand benefits, floating labels, show/hide password, and zero technical wording', async () => {
    const user = userEvent.setup();
    renderRoute('/login?next=/checkout');

    // 1. Brand Showcase Column (Desktop) & Tagline
    expect(
      screen.getByRole('heading', { level: 2, name: /Tradition in Every Taste/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Faster Doorstep Checkout/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Order Tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/Personalized Wishlist/i)).toBeInTheDocument();

    // 2. Right Form Column with Floating Labels
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    const pwdInput = screen.getByPlaceholderText(/Enter your password/i);
    expect(pwdInput).toHaveAttribute('type', 'password');

    // 3. Show/Hide Password Toggle
    const toggleBtn = screen.getByRole('button', { name: /Show password/i });
    await user.click(toggleBtn);
    expect(pwdInput).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: /Hide password/i }));
    expect(pwdInput).toHaveAttribute('type', 'password');

    // 4. Empty Submit validation alert
    await user.click(screen.getByRole('button', { name: /^Sign In$/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      /email address and password/i
    );

    // 5. Preserves ?next=/checkout on registration link
    const createAccountLink = screen.getByRole('link', {
      name: /Create an Account/i,
    });
    expect(createAccountLink.getAttribute('href')).toContain('next=%2Fcheckout');

    // 6. Zero Technical Wording
    expect(
      screen.queryByText(/MongoDB|backend|token|JWT|Express|API server/i)
    ).not.toBeInTheDocument();
  });

  it('renders /register with password strength meter, Indian mobile validation, floating inputs, and zero technical jargon', async () => {
    const user = userEvent.setup();
    renderRoute('/register?next=/checkout');

    expect(
      screen.getByRole('heading', { level: 1, name: /Create Account/i })
    ).toBeInTheDocument();

    // Floating Inputs
    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const phoneInput = screen.getByLabelText(/Mobile Number/i);
    const pwdInput = screen.getByLabelText(/^Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(phoneInput).toBeInTheDocument();
    expect(pwdInput).toBeInTheDocument();
    expect(confirmInput).toBeInTheDocument();

    // Password strength meter updates dynamically
    await user.type(pwdInput, 'abc');
    expect(screen.getByText(/Password Strength:/i)).toBeInTheDocument();
    expect(screen.getByText(/Weak/i)).toBeInTheDocument();

    await user.type(pwdInput, '123456');
    expect(screen.getByText(/Medium/i)).toBeInTheDocument();

    await user.type(pwdInput, 'XYZ!@#');
    expect(screen.getByText(/Strong/i)).toBeInTheDocument();

    // Submit with invalid phone number
    await user.type(nameInput, 'Rajesh Kumar');
    await user.type(emailInput, 'rajesh@example.com');
    await user.type(phoneInput, '12345'); // invalid Indian phone
    await user.type(confirmInput, 'abc123456XYZ!@#');

    await user.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      /10-digit Indian mobile number/i
    );

    // Zero Technical Jargon
    expect(
      screen.queryByText(/MongoDB|backend|token|JWT|Express/i)
    ).not.toBeInTheDocument();
  });

  it('renders /account without MongoDB or JWT technical wording, with clean desktop sidebar and mobile navigation', async () => {
    renderRoute('/account');

    // Check that technical jargon is completely absent
    expect(
      screen.queryByText(/MongoDB Atlas|HTTP-only JWT cookies|Phase 6/i)
    ).not.toBeInTheDocument();

    // Check clean guest session header and sign-in CTAs
    expect(
      screen.getByRole('heading', { level: 2, name: /Sign In to Access Your Saved Profile/i })
    ).toBeInTheDocument();

    // Navigation links exist
    expect(
      screen.getAllByRole('link', { name: /My Orders|Order History/i })[0]
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Saved Wishlist/i })[0]).toBeInTheDocument();
  });

  it('renders /wishlist with on-brand styling, zero SampleNoticeBanner, and supports moving items to cart', async () => {
    const user = userEvent.setup();
    renderRoute('/product/sample-royal-kaju-katli');

    // Add to wishlist
    await user.click(screen.getByRole('button', { name: /Save to Wishlist/i }));

    // Visit /wishlist
    renderRoute('/wishlist');
    expect(
      screen.getByRole('heading', { level: 1, name: /Your Wishlist/i })
    ).toBeInTheDocument();

    // Must NOT have Kitchen Selection banner
    expect(screen.queryByText(/Kitchen Selection/i)).not.toBeInTheDocument();

    // Has Move to Cart button
    const moveBtn = screen.getByRole('button', { name: /Move to Cart/i });
    expect(moveBtn).toBeInTheDocument();

    // Move to cart clears item from wishlist and shows empty state
    await user.click(moveBtn);
    expect(screen.getByText(/No Saved Items Yet/i)).toBeInTheDocument();
  });
});
