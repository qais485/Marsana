import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';

export default function RelatedProducts({ title = 'Related Products', products = [] }) {
  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.slug || product.id}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </div>
  );
}
