import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, ChevronDown, ChevronUp, Search } from 'lucide-react';
import api from '../services/api/client';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SEO from '../components/seo/SEO';
import { FAQJsonLd } from '../components/seo/JsonLd';

function FAQItem({ faq, isExpanded, onToggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const measureAndAnimate = useCallback(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    if (isExpanded) {
      measureAndAnimate();
      setHasAnimated(true);
    } else if (hasAnimated) {
      measureAndAnimate();
      const timer = setTimeout(() => setHeight(0), 10);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, measureAndAnimate, hasAnimated]);

  useEffect(() => {
    const handleResize = () => {
      if (isExpanded && contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  return (
    <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors min-h-[44px]"
      >
        <span className="font-medium text-surface-900 dark:text-white pr-4 text-sm sm:text-base">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-surface-400 shrink-0 transition-transform duration-300 ease-out-expo ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out-expo"
        style={{ maxHeight: isExpanded ? `${height}px` : '0px' }}
      >
        <div ref={contentRef} className="px-4 sm:px-6 pb-4 text-sm text-surface-600 dark:text-surface-400 whitespace-pre-wrap border-t border-surface-50 dark:border-surface-800 pt-3">
          {faq.answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const params = {};
        if (activeCategory) params.category = activeCategory;
        const response = await api.get('/support/faq', { params });
        if (response.data.success) setFaqs(response.data.data);
      } catch {
        setError('Failed to load FAQ items');
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, [activeCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/support/faq/categories');
        if (response.data.success) setCategories(response.data.data);
      } catch {}
    };
    fetchCategories();
  }, []);

  const filteredFaqs = faqs.filter(
    (faq) =>
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to common questions about Marsana shopping, orders, returns, shipping, and more."
        url="/faq"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'FAQ' },
        ]}
      />
      <FAQJsonLd faqs={filteredFaqs} />
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-surface-600 dark:text-surface-400 text-sm sm:text-base">
            Find answers to common questions about our products and services.
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="input-premium !pl-12 w-full"
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] shrink-0 ${
                !activeCategory
                  ? 'bg-marsana-100 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-300'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors capitalize min-h-[44px] shrink-0 ${
                  activeCategory === cat
                    ? 'bg-marsana-100 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-300'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-marsana-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 dark:text-red-400">{error}</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
            <p className="text-surface-500 dark:text-surface-400">No FAQ items found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedId === faq.id}
                onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12 pt-8 border-t border-surface-200 dark:border-surface-800">
          <p className="text-surface-600 dark:text-surface-400 mb-3">
            Can't find what you're looking for?
          </p>
          <Link to="/contact" className="btn-marsana inline-flex items-center gap-2">
            Contact Us
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
