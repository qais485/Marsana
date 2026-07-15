import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Loader2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ShoppingCart,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { productService } from '../services/api/productService';
import ProductCard from '../components/common/ProductCard';
import SearchBar from '../components/common/SearchBar';
import FilterSidebar from '../components/common/FilterSidebar';
import ActiveFilters from '../components/common/ActiveFilters';
import { formatPrice } from '../utils/format';
import MiniCart from '../components/cart/MiniCart';

export default function ProductListPage() {
  const { itemCount } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    categories: [],
    price_range: { min: 0, max: 0 },
    sizes: [],
    colors: [],
  });
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentSort = searchParams.get('sort') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';

  const filters = {
    min_price: searchParams.get('min_price') || undefined,
    max_price: searchParams.get('max_price') || undefined,
    min_rating: searchParams.get('min_rating')
      ? parseFloat(searchParams.get('min_rating'))
      : undefined,
    in_stock: searchParams.has('in_stock')
      ? searchParams.get('in_stock') === 'true'
      : undefined,
    on_sale: searchParams.has('on_sale')
      ? searchParams.get('on_sale') === 'true'
      : undefined,
    sizes: searchParams.get('sizes')
      ? searchParams.get('sizes').split(',').filter(Boolean)
      : undefined,
    colors: searchParams.get('colors')
      ? searchParams.get('colors').split(',').filter(Boolean)
      : undefined,
    category_ids: searchParams.get('category_ids')
      ? searchParams.get('category_ids').split(',').filter(Boolean)
      : undefined,
    brand_ids: searchParams.get('brand_ids')
      ? searchParams.get('brand_ids').split(',').filter(Boolean)
      : undefined,
  };

  const hasActiveFilters =
    currentSort ||
    currentSearch ||
    currentCategory ||
    currentBrand ||
    filters.min_price ||
    filters.max_price ||
    filters.min_rating !== undefined ||
    filters.in_stock !== undefined ||
    filters.on_sale !== undefined ||
    (filters.sizes && filters.sizes.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.category_ids && filters.category_ids.length > 0) ||
    (filters.brand_ids && filters.brand_ids.length > 0);

  useEffect(() => {
    productService.getFilterOptions().then((response) => {
      if (response.success) setFilterOptions(response.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: currentPage, limit: 20 };
        if (currentSort) params.sort = currentSort;
        if (currentSearch) params.search = currentSearch;
        if (currentCategory) params.category = currentCategory;
        if (currentBrand) params.brand = currentBrand;
        if (filters.min_price) params.min_price = filters.min_price;
        if (filters.max_price) params.max_price = filters.max_price;
        if (filters.min_rating !== undefined) params.min_rating = filters.min_rating;
        if (filters.in_stock !== undefined) params.in_stock = filters.in_stock;
        if (filters.on_sale !== undefined) params.on_sale = filters.on_sale;
        if (filters.sizes) params.sizes = filters.sizes.join(',');
        if (filters.colors) params.colors = filters.colors.join(',');
        if (filters.category_ids) params.category_ids = filters.category_ids.join(',');
        if (filters.brand_ids) params.brand_ids = filters.brand_ids.join(',');

        const response = await productService.getProducts(params);
        if (response.success) {
          setProducts(response.data.products || response.data);
          setPagination(response.data.pagination || {});
        } else {
          setError('Failed to load products');
        }
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, currentPage, currentSort, currentSearch, currentCategory, currentBrand, filters.min_price, filters.max_price, filters.min_rating, filters.in_stock, filters.on_sale, filters.sizes, filters.colors, filters.category_ids, filters.brand_ids]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','));
        } else {
          params.delete(key);
        }
      } else {
        params.set(key, String(value));
      }
    });
    if (!('page' in updates)) params.delete('page');
    setSearchParams(params);
  };

  const handleFilterChange = (updates) => {
    updateParams(updates);
  };

  const handleRemoveFilter = (keys, replacement) => {
    const params = new URLSearchParams(searchParams);
    keys.forEach((key) => params.delete(key));
    if (replacement) {
      Object.entries(replacement).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (!Array.isArray(value) && value !== undefined) {
          params.set(key, String(value));
        }
      });
    }
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
                Home
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
            </nav>
          </div>
        </div>
      </header>
      <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            {pagination.total > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {products.length} of {pagination.total} products
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                showFilters
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-500'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-500'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sort by: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="best_selling">Best Selling</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
              <option value="alpha_asc">Name: A to Z</option>
              <option value="alpha_desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mb-4">
            <ActiveFilters
              filters={filters}
              filterOptions={filterOptions}
              onRemove={handleRemoveFilter}
            />
          </div>
        )}

        <div className="flex gap-6">
          {showFilters && (
            <aside className="w-64 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>
                <FilterSidebar
                  filterOptions={filterOptions}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearAll={clearFilters}
                />
              </div>
            </aside>
          )}

          {showFilters && (
            <div
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div
                className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700 mb-4"
                    >
                      Clear all filters
                    </button>
                  )}
                  <FilterSidebar
                    filterOptions={filterOptions}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearAll={clearFilters}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <p className="mt-3 text-gray-500">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-2">No products found</p>
                <p className="text-gray-400 text-sm mb-4">
                  Try adjusting your filters or search terms
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-4'
                  }
                >
                  {products.map((product) =>
                    viewMode === 'grid' ? (
                      <Link key={product.id} to={`/products/${product.slug}`}>
                        <ProductCard product={product} />
                      </Link>
                    ) : (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug}`}
                        className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={
                              typeof product.images === 'string'
                                ? product.images.split(',').filter(Boolean)[0]
                                : Array.isArray(product.images) && product.images.length > 0
                                ? product.images[0]
                                : 'https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image'
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {product.short_description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`text-lg font-bold ${
                                product.discount_price ? 'text-red-600' : 'text-gray-900'
                              }`}
                            >
                              {formatPrice(product.discount_price || product.price)}
                            </span>
                            {product.discount_price && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  )}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => updateParams({ page: currentPage - 1 })}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => updateParams({ page })}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            page === currentPage
                              ? 'bg-primary-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => updateParams({ page: currentPage + 1 })}
                      disabled={currentPage === pagination.pages}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
