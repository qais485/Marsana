import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';

const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const ProductListPage = lazy(() => import('../pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CategoryListPage = lazy(() => import('../pages/CategoryListPage'));
const CategoryDetailPage = lazy(() => import('../pages/CategoryDetailPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('../pages/OrderConfirmationPage'));
const OrderHistoryPage = lazy(() => import('../pages/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage'));
const OrderTrackingPage = lazy(() => import('../pages/OrderTrackingPage'));
const InvoicePage = lazy(() => import('../pages/InvoicePage'));
const WishlistPage = lazy(() => import('../pages/WishlistPage'));
const SharedWishlistPage = lazy(() => import('../pages/SharedWishlistPage'));
const LoyaltyPage = lazy(() => import('../pages/LoyaltyPage'));
const ReferralPage = lazy(() => import('../pages/ReferralPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const FAQPage = lazy(() => import('../pages/FAQPage'));
const HelpCenterPage = lazy(() => import('../pages/HelpCenterPage'));

const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const AdminProductListPage = lazy(() => import('../pages/admin/AdminProductListPage'));
const AdminProductFormPage = lazy(() => import('../pages/admin/AdminProductFormPage'));
const AdminProductImportPage = lazy(() => import('../pages/admin/AdminProductImportPage'));
const AdminProductExportPage = lazy(() => import('../pages/admin/AdminProductExportPage'));
const AdminCouponPage = lazy(() => import('../pages/admin/AdminCouponPage'));
const AdminFlashSalePage = lazy(() => import('../pages/admin/AdminFlashSalePage'));
const AdminUserListPage = lazy(() => import('../pages/admin/AdminUserListPage'));
const AdminUserDetailPage = lazy(() => import('../pages/admin/AdminUserDetailPage'));
const AdminInventoryPage = lazy(() => import('../pages/admin/AdminInventoryPage'));
const AdminWarehousePage = lazy(() => import('../pages/admin/AdminWarehousePage'));
const AdminInventoryHistoryPage = lazy(() => import('../pages/admin/AdminInventoryHistoryPage'));
const AdminStockAlertsPage = lazy(() => import('../pages/admin/AdminStockAlertsPage'));
const AdminMarketingHubPage = lazy(() => import('../pages/admin/AdminMarketingHubPage'));
const AdminEmailCampaignsPage = lazy(() => import('../pages/admin/AdminEmailCampaignsPage'));
const AdminSMSCampaignsPage = lazy(() => import('../pages/admin/AdminSMSCampaignsPage'));
const AdminPushCampaignsPage = lazy(() => import('../pages/admin/AdminPushCampaignsPage'));
const AdminAffiliatePage = lazy(() => import('../pages/admin/AdminAffiliatePage'));
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-marsana-500 to-accent-violet flex items-center justify-center shadow-glow animate-glow-pulse">
          <span className="text-white font-bold text-xl">M</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-marsana-500/30 border-t-marsana-500 rounded-full animate-spin" />
          <span className="text-sm font-medium text-surface-500 dark:text-surface-400">Loading...</span>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUserListPage /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProductListPage /></AdminRoute>} />
          <Route path="/admin/products/new" element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
          <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
          <Route path="/admin/products/import" element={<AdminRoute><AdminProductImportPage /></AdminRoute>} />
          <Route path="/admin/products/export" element={<AdminRoute><AdminProductExportPage /></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><AdminCouponPage /></AdminRoute>} />
          <Route path="/admin/flash-sales" element={<AdminRoute><AdminFlashSalePage /></AdminRoute>} />
          <Route path="/admin/inventory" element={<AdminRoute><AdminInventoryPage /></AdminRoute>} />
          <Route path="/admin/inventory/warehouses" element={<AdminRoute><AdminWarehousePage /></AdminRoute>} />
          <Route path="/admin/inventory/history" element={<AdminRoute><AdminInventoryHistoryPage /></AdminRoute>} />
          <Route path="/admin/inventory/low-stock" element={<AdminRoute><AdminStockAlertsPage alertType="low_stock" /></AdminRoute>} />
          <Route path="/admin/inventory/out-of-stock" element={<AdminRoute><AdminStockAlertsPage alertType="out_of_stock" /></AdminRoute>} />
          <Route path="/admin/marketing" element={<AdminRoute><AdminMarketingHubPage /></AdminRoute>} />
          <Route path="/admin/marketing/email" element={<AdminRoute><AdminEmailCampaignsPage /></AdminRoute>} />
          <Route path="/admin/marketing/sms" element={<AdminRoute><AdminSMSCampaignsPage /></AdminRoute>} />
          <Route path="/admin/marketing/push" element={<AdminRoute><AdminPushCampaignsPage /></AdminRoute>} />
          <Route path="/admin/marketing/affiliates" element={<AdminRoute><AdminAffiliatePage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
          <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />

          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/categories" element={<CategoryListPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/wishlist/shared/:token" element={<SharedWishlistPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/orders/:id/invoice" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
          <Route path="/track-order" element={<OrderTrackingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
  );
}
