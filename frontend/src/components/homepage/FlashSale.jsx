import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Zap, ArrowRight } from 'lucide-react';
import ProductCard from '../common/ProductCard';

function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let timer;
    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculateTime();
    timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-accent-rose" />
      <div className="flex gap-1.5">
        {[
          { value: timeLeft.hours, label: 'H' },
          { value: timeLeft.minutes, label: 'M' },
          { value: timeLeft.seconds, label: 'S' },
        ].map(({ value, label }) => (
          <div key={label} className="flex items-center">
            <span className="bg-gradient-to-r from-accent-rose to-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-xs text-surface-400 ml-0.5">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FlashSale({ flashSale }) {
  if (!flashSale || !flashSale.items || flashSale.items.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="section-premium">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4 sm:gap-0">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-rose/10 text-accent-rose rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Limited Time
            </span>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white leading-tight">
                {flashSale.name}
              </h2>
              <CountdownTimer endDate={flashSale.end_date} />
            </div>
            {flashSale.description && (
              <p className="text-surface-500 dark:text-surface-400 mt-4 max-w-lg text-lg">
                {flashSale.description}
              </p>
            )}
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
          {flashSale.items.map((item) => (
            <Link key={item.id} to={`/products/${item.product_slug || item.product_id}`}>
              <ProductCard
                product={{
                  id: item.product_id,
                  slug: item.product_slug || String(item.product_id),
                  name: item.product_name,
                  price: item.product_price,
                  discount_price: item.sale_price,
                  images: typeof item.product_image === 'string' ? item.product_image : '',
                  rating: 0,
                  review_count: 0,
                  stock_quantity: item.stock_quantity ?? null,
                  is_new_arrival: false,
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
