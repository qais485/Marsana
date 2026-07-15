import { Link } from 'react-router-dom';

export default function PromotionalBanners({ banners = [] }) {
  if (banners.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.slice(0, 2).map((banner) => (
            <Link
              key={banner.id}
              to={banner.link_url || '/'}
              className="group relative overflow-hidden rounded-xl bg-gray-900 aspect-[16/7]"
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
              <div className="absolute inset-0 flex items-center p-6 sm:p-8">
                <div className="max-w-xs">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-200 mb-4">{banner.subtitle}</p>
                  )}
                  {banner.button_text && (
                    <span className="inline-block bg-white text-gray-900 font-semibold px-5 py-2 rounded-lg text-sm group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      {banner.button_text}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
