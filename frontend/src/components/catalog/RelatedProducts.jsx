import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';

export default function RelatedProducts({ title = 'Related Products', products = [] }) {
  if (products.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-surface-900">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.slug || product.id}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </div>
  );
}
