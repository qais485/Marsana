import { Star, Quote, ArrowRight } from 'lucide-react';

export default function Testimonials({ testimonials = [] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="section-premium">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-marsana-50 dark:bg-marsana-950 text-marsana-600 dark:text-marsana-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Star className="w-3.5 h-3.5 fill-current" />
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mt-3 leading-tight">
            What Our Customers Say
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mt-4 max-w-lg mx-auto text-lg">
            Real reviews from real people who love our products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative bg-white dark:bg-surface-900 rounded-3xl p-8 shadow-soft border border-surface-100/50 dark:border-surface-800/50 hover:shadow-float hover:-translate-y-2 transition-all duration-500 ease-out-expo"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-marsana-50 dark:bg-marsana-950 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Quote className="w-6 h-6 text-marsana-300 dark:text-marsana-600" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-surface-200 dark:text-surface-700'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-surface-600 dark:text-surface-300 mb-8 leading-relaxed text-sm">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {testimonial.customer_avatar ? (
                  <img
                    src={testimonial.customer_avatar}
                    alt={testimonial.customer_name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-surface-100 dark:ring-surface-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-marsana-500 to-accent-violet flex items-center justify-center ring-2 ring-surface-100 dark:ring-surface-800">
                    <span className="text-white font-semibold text-sm">
                      {testimonial.customer_name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white">
                    {testimonial.customer_name}
                  </p>
                  {testimonial.customer_title && (
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      {testimonial.customer_title}
                    </p>
                  )}
                </div>
              </div>

              {/* Decorative Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-marsana-500 via-accent-violet to-accent-cyan rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
