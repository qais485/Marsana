import { Link } from 'react-router-dom';

export default function CategoryBanner({ category }) {
  if (!category) return null;

  return (
    <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between">
          <div className="max-w-2xl">
            {category.parent && (
              <Link
                to={`/categories/${category.parent?.slug}`}
                className="text-primary-200 hover:text-white text-sm mb-2 inline-block transition-colors"
              >
                {category.parent?.name}
              </Link>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-primary-100 mb-6">{category.description}</p>
            )}
            <Link
              to={`/products?category=${category.id}`}
              className="inline-block bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Shop Now
            </Link>
          </div>
          {category.image_url && (
            <div className="hidden lg:block">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-64 h-64 object-cover rounded-xl"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
