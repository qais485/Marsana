import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShoppingCart, ArrowLeft, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import CouponInput from '../components/cart/CouponInput';
import GiftCardInput from '../components/cart/GiftCardInput';
import LoyaltyRedeem from '../components/cart/LoyaltyRedeem';
import ShippingSelector from '../components/cart/ShippingSelector';
import SavedForLater from '../components/cart/SavedForLater';
import MiniCart from '../components/cart/MiniCart';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { cart, loading, itemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-xl font-bold text-primary-600">
                E-Commerce
              </Link>
            </div>
          </div>
        </header>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-500 mb-6">Sign in to view your cart and start shopping</p>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="btn-primary">
                Sign In
              </Link>
              <Link to="/products" className="btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-xl font-bold text-primary-600">
                E-Commerce
              </Link>
            </div>
          </div>
        </header>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <p className="text-gray-500">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-600">
              E-Commerce
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">
                Products
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                    Profile
                  </Link>
                  <Link
                    to="/wishlist"
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                    {wishlistItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => setMiniCartOpen(true)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Open cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            to="/products"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Shopping Cart ({cart.summary?.item_count || 0}{' '}
          {cart.summary?.item_count === 1 ? 'item' : 'items'})
        </h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything to your cart yet</p>
            <Link to="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              <SavedForLater />
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24 space-y-6">
                <CartSummary />

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Coupon Code</p>
                    <CouponInput />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Gift Card</p>
                    <GiftCardInput />
                  </div>
                  <LoyaltyRedeem />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <ShippingSelector />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
