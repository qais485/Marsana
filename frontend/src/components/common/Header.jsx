import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X, Sun, Moon, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import MiniCart from '../cart/MiniCart';
import { MobileMegaMenu } from './MegaMenu';

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const { itemCount, fetchCart } = useCart();
  const { itemCount: wishlistItemCount, fetchWishlist } = useWishlist();
  const { theme, setTheme, isDark } = useTheme();
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 dark:bg-surface-950/80 backdrop-blur-2xl shadow-soft-md border-b border-surface-100/50 dark:border-surface-800/50'
            : 'bg-transparent'
        }`}
      >
        <div className="px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-marsana-500 via-marsana-600 to-accent-violet flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
                  <span className="text-white font-bold text-base sm:text-lg">M</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-marsana-500 to-accent-violet rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-surface-900 dark:text-white">
                  Marsana
                </span>
                <span className="text-[10px] font-medium text-marsana-500 dark:text-marsana-400 block leading-tight tracking-wider uppercase">
                  Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/products"
                className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
              >
                Products
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                >
                  Admin
                </Link>
              )}
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                  >
                    Profile
                  </Link>
                </>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search (desktop) */}
              <Link
                to="/search"
                className="hidden md:flex min-w-[44px] min-h-[44px] items-center justify-center text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  <NotificationDropdown />
                  <Link
                    to="/wishlist"
                    className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                    aria-label="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                    {wishlistItemCount > 0 && (
                      <span className="absolute top-1 right-1 bg-gradient-to-r from-accent-rose to-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-glow-rose">
                        {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => setMiniCartOpen(true)}
                    className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                    aria-label="Open cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute top-1 right-1 bg-gradient-to-r from-marsana-500 to-accent-violet text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-glow-sm">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex min-h-[44px] items-center px-4 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/login"
                    className="btn-marsana text-sm !px-4 sm:!px-5 !py-2.5 min-h-[44px]"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`lg:hidden fixed inset-0 top-14 sm:top-16 z-40 transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" />
          <nav
            className={`absolute inset-0 bg-white dark:bg-surface-950 overflow-y-auto transition-transform duration-300 ease-out ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3.5 min-h-[44px] text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
              >
                Products
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3.5 min-h-[44px] text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                >
                  Admin
                </Link>
              )}
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3.5 min-h-[44px] text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3.5 min-h-[44px] text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                  >
                    Profile
                  </Link>
                </>
              )}

              <MobileMegaMenu />

              {/* Mobile: Search link */}
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex md:hidden items-center gap-3 px-4 py-3.5 min-h-[44px] text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
              >
                <Search className="w-5 h-5" />
                Search
              </Link>

              {/* Mobile: Theme toggle */}
              <button
                onClick={toggleTheme}
                className="flex md:hidden items-center gap-3 w-full px-4 py-3.5 min-h-[44px] text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200 text-left"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>

              {!isAuthenticated && (
                <div className="pt-3 border-t border-surface-100 dark:border-surface-800 mt-3 space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3.5 min-h-[44px] text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3.5 min-h-[44px] text-sm font-medium text-marsana-600 dark:text-marsana-400 hover:bg-marsana-50 dark:hover:bg-marsana-950 rounded-xl transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </>
  );
}
