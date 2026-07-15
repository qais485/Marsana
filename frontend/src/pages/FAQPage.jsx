import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, ChevronDown, ChevronUp, Search } from 'lucide-react';
import api from '../services/api/client';

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

  const filteredFaqs = faqs.filter((faq) =>
    !search || faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-600">Find answers to common questions about our products and services.</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!activeCategory ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${activeCategory === cat ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">No FAQ items found.</p></div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  {expandedId === faq.id ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
                </button>
                {expandedId === faq.id && (
                  <div className="px-6 pb-4 text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-50 pt-3">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-3">Can&apos;t find what you&apos;re looking for?</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Contact Us</Link>
        </div>
      </main>
    </div>
  );
}
