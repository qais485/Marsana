import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';
import TwoFactorSetupPage from '../pages/auth/TwoFactorSetupPage';
import Verify2FAPage from '../pages/auth/Verify2FAPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import HomePage from '../pages/HomePage';
import ProductListPage from '../pages/ProductListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CategoryListPage from '../pages/CategoryListPage';
import CategoryDetailPage from '../pages/CategoryDetailPage';
import SearchPage from '../pages/SearchPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import InvoicePage from '../pages/InvoicePage';
import WishlistPage from '../pages/WishlistPage';
import SharedWishlistPage from '../pages/SharedWishlistPage';
import LoyaltyPage from '../pages/LoyaltyPage';
import ReferralPage from '../pages/ReferralPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminProductListPage from '../pages/admin/AdminProductListPage';
import AdminProductFormPage from '../pages/admin/AdminProductFormPage';
import AdminProductImportPage from '../pages/admin/AdminProductImportPage';
import AdminProductExportPage from '../pages/admin/AdminProductExportPage';
import AdminCouponPage from '../pages/admin/AdminCouponPage';
import AdminFlashSalePage from '../pages/admin/AdminFlashSalePage';
import ContactPage from '../pages/ContactPage';
import FAQPage from '../pages/FAQPage';
import HelpCenterPage from '../pages/HelpCenterPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-2fa" element={<Verify2FAPage />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProductListPage /></AdminRoute>} />
        <Route path="/admin/products/new" element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
        <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
        <Route path="/admin/products/import" element={<AdminRoute><AdminProductImportPage /></AdminRoute>} />
        <Route path="/admin/products/export" element={<AdminRoute><AdminProductExportPage /></AdminRoute>} />
        <Route path="/admin/coupons" element={<AdminRoute><AdminCouponPage /></AdminRoute>} />
        <Route path="/admin/flash-sales" element={<AdminRoute><AdminFlashSalePage /></AdminRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/2fa-setup" element={<ProtectedRoute><TwoFactorSetupPage /></ProtectedRoute>} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
