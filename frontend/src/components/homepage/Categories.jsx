import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid } from 'lucide-react';

export default function Categories({ categories = [] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="section-premium">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-marsana-50 dark:bg-marsana-950 text-marsana-600 dark:text-marsana-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <LayoutGrid className="w-3.5 h-3.5" />
              Browse Collection
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mt-3 leading-tight">
              Shop by Category
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-4 max-w-lg text-lg">
              Browse our wide selection of categories
            </p>
          </div>
          <Link
            to="/categories"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 bg-marsana-50 dark:bg-marsana-950 hover:bg-marsana-100 dark:hover:bg-marsana-900 rounded-2xl transition-all duration-200 group"
          >
            All Categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categories.slice(0, 6).map((category, index) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-3xl bg-white dark:bg-surface-900 border border-surface-100/50 dark:border-surface-800/50 shadow-soft hover:shadow-float hover:-translate-y-2 transition-all duration-500 ease-out-expo"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="aspect-square bg-surface-50 dark:bg-surface-800 overflow-hidden">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out-expo"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-marsana-50 to-marsana-100 dark:from-marsana-950 dark:to-marsana-900">
                    <LayoutGrid className="w-10 h-10 text-marsana-300 dark:text-marsana-600" />
                  </div>
                )}
              </div>
              <div className="p-4 text-center">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white group-hover:text-marsana-600 dark:group-hover:text-marsana-400 transition-colors duration-200">
                  {category.name}
                </h3>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-marsana-500 to-accent-violet rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium text-marsana-600 dark:text-marsana-400 bg-marsana-50 dark:bg-marsana-950 hover:bg-marsana-100 dark:hover:bg-marsana-900 rounded-2xl transition-all duration-200"
          >
            All Categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
