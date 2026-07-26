import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, LayoutGrid, ChevronRight } from 'lucide-react';
import { categoryService } from '../services/api/categoryService';
import { homeService } from '../services/api/homeService';
import CategoryBanner from '../components/category/CategoryBanner';
import ProductCard from '../components/common/ProductCard';
import SearchBar from '../components/common/SearchBar';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SEO from '../components/seo/SEO';
import { ItemListJsonLd } from '../components/seo/JsonLd';

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsLoading, setProductsLoading] = useState(false);

  const fetchProducts = async (categoryId) => {
    setProductsLoading(true);
    try {
      const response = await homeService.getProducts({ category: categoryId, limit: 12 });
      if (response.success) {
        setProducts(response.data);
      }
    } catch {
      // Products fetch failed silently
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await categoryService.getCategoryBySlug(slug);
        if (response.success) {
          setData(response.data);
          if (response.data.category?.id) {
            fetchProducts(response.data.category.id);
          }
        } else {
          setError('Category not found');
        }
      } catch {
        setError('Category not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-marsana-600 animate-spin" />
          <p className="text-surface-500 dark:text-surface-400">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            {error || 'Category not found'}
          </p>
          <Link to="/categories" className="btn-marsana">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const { category, children } = data;
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: category.name },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
      <SEO
        title={category.name}
        description={category.description || `Shop ${category.name} products on Marsana`}
        url={`/categories/${category.slug}`}
        breadcrumbs={breadcrumbs}
      />
      <ItemListJsonLd items={products} name={category.name} />
      <Header />

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 overflow-x-auto">
        <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-surface-500 dark:text-surface-400 whitespace-nowrap">
          <li>
            <Link to="/" className="hover:text-marsana-600 dark:hover:text-marsana-400 transition-colors">
              Home
            </Link>
          </li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li>
            <Link to="/categories" className="hover:text-marsana-600 dark:hover:text-marsana-400 transition-colors">
              Categories
            </Link>
          </li>
          {category.parent && (
            <>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li>
                <Link
                  to={`/categories/${category.parent.slug}`}
                  className="hover:text-marsana-600 dark:hover:text-marsana-400 transition-colors"
                >
                  {category.parent.name}
                </Link>
              </li>
            </>
          )}
          <li><ChevronRight className="w-4 h-4" /></li>
          <li className="text-surface-900 dark:text-white font-medium">{category.name}</li>
        </ol>
      </nav>

      <CategoryBanner category={category} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children && children.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <h2 className="text-lg sm:text-2xl font-bold text-surface-900 dark:text-white mb-4 sm:mb-6">
              Subcategories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {children.map((child) => (
                <Link
                  key={child.id}
                  to={`/categories/${child.slug}`}
                  className="group bg-white dark:bg-surface-900 rounded-2xl overflow-hidden shadow-sm border border-surface-200 dark:border-surface-800 hover:shadow-lg hover:border-marsana-200 dark:hover:border-marsana-800 transition-all duration-300"
                >
                  <div className="aspect-square bg-surface-100 dark:bg-surface-800 overflow-hidden">
                    {child.image_url ? (
                      <img
                        src={child.image_url}
                        alt={child.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10 text-surface-300 dark:text-surface-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 text-center">
                    <h3 className="font-medium text-sm sm:text-base text-surface-900 dark:text-white group-hover:text-marsana-600 dark:group-hover:text-marsana-400 transition-colors truncate">
                      {child.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-surface-900 dark:text-white">Products</h2>
            <Link
              to={`/products?category=${category.id}`}
              className="text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 font-medium text-sm transition-colors"
            >
              View All →
            </Link>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-marsana-600 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
              <LayoutGrid className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
              <p className="text-surface-500 dark:text-surface-400">
                No products in this category yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <Link key={product.id} to={`/products/${product.slug}`}>
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
