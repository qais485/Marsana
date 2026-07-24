import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { homeService } from '../services/api/homeService';
import MegaMenu from '../components/common/MegaMenu';
import SearchBar from '../components/common/SearchBar';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
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
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-marsana-500 to-accent-violet flex items-center justify-center animate-glow-pulse">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-marsana-500 animate-spin" />
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-accent-rose/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">!</span>
          </div>
          <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-marsana"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-18" />

      {/* Mobile Search */}
      <div className="md:hidden sticky top-16 z-40 bg-white/80 dark:bg-surface-950/80 backdrop-blur-2xl border-b border-surface-100/50 dark:border-surface-800/50 px-4 py-3">
        <SearchBar />
      </div>

      <main>
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
      </main>

      <Footer />
    </div>
  );
}
