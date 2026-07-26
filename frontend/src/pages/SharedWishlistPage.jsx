import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { wishlistService } from '../services/api/wishlistService';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SEO from '../components/seo/SEO';

export default function SharedWishlistPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSharedWishlist = async () => {
      try {
        const response = await wishlistService.getSharedWishlist(token);
        if (response.success) {
          setData(response.data);
        } else {
          setError('Wishlist not found');
        }
      } catch {
        setError('Wishlist not found or has been removed');
      } finally {
        setLoading(false);
      }
    };
    loadSharedWishlist();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-marsana-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-surface-300 dark:text-surface-600" />
          </div>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
            Wishlist Not Found
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">{error}</p>
          <Link to="/" className="btn-marsana">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
      <SEO title="Shared Wishlist" noindex />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
            {data.owner_name}'s Wishlist
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm sm:text-base">
            {data.item_count} items saved
          </p>
        </div>

        {data.items.length === 0 ? (
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-8 sm:p-12 text-center border border-surface-200 dark:border-surface-800 shadow-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-surface-300 dark:text-surface-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-surface-900 dark:text-white mb-2">
              This wishlist is empty
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mb-4 sm:mb-6 text-sm sm:text-base">
              No items have been saved yet
            </p>
            <Link to="/products" className="btn-marsana">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {data.items.map((item) => (
              <Link
                key={item.id}
                to={item.product_slug ? `/products/${item.product_slug}` : '#'}
                className="bg-white dark:bg-surface-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-surface-200 dark:border-surface-800 hover:shadow-lg hover:border-marsana-200 dark:hover:border-marsana-800 transition-all duration-300"
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-surface-100 dark:bg-surface-800 rounded-xl flex-shrink-0 overflow-hidden">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-surface-300 dark:text-surface-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-surface-900 dark:text-white truncate">
                      {item.product_name}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-marsana-600 dark:text-marsana-400 mt-1">
                      ${item.product_price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/products" className="btn-marsana">
            Browse Products
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
