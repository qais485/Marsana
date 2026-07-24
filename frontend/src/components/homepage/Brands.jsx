import { Link } from 'react-router-dom';
import { ArrowRight, Award } from 'lucide-react';

export default function Brands({ brands = [] }) {
  if (brands.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="section-premium">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-amber/10 text-accent-amber rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <Award className="w-3.5 h-3.5" />
              Trusted Partners
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mt-3 leading-tight">
              Shop by Brand
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-4 max-w-lg text-lg">
              Explore our curated collection of top brands
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 bg-marsana-50 dark:bg-marsana-950 hover:bg-marsana-100 dark:hover:bg-marsana-900 rounded-2xl transition-all duration-200 group"
          >
            All Brands
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {brands.slice(0, 6).map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand=${brand.id}`}
              className="group flex items-center justify-center p-8 bg-white dark:bg-surface-900 rounded-3xl border border-surface-100/50 dark:border-surface-800/50 shadow-soft hover:shadow-float hover:-translate-y-2 hover:border-marsana-100 dark:hover:border-marsana-900 transition-all duration-500 ease-out-expo"
            >
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="max-h-14 max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <span className="text-lg font-bold text-surface-500 dark:text-surface-400 group-hover:text-marsana-600 dark:group-hover:text-marsana-400 transition-colors duration-200">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium text-marsana-600 dark:text-marsana-400 bg-marsana-50 dark:bg-marsana-950 hover:bg-marsana-100 dark:hover:bg-marsana-900 rounded-2xl transition-all duration-200"
          >
            All Brands
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
