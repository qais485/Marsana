import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PromotionalBanners({ banners = [] }) {
  if (banners.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="section-premium">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.slice(0, 2).map((banner) => (
            <Link
              key={banner.id}
              to={banner.link_url || '/'}
              className="group relative overflow-hidden rounded-[2rem] bg-surface-900 aspect-[16/7]"
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out-expo"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-950/80 via-surface-950/50 to-transparent" />
              <div className="absolute inset-0 flex items-center p-8 sm:p-10">
                <div className="max-w-xs">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-sm text-white/70 mb-6 leading-relaxed">{banner.subtitle}</p>
                  )}
                  {banner.button_text && (
                    <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl text-white font-semibold px-6 py-3 rounded-2xl text-sm border border-white/20 group-hover:bg-white group-hover:text-surface-900 transition-all duration-300 group-hover:shadow-premium-lg">
                      {banner.button_text}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
