import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Loader2, ArrowLeft, ShoppingBag, Tag } from 'lucide-react';
import { searchService } from '../services/api/searchService';
import ProductCard from '../components/common/ProductCard';

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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Products</h1>
          <p className="text-gray-600">
            Use the search bar above to find products and categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Search results for &ldquo;{query}&rdquo;
          </h1>
          {pagination && (
            <p className="text-gray-600 mt-1">
              {pagination.total} {pagination.total === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try different
              keywords.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse All Products
            </Link>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {results.map((item) => {
                if (item.type === 'category') {
                  return (
                    <Link
                      key={item.id}
                      to={`/categories/${item.slug}`}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tag className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
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
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(
                  (page) => (
                    <Link
                      key={page}
                      to={`/search?q=${encodeURIComponent(query)}&page=${page}`}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === pagination.page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
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
    </div>
  );
}
