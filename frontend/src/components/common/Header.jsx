import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import NotificationDropdown from './NotificationDropdown';
import MiniCart from '../cart/MiniCart';

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const { itemCount, fetchCart } = useCart();
  const { itemCount: wishlistItemCount, fetchWishlist } = useWishlist();
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  return (
    <>
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
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                      Admin
                    </Link>
                  )}
                  <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                    Profile
                  </Link>
                  <NotificationDropdown />
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
              ) : (
                <>
                  <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </>
  );
}
