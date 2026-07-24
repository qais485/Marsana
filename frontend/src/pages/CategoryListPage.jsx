import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, LayoutGrid } from 'lucide-react';
import { categoryService } from '../services/api/categoryService';
import SearchBar from '../components/common/SearchBar';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

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
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-marsana-600 animate-spin" />
          <p className="text-surface-500 dark:text-surface-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-marsana">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white">
            All Categories
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-2 text-sm sm:text-base">
            Browse our product categories
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20">
            <LayoutGrid className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-500 dark:text-surface-400 text-lg">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="group bg-white dark:bg-surface-900 rounded-2xl overflow-hidden shadow-sm border border-surface-200 dark:border-surface-800 hover:shadow-lg hover:border-marsana-200 dark:hover:border-marsana-800 transition-all duration-300"
              >
                <div className="aspect-[16/9] bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-marsana-50 to-marsana-100 dark:from-marsana-900/30 dark:to-marsana-800/30">
                      <LayoutGrid className="w-10 h-10 sm:w-16 sm:h-16 text-marsana-200 dark:text-marsana-700" />
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-5">
                  <h2 className="text-sm sm:text-lg font-semibold text-surface-900 dark:text-white group-hover:text-marsana-600 dark:group-hover:text-marsana-400 transition-colors truncate">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 mt-1 sm:mt-2 line-clamp-2 hidden sm:block">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 sm:mt-4">
                    <span className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">
                      {category.product_count || 0} products
                    </span>
                    {category.children && category.children.length > 0 && (
                      <span className="text-xs sm:text-sm text-marsana-600 dark:text-marsana-400 hidden sm:inline">
                        {category.children.length} subcategories
                      </span>
                    )}
                  </div>
                  {category.children && category.children.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                      {category.children.slice(0, 4).map((child) => (
                        <span
                          key={child.id}
                          className="text-xs bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg truncate max-w-[80px] sm:max-w-none"
                        >
                          {child.name}
                        </span>
                      ))}
                      {category.children.length > 4 && (
                        <span className="text-xs text-surface-400 dark:text-surface-500">
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

      <Footer />
    </div>
  );
}
