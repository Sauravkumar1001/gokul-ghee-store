import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';

function renderRoute(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('Phase 5 Dedicated Admin Console & Telemetry UI', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('redirects unauthenticated visit to /admin/dashboard cleanly to /admin/login', async () => {
    renderRoute('/admin/dashboard');

    expect(
      await screen.findByRole('heading', { name: /Admin Console Sign In/i })
    ).toBeInTheDocument();
  });

  it('rejects customer-role credentials on /admin/login and keeps admin workspace locked', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'login').mockResolvedValue({
      ok: true,
      data: {
        user: {
          id: 'cust-1',
          name: 'Customer User',
          email: 'customer@example.com',
          role: 'customer',
        },
      },
    });
    const logoutSpy = vi.spyOn(authService, 'logout').mockResolvedValue({ ok: true });

    renderRoute('/admin/login');

    await user.type(
      await screen.findByLabelText(/Administrator Email/i),
      'customer@example.com'
    );
    await user.type(screen.getByLabelText(/^Password$/i), 'Secret123!');
    await user.click(screen.getByRole('button', { name: /Sign In to Admin Panel/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Administrator credentials are required/i
    );
    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('navigation', { name: /Admin Navigation Sidebar/i })
    ).not.toBeInTheDocument();
  });

  it('authenticates admin onto independent /admin/dashboard (without customer storefront chrome) and navigates to /admin/ai-usage', async () => {
    const user = userEvent.setup();

    vi.spyOn(authService, 'login').mockResolvedValue({
      ok: true,
      data: {
        user: {
          id: 'admin-1',
          name: 'Store Owner',
          email: 'owner@gokulghee.in',
          role: 'admin',
        },
      },
    });

    vi.spyOn(adminService, 'getDashboard').mockResolvedValue({
      ok: true,
      data: {
        metrics: {
          totalRevenue: 4850,
          verifiedPaidRevenue: 3250,
          totalOrders: 6,
          pendingOrders: 2,
          completedOrders: 3,
          cancelledOrders: 1,
          totalCustomers: 12,
          averageOrderValue: 808,
          lowStockCount: 3,
        },
        salesTrends: [{ date: '2026-11-10', revenue: 3250, orders: 4 }],
        bestsellingProducts: [
          { _id: 'prod-1', name: 'Shahi Desi Cow Ghee', unitsSold: 4, revenue: 3250 },
        ],
        recentOrders: [],
        lowStockAlerts: [],
      },
    });

    vi.spyOn(adminService, 'getUsageMeter').mockResolvedValue({
      ok: true,
      data: {
        ai: {
          totalRequests: 14,
          failedRequests: 1,
          inputTokens: 4200,
          outputTokens: 1850,
          estimatedCostUsd: 0.00412,
          avgLatencyMs: 640,
          dailyUsage: [
            {
              date: '2026-11-10',
              requests: 14,
              inputTokens: 4200,
              outputTokens: 1850,
              estimatedCostUsd: 0.00412,
            },
          ],
          monthlyUsage: [],
          recentErrors: [],
        },
        website: {
          totalVisitors: 38,
          pageViews: 145,
          productViews: 52,
          cartAdditions: 19,
          checkoutStarts: 9,
          completedPurchases: 6,
          conversionRate: 15.79,
        },
        system: {
          avgApiResponseMs: 24,
          maxResponseMs: 112,
          totalTrackedRequests: 210,
          backendErrors: 0,
          uptimeSeconds: 1840,
          memoryRssMb: 96,
          database: { connected: true, state: 'connected', name: 'gokul_ghee_prod' },
          imageStorage: {
            configured: false,
            available: false,
            note: 'Cloudinary credentials not configured yet',
          },
        },
      },
    });

    renderRoute('/admin/login');

    await user.type(
      await screen.findByLabelText(/Administrator Email/i),
      'owner@gokulghee.in'
    );
    await user.type(screen.getByLabelText(/^Password$/i), 'OwnerPass123!');
    await user.click(screen.getByRole('button', { name: /Sign In to Admin Panel/i }));

    expect(
      await screen.findByRole('heading', { name: /Operations Dashboard/i })
    ).toBeInTheDocument();

    // Verify independent Admin chrome (no customer storefront footer or floating AI button)
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open GOKUL AI/i })).not.toBeInTheDocument();

    // Verify DB-backed KPIs rendered (async useEffect finishes loading)
    expect(await screen.findByText(/Gross Order Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Paid: ₹3,250/i)).toBeInTheDocument();
    expect(screen.getByText(/Low Stock Alerts/i)).toBeInTheDocument();
    expect(screen.getByText('Shahi Desi Cow Ghee')).toBeInTheDocument();

    // Navigate to AI Usage, Website Funnel & System Meter via sidebar
    await user.click(screen.getByRole('link', { name: /Usage Meter/i }));

    expect(
      await screen.findByRole('heading', { name: /AI Usage, Website Funnel & System Meter/i })
    ).toBeInTheDocument();
    expect(await screen.findByText(/Input Tokens/i)).toBeInTheDocument();
    expect(screen.getByText('4,200')).toBeInTheDocument();
    expect(screen.getByText(/Output Tokens/i)).toBeInTheDocument();
    expect(screen.getByText('1,850')).toBeInTheDocument();
    expect(screen.getByText(/Unique Visitors/i)).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
    expect(screen.getByText(/Database Connectivity/i)).toBeInTheDocument();
    expect(screen.getByText(/Cloudinary Media Storage/i)).toBeInTheDocument();
  });
});
