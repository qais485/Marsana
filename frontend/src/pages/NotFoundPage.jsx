import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Package } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20 flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-lg w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-6 sm:mb-8">
          <div className="text-[8rem] sm:text-[10rem] lg:text-[14rem] font-black text-transparent bg-gradient-to-b from-marsana-200 to-surface-200 dark:from-marsana-800 dark:to-surface-800 bg-clip-text select-none leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-marsana-500 to-accent-violet flex items-center justify-center shadow-glow animate-bounce-gentle">
              <Package className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-3 sm:mb-4">
          Page Not Found
        </h1>
        <p className="text-surface-500 dark:text-surface-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/"
            className="btn-marsana group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] w-full sm:w-auto hover:-translate-y-1"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/products"
            className="btn-outline group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] w-full sm:w-auto hover:-translate-y-1"
          >
            <Search className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
