import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Loader2, ArrowLeft, ShoppingBag, Tag } from 'lucide-react';
import { searchService } from '../services/api/searchService';
import ProductCard from '../components/common/ProductCard';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SEO from '../components/seo/SEO';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!query) return;

    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);
        const response = await searchService.search(query, page);
        if (response.success) {
          setResults(response.data || []);
          setPagination(response.pagination || null);
        } else {
          setError('Search failed. Please try again.');
        }
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query, page]);

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <Search className="w-10 h-10 sm:w-12 sm:h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white mb-2">
            Search Products
          </h1>
          <p className="text-surface-600 dark:text-surface-400 text-sm sm:text-base">
            Use the search bar above to find products and categories.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
      <SEO
        title={`Search results for "${query}"`}
        description={`Find products matching "${query}" on Marsana.`}
        url={`/search?q=${encodeURIComponent(query)}`}
        noindex
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
            Search results for &ldquo;{query}&rdquo;
          </h1>
          {pagination && (
            <p className="text-surface-600 dark:text-surface-400 mt-1">
              {pagination.total} {pagination.total === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-marsana-600 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
              No results found
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              We couldn't find anything matching &ldquo;{query}&rdquo;. Try different keywords.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 font-medium transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse All Products
            </Link>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {results.map((item) => {
                if (item.type === 'category') {
                  return (
                    <Link
                      key={item.id}
                      to={`/categories/${item.slug}`}
                      className="group bg-white dark:bg-surface-900 rounded-2xl overflow-hidden shadow-sm border border-surface-200 dark:border-surface-800 hover:shadow-lg hover:border-marsana-200 dark:hover:border-marsana-800 transition-all duration-300"
                    >
                      <div className="aspect-square bg-surface-100 dark:bg-surface-800 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tag className="w-8 h-8 sm:w-10 sm:h-10 text-surface-300 dark:text-surface-600" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-sm sm:text-base text-surface-900 dark:text-white group-hover:text-marsana-600 dark:group-hover:text-marsana-400 transition-colors truncate">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                }

                return (
                  <Link key={item.id} to={`/products/${item.slug}`}>
                    <ProductCard
                      product={{
                        id: item.id,
                        name: item.name,
                        slug: item.slug,
                        price: item.price,
                        images: item.image_url,
                        rating: item.rating,
                        review_count: item.review_count,
                      }}
                    />
                  </Link>
                );
              })}
            </div>

            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center gap-2 mt-6 sm:mt-8 flex-wrap">
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(
                  (page) => (
                    <Link
                      key={page}
                      to={`/search?q=${encodeURIComponent(query)}&page=${page}`}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        page === pagination.page
                          ? 'bg-marsana-600 text-white'
                          : 'bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                      }`}
                    >
                      {page}
                    </Link>
                  )
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
