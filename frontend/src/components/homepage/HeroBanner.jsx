import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import ParticleHeroBackground from './ParticleHeroBackground';

export default function HeroBanner({ banners = [] }) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + banners.length) % banners.length);
  }, [current, banners.length, goTo]);

  const goNext = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, banners.length, goTo]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [banners.length, goNext]);

  if (banners.length === 0) {
    return (
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Particle Background */}
        <ParticleHeroBackground />

        <div className="section-premium relative z-10 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-full text-sm font-medium mb-8 border border-white/20 animate-fade-up opacity-0">
              <Sparkles className="w-4 h-4 text-accent-amber" />
              <span className="text-white/90">Welcome to Marsana</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1] animate-fade-up opacity-0 stagger-1">
              Discover
              <span className="block bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                Amazing Products
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up opacity-0 stagger-2">
              Shop the latest trends with unbeatable prices, premium quality, and an experience that feels as good as it looks.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up opacity-0 stagger-3">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-marsana-700 font-semibold rounded-2xl hover:shadow-premium-xl hover:-translate-y-1 transition-all duration-300 ease-out-expo"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/categories"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300 ease-out-expo"
              >
                Browse Categories
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-16 animate-fade-up opacity-0 stagger-4">
              {[
                { value: '10K+', label: 'Products' },
                { value: '50K+', label: 'Happy Customers' },
                { value: '4.9', label: 'Average Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-surface-950">
      <div className="relative h-[500px] sm:h-[600px] lg:h-[700px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out-expo ${
              index === current
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
          >
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-950/80 via-surface-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950/60 via-transparent to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="section-premium w-full">
                <div className="max-w-2xl">
                  <div className={`transition-all duration-700 delay-200 ${
                    index === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                      {banner.title}
                    </h2>
                    {banner.subtitle && (
                      <p className="text-lg sm:text-xl text-white/70 mb-8 max-w-lg leading-relaxed">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.button_text && banner.link_url && (banner.link_url.startsWith('http://') || banner.link_url.startsWith('https://')) && (
                      <a
                        href={banner.link_url}
                        className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-marsana-500 to-accent-violet text-white font-semibold rounded-2xl hover:shadow-glow-lg hover:-translate-y-1 transition-all duration-300 ease-out-expo"
                      >
                        {banner.button_text}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white rounded-2xl transition-all duration-300 border border-white/10 hover:shadow-glass-lg hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white rounded-2xl transition-all duration-300 border border-white/10 hover:shadow-glass-lg hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`transition-all duration-500 ease-out-expo rounded-full ${
                  index === current
                    ? 'w-10 h-3 bg-white'
                    : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
