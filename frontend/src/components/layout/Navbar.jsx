import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';
import { SAMPLE_CATEGORIES } from '../../data/sampleCatalog';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitch from '../common/LanguageSwitch';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { GG_EASE } from '../ui/motion';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();

  const { itemCount, openDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { language, t, categoryLabel } = useLanguage();
  const isHi = language === 'hi';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/search');
    }
  };

  const navLinkClass = ({ isActive }) =>
    `relative whitespace-nowrap shrink-0 text-[13px] xl:text-sm font-medium tracking-wide transition-colors py-1.5 ${
      isActive
        ? 'text-[#0F3D2E] font-semibold after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[#C9A24B]'
        : 'text-[#1B1B1B]/85 hover:text-[#0F3D2E]'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#FBF7EE]/92 backdrop-blur-xl border-b border-[#0F3D2E]/10 gg-shadow-sm">
      <Container>
        <div className="h-[68px] sm:h-20 flex items-center justify-between gap-2.5 lg:gap-4">
          {/* Mobile menu toggle */}
          <div className="flex items-center min-[1100px]:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? t('nav.closeMenuAria') : t('nav.openMenuAria')}
              aria-expanded={mobileOpen}
              className="w-10 h-10 -ml-2 inline-flex items-center justify-center rounded-full text-[#0F3D2E] hover:bg-[#0F3D2E]/6 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Brand Wordmark */}
          <Link
            to="/"
            className="flex flex-col items-center min-[1100px]:items-start group shrink-0 min-w-0"
            aria-label="Gokul Ghee Home"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="hidden sm:inline-block w-2 h-2 rotate-45 bg-[#C9A24B] rounded-[2px] group-hover:rotate-90 transition-transform duration-300"
              />
              <span className="font-editorial text-[1.35rem] sm:text-[1.8rem] font-bold tracking-[0.06em] text-[#0F3D2E] leading-none whitespace-nowrap">
                {isHi ? t('common.brandShort') : STORE_CONFIG.brandDisplayName}
              </span>
            </div>
            <span className="text-[8.5px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[#9C7725] mt-1 font-semibold whitespace-nowrap">
              {STORE_CONFIG.tagline}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden min-[1100px]:flex items-center gap-3.5 xl:gap-5"
          >
            <NavLink to="/" end className={navLinkClass}>
              {t('nav.home')}
            </NavLink>

            <div
              className="relative shrink-0"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCategoriesOpen((prev) => !prev)}
                aria-expanded={categoriesOpen}
                className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-[13px] xl:text-sm font-medium tracking-wide text-[#1B1B1B]/85 hover:text-[#0F3D2E] py-1.5 cursor-pointer"
              >
                <span>{t('nav.shop')}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#9C7725] transition-transform duration-200 ${
                    categoriesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    transition={{ duration: prefersReduced ? 0 : 0.18, ease: GG_EASE }}
                    className="absolute left-0 top-full pt-2.5 w-80 z-50"
                  >
                    <div className="rounded-[20px] bg-[#FFFDF8] border border-[#0F3D2E]/12 gg-shadow-elevated p-3 space-y-1">
                      <Link
                        to="/shop"
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-sm font-semibold text-[#0F3D2E] bg-[#F3EAD7]/60 hover:bg-[#F3EAD7] transition-colors"
                      >
                        <span>{t('nav.allProducts')}</span>
                        <span className="text-[10px] uppercase tracking-wider text-[#9C7725]">
                          7 Collections
                        </span>
                      </Link>
                      <div className="h-px bg-[#0F3D2E]/10 my-1.5" />
                      {SAMPLE_CATEGORIES.map((category) => (
                        <Link
                          key={category.id}
                          to={`/shop/${category.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center justify-between px-3.5 py-2 rounded-[12px] text-sm text-[#1B1B1B] hover:bg-[#F3EAD7]/55 hover:text-[#0F3D2E] transition-colors"
                        >
                          <span className="font-medium">{categoryLabel(category.slug, category.name)}</span>
                          <span className="text-[10px] uppercase tracking-wider text-[#9C7725]">
                            {category.eyebrow}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/shop/desi-ghee" className={navLinkClass}>
              {categoryLabel('desi-ghee', 'Desi Ghee')}
            </NavLink>
            <NavLink to="/shop/mithai" className={navLinkClass}>
              {isHi ? 'मिठाई' : 'Mithai'}
            </NavLink>
            <NavLink to="/shop/special-combos" className={navLinkClass}>
              {isHi ? 'स्पेशल कॉम्बो' : 'Special Combos'}
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              {t('nav.ourStory')}
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              {t('nav.visitStore')}
            </NavLink>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <LanguageSwitch variant="header" hideOnMobile className="mr-0.5" />

            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label={language === 'en' ? 'Toggle product search' : t('nav.searchAria')}
              className="w-9 h-9 sm:w-10 sm:h-10 inline-flex items-center justify-center rounded-full text-[#0F3D2E] hover:bg-[#0F3D2E]/6 transition-colors cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <Link
              to="/wishlist"
              aria-label={`${t('nav.wishlistAria')} (${wishlistCount} saved)`}
              className="relative hidden sm:inline-flex w-10 h-10 items-center justify-center rounded-full text-[#0F3D2E] hover:bg-[#0F3D2E]/6 transition-colors"
            >
              <Heart className="w-[18px] h-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#D96B27] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to={isAuthenticated ? '/account' : '/login'}
              aria-label={isAuthenticated ? t('nav.accountAria') : 'Customer account'}
              className="hidden sm:inline-flex w-10 h-10 items-center justify-center rounded-full text-[#0F3D2E] hover:bg-[#0F3D2E]/6 transition-colors"
            >
              <User className="w-[18px] h-[18px]" />
            </Link>

            <button
              type="button"
              onClick={openDrawer}
              aria-label={`${t('nav.cartAria')} (${itemCount} items)`}
              className="relative inline-flex items-center gap-2 px-3 sm:px-3.5 h-10 rounded-full bg-[#0F3D2E] text-[#FBF7EE] hover:bg-[#155742] transition-colors gg-shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#E8D08B]" />
              <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">
                {t('nav.cartLabel')}
              </span>
              {itemCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#C9A24B] text-[#0F3D2E] text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Inline Expandable Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.2, ease: GG_EASE }}
              className="overflow-hidden border-t border-[#0F3D2E]/10"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="py-3.5 flex items-center gap-2 max-w-2xl mx-auto"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#5A554C] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('nav.searchPlaceholder')}
                    aria-label="Search products"
                    autoFocus
                    className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-full bg-[#FFFDF8] border border-[#0F3D2E]/18 text-sm text-[#1B1B1B] placeholder:text-[#5A554C]/70 focus:outline-none focus:border-[#0F3D2E] focus:ring-2 focus:ring-[#C9A24B]/30"
                  />
                </div>
                <Button type="submit" variant="forest" size="md">
                  {t('nav.searchButton')}
                </Button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search bar"
                  className="w-10 h-10 inline-flex items-center justify-center rounded-full text-[#5A554C] hover:text-[#0F3D2E] hover:bg-[#0F3D2E]/6 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: prefersReduced ? 0 : 0.2, ease: GG_EASE }}
            className="min-[1100px]:hidden border-t border-[#0F3D2E]/12 bg-[#FFFDF8] px-4 py-5 space-y-5 max-h-[82vh] overflow-y-auto gg-shadow-elevated"
          >
            <LanguageSwitch variant="mobile" />

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                aria-label="Mobile search products"
                className="flex-1 min-h-[44px] px-4 py-2 rounded-full bg-[#FBF7EE] border border-[#0F3D2E]/18 text-sm focus:outline-none focus:border-[#0F3D2E]"
              />
              <Button type="submit" variant="forest" size="sm" className="min-h-[44px]">
                {isHi ? 'खोजें' : 'Go'}
              </Button>
            </form>

            <div className="space-y-1">
              <p className="gg-eyebrow text-[#9C7725] px-2 pb-1">
                {t('nav.exploreStorefront')}
              </p>
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-[#0F3D2E] hover:bg-[#F3EAD7]/60 rounded-[12px]"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-[#0F3D2E] hover:bg-[#F3EAD7]/60 rounded-[12px]"
              >
                {language === 'en' ? 'Shop All Products' : t('nav.allProducts')}
              </Link>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {SAMPLE_CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    to={`/shop/${category.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-[10px] bg-[#FBF7EE] border border-[#0F3D2E]/10 text-xs font-medium text-[#1B1B1B] hover:border-[#C9A24B] hover:text-[#0F3D2E]"
                  >
                    {categoryLabel(category.slug, category.name)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#0F3D2E]/10 grid grid-cols-2 gap-2.5 text-sm">
              <Button
                to="/about"
                variant="secondary"
                size="sm"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.ourStory')}
              </Button>
              <Button
                to="/contact"
                variant="secondary"
                size="sm"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.visitStore')}
              </Button>
              <Button
                to={isAuthenticated ? '/account' : '/login'}
                variant="ghost"
                size="sm"
                className="bg-[#F3EAD7]/70"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.accountLabel')}
              </Button>
              <Button
                to="/wishlist"
                variant="ghost"
                size="sm"
                className="bg-[#F3EAD7]/70"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.wishlistAria')} ({wishlistCount})
              </Button>
              <Button
                to="/cart"
                variant="primary"
                size="md"
                fullWidth
                className="col-span-2"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.viewCart')} ({itemCount})
              </Button>
            </div>

            <div className="pt-2 border-t border-[#0F3D2E]/10 flex items-center justify-between text-xs text-[#5A554C]">
              <span>{language === 'en' ? STORE_CONFIG.hours : t('storeCard.timingsValue')}</span>
              <a
                href={STORE_CONFIG.phoneHref}
                className="inline-flex items-center gap-1 font-semibold text-[#0F3D2E]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{STORE_CONFIG.phone}</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
