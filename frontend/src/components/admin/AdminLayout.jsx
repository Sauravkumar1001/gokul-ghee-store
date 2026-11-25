import { useState } from 'react';
import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Boxes,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquareQuote,
  Package,
  Settings,
  ShoppingCart,
  TicketPercent,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/delivery', label: 'Delivery Zones', icon: MapPin },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/ai-usage', label: 'Usage Meter', icon: Activity },
  { to: '/admin/settings', label: 'Store Settings', icon: Settings },
];

export default function AdminLayout({ title, subtitle, actions = null, children }) {
  const { user, isAuthenticated, isAdmin, isHydrating, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isHydrating) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-slate-600">
        Verifying administrator session...
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Desktop & Mobile Sidebar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C9A34A] block">
              Control Console
            </span>
            <span className="font-bold text-lg tracking-wide text-white">GOKUL GHEE</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close admin sidebar"
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#173D2B] text-[#F8F4E9] shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-[#C9A34A]" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2.5 text-xs">
          <div className="px-2">
            <p className="font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-md bg-slate-800 text-slate-200 hover:text-white"
          >
            <span>Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-slate-700 text-slate-300 hover:bg-rose-950/60 hover:text-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden p-2 rounded-md border border-slate-200 text-slate-700"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
