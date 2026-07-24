import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '../common/ProductCard';

export default function FeaturedProducts({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-surface-900/50">
      <div className="section-premium">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-marsana-50 dark:bg-marsana-950 text-marsana-600 dark:text-marsana-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Curated Selection
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mt-3 leading-tight">
              Featured Products
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-4 max-w-lg text-lg">
              Handpicked selections just for you
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 bg-marsana-50 dark:bg-marsana-950 hover:bg-marsana-100 dark:hover:bg-marsana-900 rounded-2xl transition-all duration-200 group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <Link key={product.id} to={`/products/${product.slug}`}>
              <ProductCard product={product} />
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium text-marsana-600 dark:text-marsana-400 bg-marsana-50 dark:bg-marsana-950 hover:bg-marsana-100 dark:hover:bg-marsana-900 rounded-2xl transition-all duration-200"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
