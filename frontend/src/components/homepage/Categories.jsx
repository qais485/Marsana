import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid } from 'lucide-react';

export default function Categories({ categories = [] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-gray-600 mt-1">Browse our wide selection</p>
            </div>
          </div>
          <Link
            to="/categories"
            className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            All Categories
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <LayoutGrid className="w-10 h-10 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-3 text-center">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/categories"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            All Categories
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
