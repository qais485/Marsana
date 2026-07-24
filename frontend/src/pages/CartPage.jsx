import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import CouponInput from '../components/cart/CouponInput';
import GiftCardInput from '../components/cart/GiftCardInput';
import LoyaltyRedeem from '../components/cart/LoyaltyRedeem';
import ShippingSelector from '../components/cart/ShippingSelector';
import SavedForLater from '../components/cart/SavedForLater';
import MiniCart from '../components/cart/MiniCart';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { cart, loading, itemCount } = useCart();
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-marsana-100 dark:bg-marsana-900/30 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-marsana-500" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">
              Your cart is empty
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mb-8">
              Sign in to view your cart and start shopping
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="btn-marsana">
                Sign In
              </Link>
              <Link to="/products" className="btn-outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading && cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-marsana-500 animate-spin" />
              <div className="absolute inset-0 w-10 h-10 border-2 border-marsana-200 dark:border-marsana-800 rounded-full" />
            </div>
            <p className="text-surface-500 dark:text-surface-400 font-medium">Loading cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
      <Header />
      <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Link
            to="/products"
            className="text-xs sm:text-sm text-surface-500 hover:text-marsana-600 dark:text-surface-400 dark:hover:text-marsana-400 flex items-center gap-1 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white mb-6 lg:mb-8">
          Shopping Cart ({cart.summary?.item_count || 0}{' '}
          {cart.summary?.item_count === 1 ? 'item' : 'items'})
        </h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-marsana-50 dark:bg-marsana-950/30 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-marsana-400 dark:text-marsana-500" />
            </div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
              Your cart is empty
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our products and find something you love.
            </p>
            <Link to="/products" className="btn-marsana inline-flex items-center gap-2">
              <Package className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-surface-900 rounded-2xl lg:rounded-3xl border border-surface-100 dark:border-surface-800 p-3 sm:p-4 lg:p-6 shadow-soft">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              <SavedForLater />
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-surface-900 rounded-2xl lg:rounded-3xl border border-surface-100 dark:border-surface-800 p-4 sm:p-6 shadow-soft lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                <CartSummary />

                <div className="space-y-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                  <div>
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Coupon Code
                    </p>
                    <CouponInput />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Gift Card
                    </p>
                    <GiftCardInput />
                  </div>
                  <LoyaltyRedeem />
                </div>

                <div className="pt-4 border-t border-surface-100 dark:border-surface-800">
                  <ShippingSelector />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
