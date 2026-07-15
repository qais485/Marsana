import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Brands({ brands = [] }) {
  if (brands.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Brand</h2>
            <p className="text-gray-600 mt-1">Explore top brands</p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            All Brands
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.slice(0, 6).map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand=${brand.id}`}
              className="group flex items-center justify-center p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-300"
            >
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="max-h-12 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-lg font-semibold text-gray-600 group-hover:text-primary-600 transition-colors">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            All Brands
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
