import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productService } from '../services/api/productService';
import { formatPrice } from '../utils/format';
import MiniCart from '../components/cart/MiniCart';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProductGallery from '../components/catalog/ProductGallery';
import ProductVariants from '../components/catalog/ProductVariants';
import ProductAttributes from '../components/catalog/ProductAttributes';
import ProductSpecifications from '../components/catalog/ProductSpecifications';
import ProductTags from '../components/catalog/ProductTags';
import ProductReviews from '../components/catalog/ProductReviews';
import RelatedProducts from '../components/catalog/RelatedProducts';
import SEO from '../components/seo/SEO';
import { ProductJsonLd } from '../components/seo/JsonLd';

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
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-marsana-500 to-accent-violet flex items-center justify-center animate-glow-pulse">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-marsana-500 animate-spin" />
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="text-center">
          <p className="text-surface-600 dark:text-surface-400 mb-4">{error || 'Product not found'}</p>
          <Link to="/products" className="btn-marsana">Back to Products</Link>
        </div>
      </div>
    );
  }

  const { product, images, variants, attributes, specifications, tags, reviews, rating_summary, related_products, similar_products } = data;

  const currentPrice = selectedVariant?.discount_price || product.discount_price || product.price;
  const productImage = images?.[0]?.image_url || product.images_list?.[0]?.image_url;
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.name },
  ];
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
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-surface-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <SEO
        title={product.name}
        description={product.short_description || product.description?.substring(0, 160)}
        image={productImage}
        url={`/products/${product.slug}`}
        type="product"
        breadcrumbs={breadcrumbs}
      />
      <ProductJsonLd product={{ ...product, images, rating: rating_summary?.average_rating, review_count: rating_summary?.review_count }} />
      <Header />
      <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-18" />

      <main className="section-premium py-4 sm:py-6 lg:py-8">
        <nav className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mb-4 sm:mb-6 lg:mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-surface-700 dark:hover:text-surface-300 transition-colors">Home</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <Link to="/products" className="hover:text-surface-700 dark:hover:text-surface-300 transition-colors">Products</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-surface-900 dark:text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-10 lg:mb-16">
          <ProductGallery images={images} productName={product.name} />

          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div>
              {product.brand_name && (
                <p className="text-xs sm:text-sm text-marsana-600 dark:text-marsana-400 font-semibold mb-1.5 sm:mb-2">{product.brand_name}</p>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white leading-tight">{product.name}</h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                <div className="flex items-center gap-2">
                  {renderStars(product.rating)}
                  <span className="text-xs sm:text-sm text-surface-600 dark:text-surface-400">{product.rating} ({product.review_count} reviews)</span>
                </div>
                <div className="hidden sm:block text-surface-300 dark:text-surface-600">|</div>
                <span className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">{product.sold_count} sold</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <span className={`text-2xl sm:text-3xl font-bold ${hasDiscount ? 'text-accent-rose' : 'text-surface-900 dark:text-white'}`}>
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm sm:text-lg text-surface-400 line-through">{formatPrice(originalPrice)}</span>
                  <span className="text-xs sm:text-sm font-semibold text-accent-rose bg-accent-rose/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl">-{discountPercent}%</span>
                </>
              )}
            </div>

            {product.short_description && (
              <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300 leading-relaxed">{product.short_description}</p>
            )}

            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
              <span className="text-surface-500 dark:text-surface-400">SKU: {product.sku || 'N/A'}</span>
              <span className={`font-medium ${(selectedVariant?.stock_quantity ?? product.stock_quantity) > 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {(selectedVariant?.stock_quantity ?? product.stock_quantity) > 0 ? `In Stock (${selectedVariant?.stock_quantity ?? product.stock_quantity} available)` : 'Out of Stock'}
              </span>
            </div>

            <ProductVariants variants={variants} selectedVariant={selectedVariant} onSelectVariant={setSelectedVariant} />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center border border-surface-200 dark:border-surface-800 rounded-2xl self-start">
                <button onClick={() => handleQuantityChange(-1)} className="px-4 py-3 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-l-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">-</button>
                <span className="px-4 sm:px-5 py-3 text-surface-900 dark:text-white font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} className="px-4 py-3 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-r-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!isAuthenticated || addingToCart || (selectedVariant?.stock_quantity ?? product.stock_quantity) <= 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 min-h-[48px] ${
                  addedToCart ? 'bg-gradient-to-r from-accent-emerald to-emerald-500 text-white shadow-glow' : 'btn-marsana'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addedToCart ? <><Check className="w-5 h-5" /> Added to Cart</> : <><ShoppingCart className="w-5 h-5" /> {addingToCart ? 'Adding...' : 'Add to Cart'}</>}
              </button>

              <div className="flex gap-3 self-start">
                <button onClick={handleWishlistToggle} disabled={!isAuthenticated || wishlistLoading} className={`p-3.5 border rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[48px] flex items-center justify-center ${inWishlist ? 'border-accent-rose/30 bg-accent-rose/5 hover:bg-accent-rose/10' : 'border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800'}`}>
                  {wishlistLoading ? <Loader2 className="w-5 h-5 animate-spin text-surface-600" /> : <Heart className={`w-5 h-5 ${inWishlist ? 'text-accent-rose fill-accent-rose' : 'text-surface-600 dark:text-surface-400'}`} />}
                </button>

                <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="p-3.5 border border-surface-200 dark:border-surface-800 rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-surface-600 dark:text-surface-400">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-marsana-500" /> Free Shipping
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-surface-600 dark:text-surface-400">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-marsana-500" /> Secure Payment
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-surface-600 dark:text-surface-400">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-marsana-500" /> 30-Day Returns
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl lg:rounded-3xl border border-surface-100/50 dark:border-surface-800/50 p-4 sm:p-6 lg:p-8 mb-10 lg:mb-16 shadow-soft">
          <div className="flex overflow-x-auto border-b border-surface-100 dark:border-surface-800 mb-6 lg:mb-8 -mx-4 sm:mx-0 px-4 sm:px-0 gap-0">
            {['description', 'specifications', 'attributes', 'reviews'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 min-h-[44px] ${activeTab === tab ? 'border-marsana-500 text-marsana-600 dark:text-marsana-400' : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}{tab === 'reviews' && ` (${product.review_count})`}
              </button>
            ))}
          </div>

          <div>
            {activeTab === 'description' && (
              <div className="prose max-w-none text-surface-600 dark:text-surface-300">
                {product.description ? <p>{product.description}</p> : <p>No description available for this product.</p>}
              </div>
            )}
            {activeTab === 'specifications' && <ProductSpecifications specifications={specifications} />}
            {activeTab === 'attributes' && <ProductAttributes attributes={attributes} />}
            {activeTab === 'reviews' && <ProductReviews productId={product.id} initialReviews={reviews} initialRatingSummary={rating_summary} pagination={{ page: 1, pages: Math.ceil((rating_summary.total || 0) / 10) || 1 }} />}
          </div>
        </div>

        <ProductTags tags={tags} />

        <div className="mt-10 lg:mt-16 space-y-10 lg:space-y-16">
          <RelatedProducts title="Related Products" products={related_products} />
          <RelatedProducts title="You May Also Like" products={similar_products} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
