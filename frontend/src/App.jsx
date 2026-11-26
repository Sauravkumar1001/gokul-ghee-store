import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ErrorBoundary from './components/common/ErrorBoundary';

const SearchPage = lazy(() => import('./pages/SearchPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const StyleGuidePage = lazy(() => import('./pages/StyleGuidePage'));
const GheeUsageMeterPage = lazy(() => import('./pages/GheeUsageMeterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage'));
const AdminDeliveryPage = lazy(() => import('./pages/admin/AdminDeliveryPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminUsageMeterPage = lazy(() => import('./pages/admin/AdminUsageMeterPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

function AdminRouteSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-slate-600">
          Loading Admin Workspace...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function StorefrontRouteSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] bg-[#FBF7EE] py-16 px-4 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/35 flex items-center justify-center text-[#9A7624] shadow-xs">
            <span className="w-5 h-5 border-2 border-[#0F3D2E] border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
            GOKUL GHEE
          </span>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

import { LanguageProvider } from './context/LanguageContext';

export function AppRoutes() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Routes>
              {/* Visually Independent Admin Panel Routes */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            <Route
              path="/admin/login"
              element={
                <AdminRouteSuspense>
                  <AdminLoginPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRouteSuspense>
                  <AdminDashboardPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRouteSuspense>
                  <AdminProductsPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRouteSuspense>
                  <AdminCategoriesPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRouteSuspense>
                  <AdminOrdersPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AdminRouteSuspense>
                  <AdminCustomersPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <AdminRouteSuspense>
                  <AdminInventoryPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/delivery"
              element={
                <AdminRouteSuspense>
                  <AdminDeliveryPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <AdminRouteSuspense>
                  <AdminCouponsPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <AdminRouteSuspense>
                  <AdminReviewsPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminRouteSuspense>
                  <AdminAnalyticsPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/ai-usage"
              element={
                <AdminRouteSuspense>
                  <AdminUsageMeterPage />
                </AdminRouteSuspense>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRouteSuspense>
                  <AdminSettingsPage />
                </AdminRouteSuspense>
              }
            />

            {/* Customer Storefront Routes */}
            <Route
              path="*"
              element={
                <MainLayout>
                  <StorefrontRouteSuspense>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/shop/:category" element={<ShopPage />} />
                      <Route path="/product/:slug" element={<ProductDetailPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/account/orders" element={<OrdersPage />} />
                      <Route path="/account/orders/:id" element={<OrderDetailPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/faq" element={<FaqPage />} />
                      <Route path="/privacy-policy" element={<PolicyPage type="privacy" />} />
                      <Route path="/terms" element={<PolicyPage type="terms" />} />
                      <Route path="/refund-policy" element={<PolicyPage type="refund" />} />
                      <Route path="/styleguide" element={<StyleGuidePage />} />
                      <Route path="/ghee-meter" element={<GheeUsageMeterPage />} />
                      <Route path="/purity-guide" element={<GheeUsageMeterPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </StorefrontRouteSuspense>
                </MainLayout>
              }
            />
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
