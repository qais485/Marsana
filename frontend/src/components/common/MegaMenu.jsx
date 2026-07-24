import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LayoutGrid, Loader2, ArrowRight, X } from 'lucide-react';
import { categoryService } from '../../services/api/categoryService';

export default function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      setLoading(true);
      setError(null);
      categoryService
        .getCategories()
        .then((response) => {
          if (response.success) {
            setCategories(response.data);
          }
        })
        .catch((err) => {
          console.error('Failed to load categories:', err);
          setError('Failed to load categories');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, categories.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveCategory(null);
    }, 200);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveCategory(null);
  };

  return (
    <div className="relative hidden lg:block" ref={menuRef} onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
          isOpen
            ? 'text-marsana-600 dark:text-marsana-400 bg-marsana-50 dark:bg-marsana-950'
            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        Categories
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Desktop Mega Menu - Full width dropdown */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-screen max-w-[900px] bg-white dark:bg-surface-950 backdrop-blur-2xl rounded-3xl shadow-premium-xl border border-surface-100 dark:border-surface-800 z-50 transition-all duration-300 origin-top ${
          isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-marsana-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-sm text-accent-rose">
            {error}
          </div>
        ) : (
          <div className="flex">
            {/* Category List */}
            <div className="w-64 xl:w-72 border-r border-surface-100 dark:border-surface-800 py-4 flex-shrink-0">
              <div className="overflow-y-auto max-h-[28rem]">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onMouseEnter={() => setActiveCategory(category)}
                    className={`w-full text-left px-5 xl:px-6 py-3 xl:py-3.5 min-h-[44px] text-sm transition-all duration-200 flex items-center justify-between ${
                      activeCategory?.id === category.id
                        ? 'bg-marsana-50 dark:bg-marsana-950 text-marsana-600 dark:text-marsana-400 font-medium'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-900 hover:text-surface-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">{category.name}</span>
                    {category.children && category.children.length > 0 && (
                      <ChevronDown className="w-4 h-4 -rotate-90 text-surface-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-surface-100 dark:border-surface-800 mt-3 pt-3 px-4">
                <Link
                  to="/categories"
                  onClick={() => handleClose()}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-marsana-600 dark:text-marsana-400 hover:bg-marsana-50 dark:hover:bg-marsana-950 rounded-xl transition-colors group"
                >
                  View All Categories
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Subcategories */}
            <div className="flex-1 p-6 xl:p-8 overflow-y-auto max-h-[32rem]">
              {activeCategory ? (
                <div className="animate-fade-in">
                  <h3 className="font-bold text-surface-900 dark:text-white mb-5">
                    <Link
                      to={`/categories/${activeCategory.slug}`}
                      onClick={() => handleClose()}
                      className="hover:text-marsana-600 dark:hover:text-marsana-400 transition-colors"
                    >
                      {activeCategory.name}
                    </Link>
                  </h3>
                  {activeCategory.children && activeCategory.children.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {activeCategory.children.map((child) => (
                        <Link
                          key={child.id}
                          to={`/categories/${child.slug}`}
                          onClick={() => handleClose()}
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-900 transition-all duration-200 group"
                        >
                          {child.image_url ? (
                            <img
                              src={child.image_url}
                              alt={child.name}
                              className="w-12 h-12 rounded-xl object-cover group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                              <LayoutGrid className="w-5 h-5 text-surface-400" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-white transition-colors truncate">
                            {child.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-surface-500 dark:text-surface-400">No subcategories</p>
                  )}
                  <Link
                    to={`/categories/${activeCategory.slug}`}
                    onClick={() => handleClose()}
                    className="inline-flex items-center gap-1 mt-5 text-sm font-medium text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 transition-colors group"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid className="w-8 h-8 text-surface-300 dark:text-surface-600" />
                  </div>
                  <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
                    Select a category to explore
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      setLoading(true);
      setError(null);
      categoryService
        .getCategories()
        .then((response) => {
          if (response.success) {
            setCategories(response.data);
          }
        })
        .catch((err) => {
          console.error('Failed to load categories:', err);
          setError('Failed to load categories');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, categories.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setActiveCategory(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
      >
        <LayoutGrid className="w-4 h-4" />
        Categories
      </button>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={handleClose}>
          <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-surface-950 rounded-t-3xl shadow-premium-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800 flex-shrink-0">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Categories</h2>
              <button
                onClick={handleClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-marsana-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-20 text-sm text-accent-rose">
                  {error}
                </div>
              ) : activeCategory ? (
                <div className="p-5">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="flex items-center gap-2 text-sm font-medium text-marsana-600 dark:text-marsana-400 mb-4 min-h-[44px]"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                    Back to all categories
                  </button>
                  <h3 className="font-bold text-surface-900 dark:text-white mb-4">
                    <Link
                      to={`/categories/${activeCategory.slug}`}
                      onClick={handleClose}
                      className="hover:text-marsana-600 dark:hover:text-marsana-400 transition-colors"
                    >
                      {activeCategory.name}
                    </Link>
                  </h3>
                  {activeCategory.children && activeCategory.children.length > 0 ? (
                    <div className="space-y-1">
                      {activeCategory.children.map((child) => (
                        <Link
                          key={child.id}
                          to={`/categories/${child.slug}`}
                          onClick={handleClose}
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-900 transition-all duration-200 min-h-[44px]"
                        >
                          {child.image_url ? (
                            <img
                              src={child.image_url}
                              alt={child.name}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                              <LayoutGrid className="w-5 h-5 text-surface-400" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-surface-700 dark:text-surface-300 truncate">
                            {child.name}
                          </span>
                          <ArrowRight className="w-4 h-4 text-surface-400 ml-auto flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-surface-500 dark:text-surface-400">No subcategories</p>
                  )}
                  <Link
                    to={`/categories/${activeCategory.slug}`}
                    onClick={handleClose}
                    className="flex items-center justify-center gap-2 mt-5 px-4 py-3 text-sm font-medium text-marsana-600 dark:text-marsana-400 bg-marsana-50 dark:bg-marsana-950 rounded-xl transition-colors min-h-[44px]"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="p-5 space-y-1">
                  <Link
                    to="/categories"
                    onClick={handleClose}
                    className="flex items-center gap-3 px-4 py-3.5 min-h-[44px] rounded-xl bg-marsana-50 dark:bg-marsana-950 text-marsana-600 dark:text-marsana-400 font-medium text-sm transition-colors"
                  >
                    <LayoutGrid className="w-5 h-5" />
                    View All Categories
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Link>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category)}
                      className="w-full flex items-center justify-between px-4 py-3.5 min-h-[44px] text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-900 hover:text-surface-900 dark:hover:text-white rounded-xl transition-all duration-200 text-left"
                    >
                      <span className="truncate">{category.name}</span>
                      {category.children && category.children.length > 0 && (
                        <ChevronDown className="w-4 h-4 -rotate-90 text-surface-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
