import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Search, Eye, BookOpen } from 'lucide-react';
import api from '../services/api/client';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

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

  const filteredArticles = articles.filter(
    (a) =>
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-surface-600 dark:text-surface-400 hover:text-marsana-600 dark:hover:text-marsana-400 mb-4 sm:mb-6 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Help Center</span>
          </button>
          <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-4 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="px-2 py-1 bg-marsana-50 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-300 rounded text-xs font-medium capitalize">
                {selectedArticle.category.replace('-', ' ')}
              </span>
              <span className="text-xs text-surface-400 dark:text-surface-500">
                {selectedArticle.view_count} views
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-surface-900 dark:text-white mb-4 sm:mb-6">
              {selectedArticle.title}
            </h1>
            <div className="prose prose-sm max-w-none text-surface-700 dark:text-surface-300 whitespace-pre-wrap">
              {selectedArticle.content}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-3">
            Help Center
          </h1>
          <p className="text-surface-600 dark:text-surface-400 text-sm sm:text-base">
            Browse our guides and tutorials to get the most out of our platform.
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles..."
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
                {cat.replace('-', ' ')}
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
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
            <p className="text-surface-500 dark:text-surface-400">No help articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="text-left bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-4 sm:p-5 hover:shadow-lg hover:border-marsana-200 dark:hover:border-marsana-800 transition-all duration-300 min-h-[44px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-marsana-50 dark:bg-marsana-900/30 text-marsana-700 dark:text-marsana-300 rounded text-xs font-medium capitalize">
                    {article.category.replace('-', ' ')}
                  </span>
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-white mb-1">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-3 text-xs text-surface-400 dark:text-surface-500">
                  <Eye className="w-3 h-3" />
                  <span>{article.view_count} views</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="text-center mt-12 pt-8 border-t border-surface-200 dark:border-surface-800">
          <p className="text-surface-600 dark:text-surface-400 mb-3">Still need help?</p>
          <Link to="/contact" className="btn-marsana inline-flex items-center gap-2">
            Contact Support
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
