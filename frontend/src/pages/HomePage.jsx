import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, LayoutDashboard, User, LogIn, Shield, ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationDropdown from '../components/common/NotificationDropdown';
import { homeService } from '../services/api/homeService';
import MiniCart from '../components/cart/MiniCart';
import MegaMenu from '../components/common/MegaMenu';
import SearchBar from '../components/common/SearchBar';
import HeroBanner from '../components/homepage/HeroBanner';
import FeaturedProducts from '../components/homepage/FeaturedProducts';
import BestSellers from '../components/homepage/BestSellers';
import NewArrivals from '../components/homepage/NewArrivals';
import Categories from '../components/homepage/Categories';
import FlashSale from '../components/homepage/FlashSale';
import RecommendedProducts from '../components/homepage/RecommendedProducts';
import Brands from '../components/homepage/Brands';
import Testimonials from '../components/homepage/Testimonials';
import BlogSection from '../components/homepage/BlogSection';
import Newsletter from '../components/homepage/Newsletter';
import PromotionalBanners from '../components/homepage/PromotionalBanners';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        const response = await homeService.getHomepageData();
        if (response.success) {
          setHomepageData(response.data);
        } else {
          setError('Failed to load homepage data');
        }
      } catch {
        setError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-500">Loading homepage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-600">
              E-Commerce
            </Link>
            <div className="flex-1 mx-6">
              <SearchBar />
            </div>
            <nav className="flex items-center gap-4">
              <MegaMenu />
              <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">
                Products
              </Link>
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                    <User className="h-4 w-4" />
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
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
      <HeroBanner banners={homepageData?.hero_banners || []} />
      <Categories categories={homepageData?.categories || []} />
      <FeaturedProducts products={homepageData?.featured_products || []} />
      <FlashSale flashSale={homepageData?.flash_sale} />
      <BestSellers products={homepageData?.best_sellers || []} />
      <PromotionalBanners banners={homepageData?.promotional_banners || []} />
      <NewArrivals products={homepageData?.new_arrivals || []} />
      <RecommendedProducts products={homepageData?.recommended_products || []} />
      <Brands brands={homepageData?.brands || []} />
      <Testimonials testimonials={homepageData?.testimonials || []} />
      <BlogSection posts={homepageData?.blog_posts || []} />
      <Newsletter />
    </div>
  );
}
