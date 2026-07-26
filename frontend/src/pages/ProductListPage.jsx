import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Loader2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { productService } from '../services/api/productService';
import ProductCard from '../components/common/ProductCard';
import SearchBar from '../components/common/SearchBar';
import SEO from '../components/seo/SEO';
import FilterSidebar from '../components/common/FilterSidebar';
import ActiveFilters from '../components/common/ActiveFilters';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
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
    min_rating: searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')) : undefined,
    in_stock: searchParams.has('in_stock') ? searchParams.get('in_stock') === 'true' : undefined,
    on_sale: searchParams.has('on_sale') ? searchParams.get('on_sale') === 'true' : undefined,
    sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',').filter(Boolean) : undefined,
    colors: searchParams.get('colors') ? searchParams.get('colors').split(',').filter(Boolean) : undefined,
    category_ids: searchParams.get('category_ids') ? searchParams.get('category_ids').split(',').filter(Boolean) : undefined,
    brand_ids: searchParams.get('brand_ids') ? searchParams.get('brand_ids').split(',').filter(Boolean) : undefined,
  };

  const hasActiveFilters =
    currentSort || currentSearch || currentCategory || currentBrand ||
    filters.min_price || filters.max_price || filters.min_rating !== undefined ||
    filters.in_stock !== undefined || filters.on_sale !== undefined ||
    (filters.sizes && filters.sizes.length > 0) || (filters.colors && filters.colors.length > 0) ||
    (filters.category_ids && filters.category_ids.length > 0) || (filters.brand_ids && filters.brand_ids.length > 0);

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
  }, [searchParams]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else if (Array.isArray(value)) {
        if (value.length > 0) params.set(key, value.join(','));
        else params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    if (!('page' in updates)) params.delete('page');
    setSearchParams(params);
  };

  const handleFilterChange = (updates) => updateParams(updates);
  const handleRemoveFilter = (keys, replacement) => {
    const params = new URLSearchParams(searchParams);
    keys.forEach((key) => params.delete(key));
    if (replacement) {
      Object.entries(replacement).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) params.set(key, value.join(','));
        else if (!Array.isArray(value) && value !== undefined) params.set(key, String(value));
      });
    }
    params.delete('page');
    setSearchParams(params);
  };
  const clearFilters = () => setSearchParams({});

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <SEO
        title="Products"
        description="Browse our wide selection of quality products at competitive prices on Marsana."
        url="/products"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Products' },
        ]}
      />
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-18" />

      {/* Mobile Sticky Filter/Sort Bar */}
      <div className="sticky top-16 lg:top-18 z-30 bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl border-b border-surface-100/50 dark:border-surface-800/50 lg:hidden">
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-2xl text-sm font-medium transition-all duration-200 flex-shrink-0 min-h-[44px] ${
              showFilters
                ? 'bg-marsana-50 dark:bg-marsana-950 border-marsana-300 dark:border-marsana-700 text-marsana-700 dark:text-marsana-400'
                : 'border-surface-200 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <select
            value={currentSort}
            onChange={(e) => updateParams({ sort: e.target.value || undefined })}
            className="px-4 py-2.5 border border-surface-200 dark:border-surface-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-marsana-500/20 bg-white dark:bg-surface-900 text-surface-900 dark:text-white flex-shrink-0 min-h-[44px]"
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

      <main className="section-premium py-6 lg:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white">
              Products
            </h1>
            {pagination.total > 0 && (
              <p className="text-surface-500 dark:text-surface-400 mt-1 lg:mt-2 text-sm lg:text-base">
                Showing {products.length} of {pagination.total} products
              </p>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-2xl text-sm font-medium transition-all duration-200 ${
                showFilters
                  ? 'bg-marsana-50 dark:bg-marsana-950 border-marsana-300 dark:border-marsana-700 text-marsana-700 dark:text-marsana-400'
                  : 'border-surface-200 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <div className="flex items-center border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-marsana-50 dark:bg-marsana-950 text-marsana-600 dark:text-marsana-400' : 'text-surface-400'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'list' ? 'bg-marsana-50 dark:bg-marsana-950 text-marsana-600 dark:text-marsana-400' : 'text-surface-400'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value || undefined })}
              className="px-4 py-2.5 border border-surface-200 dark:border-surface-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-marsana-500/20 bg-white dark:bg-surface-900 text-surface-900 dark:text-white"
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

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6">
            <ActiveFilters filters={filters} filterOptions={filterOptions} onRemove={handleRemoveFilter} />
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className={`${showFilters ? 'w-64' : 'w-0'} flex-shrink-0 hidden lg:block transition-all duration-300`}>
            {showFilters && (
              <div className="sticky top-24 bg-white dark:bg-surface-900 rounded-3xl border border-surface-100/50 dark:border-surface-800/50 p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-surface-900 dark:text-white">Filters</h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 flex items-center gap-1">
                      <X className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>
                <FilterSidebar filterOptions={filterOptions} filters={filters} onFilterChange={handleFilterChange} onClearAll={clearFilters} />
              </div>
            )}
          </aside>

          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" />
              <div className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:left-0 sm:w-80 max-h-[85vh] sm:max-h-full bg-white dark:bg-surface-950 sm:rounded-none rounded-t-3xl shadow-premium-xl overflow-y-auto overscroll-contain animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-sm text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 mb-4 min-h-[44px]">
                      Clear all filters
                    </button>
                  )}
                  <FilterSidebar filterOptions={filterOptions} filters={filters} onFilterChange={handleFilterChange} onClearAll={clearFilters} />
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-marsana-500 to-accent-violet flex items-center justify-center animate-glow-pulse mb-4">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-marsana-500 animate-spin" />
                  <span className="text-sm font-medium text-surface-500 dark:text-surface-400">Loading products...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-accent-rose/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-9 h-9 text-accent-rose" />
                </div>
                <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-marsana">Try Again</button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-9 h-9 text-surface-300 dark:text-surface-600" />
                </div>
                <p className="text-surface-900 dark:text-white text-lg font-semibold mb-2">No products found</p>
                <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">
                  Try adjusting your filters or search terms
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-marsana">Clear Filters</button>
                )}
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6' : 'space-y-3 sm:space-y-4'}>
                  {products.map((product) =>
                    viewMode === 'grid' ? (
                      <Link key={product.id} to={`/products/${product.slug}`}>
                        <ProductCard product={product} />
                      </Link>
                    ) : (
                      <Link key={product.id} to={`/products/${product.slug}`} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-surface-900 rounded-2xl sm:rounded-3xl border border-surface-100/50 dark:border-surface-800/50 hover:shadow-float hover:-translate-y-1 transition-all duration-300">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0 bg-surface-100 dark:bg-surface-800 rounded-xl sm:rounded-2xl overflow-hidden">
                          <img
                            src={typeof product.images === 'string' ? product.images.split(',').filter(Boolean)[0] : Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : 'https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-surface-900 dark:text-white truncate text-sm sm:text-base">{product.name}</h3>
                          <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">{product.short_description}</p>
                          <div className="flex items-center gap-2 mt-2 sm:mt-3">
                            <span className={`text-base sm:text-lg font-bold ${product.discount_price ? 'text-accent-rose' : 'text-surface-900 dark:text-white'}`}>
                              {formatPrice(product.discount_price || product.price)}
                            </span>
                            {product.discount_price && (
                              <span className="text-xs sm:text-sm text-surface-400 line-through">{formatPrice(product.price)}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  )}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-1.5 sm:gap-2 mt-8 lg:mt-12 pb-4">
                    <button
                      onClick={() => updateParams({ page: currentPage - 1 })}
                      disabled={currentPage === 1}
                      className="px-3 sm:px-5 py-2.5 border border-surface-200 dark:border-surface-800 rounded-2xl text-sm hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px] min-w-[44px]"
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => updateParams({ page })}
                          className={`px-3 sm:px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 min-h-[44px] min-w-[44px] ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-marsana-500 to-accent-violet text-white shadow-glow-sm'
                              : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => updateParams({ page: currentPage + 1 })}
                      disabled={currentPage === pagination.pages}
                      className="px-3 sm:px-5 py-2.5 border border-surface-200 dark:border-surface-800 rounded-2xl text-sm hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px] min-w-[44px]"
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

      <Footer />
      <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </div>
  );
}
