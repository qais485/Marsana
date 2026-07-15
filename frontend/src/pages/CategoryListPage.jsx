import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, LayoutGrid } from 'lucide-react';
import { categoryService } from '../services/api/categoryService';
import SearchBar from '../components/common/SearchBar';

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.success) {
          setCategories(response.data);
        } else {
          setError('Failed to load categories');
        }
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
              <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">
                Products
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
          <p className="text-gray-600 mt-2">Browse our product categories</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20">
            <LayoutGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                      <LayoutGrid className="w-16 h-16 text-primary-200" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">
                      {category.product_count || 0} products
                    </span>
                    {category.children && category.children.length > 0 && (
                      <span className="text-sm text-primary-600">
                        {category.children.length} subcategories
                      </span>
                    )}
                  </div>
                  {category.children && category.children.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {category.children.slice(0, 4).map((child) => (
                        <span
                          key={child.id}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {child.name}
                        </span>
                      ))}
                      {category.children.length > 4 && (
                        <span className="text-xs text-gray-400">
                          +{category.children.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
