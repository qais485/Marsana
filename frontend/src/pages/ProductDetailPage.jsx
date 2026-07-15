import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productService } from '../services/api/productService';
import { formatPrice } from '../utils/format';
import MiniCart from '../components/cart/MiniCart';
import ProductGallery from '../components/catalog/ProductGallery';
import ProductVariants from '../components/catalog/ProductVariants';
import ProductAttributes from '../components/catalog/ProductAttributes';
import ProductSpecifications from '../components/catalog/ProductSpecifications';
import ProductTags from '../components/catalog/ProductTags';
import ProductReviews from '../components/catalog/ProductReviews';
import RelatedProducts from '../components/catalog/RelatedProducts';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart, itemCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productService.getProductDetail(slug);
        if (response.success) {
          setData(response.data);
          if (response.data.variants?.length > 0) {
            setSelectedVariant(response.data.variants[0]);
          }
        } else {
          setError('Product not found');
        }
      } catch {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
          <Link to="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const { product, images, variants, attributes, specifications, tags, reviews, rating_summary, related_products, similar_products } = data;

  const currentPrice = selectedVariant?.discount_price || product.discount_price || product.price;
  const originalPrice = selectedVariant?.price || product.price;
  const hasDiscount = currentPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    const maxStock = selectedVariant?.stock_quantity ?? product.stock_quantity;
    if (newQty >= 1 && newQty <= maxStock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || addingToCart || addedToCart) return;
    setAddingToCart(true);
    try {
      const variantId = selectedVariant?.id || null;
      await addToCart(product.id, quantity, variantId);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      // Error handled by context
    } finally {
      setAddingToCart(false);
    }
  };

  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
      } else {
        const primaryImage = images?.[0]?.image_url || null;
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: currentPrice,
          image: primaryImage,
        });
      }
    } catch {
      // Error handled by context
    } finally {
      setWishlistLoading(false);
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-600">
              E-Commerce
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">
                Products
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                    Profile
                  </Link>
                  <button
                    onClick={() => setMiniCartOpen(true)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Open cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-gray-700">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductGallery images={images} productName={product.name} />

          <div className="space-y-6">
            <div>
              {product.brand_name && (
                <p className="text-sm text-primary-600 font-medium mb-1">{product.brand_name}</p>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-2">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.review_count} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm text-gray-600">{product.sold_count} sold</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className={`text-3xl font-bold ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {product.short_description && (
              <p className="text-gray-600">{product.short_description}</p>
            )}

            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">SKU: {product.sku || 'N/A'}</span>
              <span className={`font-medium ${(selectedVariant?.stock_quantity ?? product.stock_quantity) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(selectedVariant?.stock_quantity ?? product.stock_quantity) > 0
                  ? `In Stock (${selectedVariant?.stock_quantity ?? product.stock_quantity} available)`
                  : 'Out of Stock'}
              </span>
            </div>

            <ProductVariants
              variants={variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-4 py-2 text-gray-900 font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!isAuthenticated || addingToCart || (selectedVariant?.stock_quantity ?? product.stock_quantity) <= 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'btn-primary'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </>
                )}
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={!isAuthenticated || wishlistLoading}
                className={`p-3 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  inWishlist
                    ? 'border-red-200 bg-red-50 hover:bg-red-100'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {wishlistLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                ) : (
                  <Heart className={`w-5 h-5 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                )}
              </button>

              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-gray-400" />
                Free Shipping
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-gray-400" />
                Secure Payment
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-5 h-5 text-gray-400" />
                30-Day Returns
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-12">
          <div className="flex border-b border-gray-100 mb-6">
            {['description', 'specifications', 'attributes', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${product.review_count})`}
              </button>
            ))}
          </div>

          <div>
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-600">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p>No description available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <ProductSpecifications specifications={specifications} />
            )}

            {activeTab === 'attributes' && (
              <ProductAttributes attributes={attributes} />
            )}

            {activeTab === 'reviews' && (
              <ProductReviews
                productId={product.id}
                initialReviews={reviews}
                initialRatingSummary={rating_summary}
                pagination={{ page: 1, pages: Math.ceil((rating_summary.total || 0) / 10) || 1 }}
              />
            )}
          </div>
        </div>

        <ProductTags tags={tags} />

        <div className="mt-12 space-y-12">
          <RelatedProducts title="Related Products" products={related_products} />
          <RelatedProducts title="You May Also Like" products={similar_products} />
        </div>
      </main>
    </div>
  );
}
