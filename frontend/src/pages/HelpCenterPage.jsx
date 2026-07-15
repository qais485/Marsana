import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Search, Eye, BookOpen } from 'lucide-react';
import api from '../services/api/client';

export default function HelpCenterPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params = {};
        if (activeCategory) params.category = activeCategory;
        const response = await api.get('/support/help', { params });
        if (response.data.success) setArticles(response.data.data);
      } catch {
        setError('Failed to load help articles');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [activeCategory]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/support/help/categories');
        if (response.data.success) setCategories(response.data.data);
      } catch {}
    };
    fetchCategories();
  }, []);

  const filteredArticles = articles.filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Help Center</span>
            </button>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium capitalize">{selectedArticle.category.replace('-', ' ')}</span>
              <span className="text-xs text-gray-400">{selectedArticle.view_count} views</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{selectedArticle.title}</h1>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{selectedArticle.content}</div>
          </div>
        </main>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Help Center</h1>
          <p className="text-gray-600">Browse our guides and tutorials to get the most out of our platform.</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles..."
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
                {cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No help articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="text-left bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-medium capitalize">{article.category.replace('-', ' ')}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                {article.excerpt && <p className="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>}
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <Eye className="w-3 h-3" />
                  <span>{article.view_count} views</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-3">Still need help?</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Contact Support</Link>
        </div>
      </main>
    </div>
  );
}
