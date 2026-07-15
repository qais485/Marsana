import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Zap } from 'lucide-react';
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
      <Clock className="w-4 h-4 text-red-500" />
      <div className="flex gap-1">
        {[
          { value: timeLeft.hours, label: 'H' },
          { value: timeLeft.minutes, label: 'M' },
          { value: timeLeft.seconds, label: 'S' },
        ].map(({ value, label }) => (
          <div key={label} className="flex items-center">
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-500 ml-0.5">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FlashSale({ flashSale }) {
  if (!flashSale || !flashSale.items || flashSale.items.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{flashSale.name}</h2>
                <CountdownTimer endDate={flashSale.end_date} />
              </div>
              {flashSale.description && (
                <p className="text-gray-600 mt-1">{flashSale.description}</p>
              )}
            </div>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View All
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
