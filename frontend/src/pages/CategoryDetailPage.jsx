import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, LayoutGrid, ChevronRight } from 'lucide-react';
import { categoryService } from '../services/api/categoryService';
import { homeService } from '../services/api/homeService';
import CategoryBanner from '../components/category/CategoryBanner';
import ProductCard from '../components/common/ProductCard';
import SearchBar from '../components/common/SearchBar';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-500">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Category not found'}</p>
          <Link to="/categories" className="btn-primary">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const { category, children } = data;

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
              <Link to="/categories" className="text-sm text-gray-600 hover:text-gray-900">
                Categories
              </Link>
              <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">
                Products
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link to="/" className="hover:text-gray-700">Home</Link>
          </li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li>
            <Link to="/categories" className="hover:text-gray-700">Categories</Link>
          </li>
          {category.parent && (
            <>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li>
                <Link
                  to={`/categories/${category.parent.slug}`}
                  className="hover:text-gray-700"
                >
                  {category.parent.name}
                </Link>
              </li>
            </>
          )}
          <li><ChevronRight className="w-4 h-4" /></li>
          <li className="text-gray-900 font-medium">{category.name}</li>
        </ol>
      </nav>

      <CategoryBanner category={category} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children && children.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subcategories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {children.map((child) => (
                <Link
                  key={child.id}
                  to={`/categories/${child.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {child.image_url ? (
                      <img
                        src={child.image_url}
                        alt={child.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LayoutGrid className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {child.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <Link
              to={`/products?category=${category.id}`}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View All →
            </Link>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No products in this category yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Link key={product.id} to={`/products/${product.slug}`}>
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
