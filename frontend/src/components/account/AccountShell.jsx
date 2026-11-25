import { Link, NavLink } from 'react-router-dom';
import { Heart, LogOut, MapPin, Package, ShieldCheck, User } from 'lucide-react';
import { Badge, Button } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AccountShell({ title, subtitle, children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'G';

  const desktopNavClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-[14px] text-xs sm:text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-[#0F3D2E] text-[#FBF7EE] shadow-sm'
        : 'text-[#5A554C] hover:text-[#0F3D2E] hover:bg-[#F3EAD7]/70'
    }`;

  const mobileTabClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
      isActive
        ? 'bg-[#0F3D2E] text-[#FBF7EE] shadow-sm'
        : 'bg-[#FFFDF8] border border-[#E6DEC9] text-[#5A554C] hover:text-[#0F3D2E]'
    }`;

  return (
    <div className="min-h-[80vh] bg-[#FBF7EE] py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="space-y-2 border-b border-[#E6DEC9] pb-6">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
            {t('pages.account.title')}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F3D2E]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#5A554C] max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Mobile Horizontal Tabs (< lg) */}
        <div className="lg:hidden">
          <nav
            aria-label="Account mobile navigation"
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
          >
            <NavLink to="/account" end className={mobileTabClass}>
              <User className="w-3.5 h-3.5" />
              <span>{isHi ? 'प्रोफ़ाइल व पते' : t('pages.account.addresses')}</span>
            </NavLink>
            <NavLink to="/account/orders" className={mobileTabClass}>
              <Package className="w-3.5 h-3.5" />
              <span>{t('pages.account.orders')}</span>
            </NavLink>
            <NavLink to="/wishlist" className={mobileTabClass}>
              <Heart className="w-3.5 h-3.5" />
              <span>{t('pages.account.wishlist')}</span>
            </NavLink>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap bg-[#FFFDF8] border border-[#E6DEC9] text-[#5A554C] hover:text-[#0F3D2E] transition-colors shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('pages.checkout.pickupOption')}</span>
            </Link>
          </nav>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar (>= lg) */}
          <aside className="hidden lg:block lg:col-span-3 rounded-[24px] border border-[#E6DEC9] bg-[#FFFDF8] p-5 space-y-5 gg-shadow-sm sticky top-24">
            {/* User Profile Card Snippet */}
            <div className="p-3.5 rounded-[18px] bg-[#FBF7EE] border border-[#E6DEC9]/80 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D8B45E] to-[#B08732] text-[#0F3D2E] font-editorial font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9A7624] truncate">
                  {isAuthenticated
                    ? isHi
                      ? 'सत्यापित ग्राहक'
                      : 'Verified Customer'
                    : isHi
                      ? 'अतिथि सत्र'
                      : 'Guest Session'}
                </p>
                <p className="text-sm font-semibold text-[#0F3D2E] truncate">
                  {isAuthenticated ? user?.name || user?.email : 'Welcome'}
                </p>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav aria-label="Account desktop navigation" className="space-y-1.5">
              <NavLink to="/account" end className={desktopNavClass}>
                <User className="w-4 h-4" />
                <span>{isHi ? 'प्रोफ़ाइल व पते' : t('pages.account.addresses')}</span>
              </NavLink>
              <NavLink to="/account/orders" className={desktopNavClass}>
                <Package className="w-4 h-4" />
                <span>{t('pages.account.orders')}</span>
              </NavLink>
              <NavLink to="/wishlist" className={desktopNavClass}>
                <Heart className="w-4 h-4" />
                <span>{t('pages.account.wishlist')}</span>
              </NavLink>
              <Link
                to="/contact"
                className="flex items-center gap-3 px-4 py-3 rounded-[14px] text-xs sm:text-sm font-semibold text-[#5A554C] hover:text-[#0F3D2E] hover:bg-[#F3EAD7]/70 transition-all duration-200"
              >
                <MapPin className="w-4 h-4 text-[#9A7624]" />
                <span>{t('pages.checkout.pickupOption')}</span>
              </Link>
            </nav>

            {/* Auth Actions */}
            <div className="pt-2 border-t border-[#E6DEC9]">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[#8C2D19]/40 text-xs font-semibold uppercase tracking-wider text-[#8C2D19] hover:bg-[#FDF1EE] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('pages.account.logout')}</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button to="/login" variant="primary" size="sm" fullWidth>
                    {t('pages.auth.signInBtn')}
                  </Button>
                  <Button to="/register" variant="secondary" size="sm" fullWidth>
                    {t('pages.auth.registerLink')}
                  </Button>
                </div>
              )}
            </div>
          </aside>

          {/* Right Main Content */}
          <div className="lg:col-span-9 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
