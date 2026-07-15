import { Link } from 'react-router-dom';
import { ArrowRight, ThumbsUp } from 'lucide-react';
import ProductCard from '../common/ProductCard';

export default function RecommendedProducts({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ThumbsUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Recommended for You</h2>
              <p className="text-gray-600 mt-1">Based on ratings and reviews</p>
            </div>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.slug}`}>
              <ProductCard product={product} />
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
