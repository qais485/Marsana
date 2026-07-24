import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Loader2, Tag, ShoppingBag, Command } from 'lucide-react';
import { searchService } from '../../services/api/searchService';
import { useAuth } from '../../context/AuthContext';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      setLoading(true);
      const response = await searchService.getSuggestions(searchQuery);
      if (response.success) {
        setSuggestions(response.data || []);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const loadInitialData = async () => {
      try {
        const popularResponse = await searchService.getPopularSearches(5);
        if (popularResponse.success) setPopularSearches(popularResponse.data || []);
      } catch { /* ignore */ }

      if (isAuthenticated) {
        try {
          const historyResponse = await searchService.getHistory(5);
          if (historyResponse.success) setHistory(historyResponse.data || []);
        } catch { /* ignore */ }
      } else {
        let stored;
        try {
          stored = JSON.parse(localStorage.getItem('search_history') || '[]');
        } catch {
          stored = [];
        }
        setHistory(stored);
      }
    };

    loadInitialData();
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const executeSearch = (searchQuery) => {
    const trimmed = (searchQuery || query).trim();
    if (!trimmed) return;

    if (isAuthenticated) {
      searchService.addToHistory(trimmed).catch(() => {});
    } else {
      let stored;
      try {
        stored = JSON.parse(localStorage.getItem('search_history') || '[]');
      } catch {
        stored = [];
      }
      const updated = [trimmed, ...stored.filter((s) => s !== trimmed)].slice(0, 10);
      localStorage.setItem('search_history', JSON.stringify(updated));
    }

    setIsOpen(false);
    setQuery('');
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e) => {
    const items = [
      ...suggestions.map((s) => s.name),
      ...history.map((h) => h.query || (typeof h === 'string' ? h : '')),
      ...popularSearches.map((p) => p.query),
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < items.length) {
        executeSearch(items[activeIndex]);
      } else {
        executeSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative group">
        <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 sm:w-5 sm:h-5 text-surface-400 group-focus-within:text-marsana-500 transition-colors duration-200" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, categories..."
          className="w-full pl-11 sm:pl-12 pr-4 sm:pr-20 py-3 sm:py-3.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-marsana-500/20 focus:border-marsana-500 focus:bg-white dark:focus:bg-surface-800 transition-all duration-300 min-h-[44px]"
        />
        <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-1.5">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded-lg text-[10px] text-surface-400 font-medium">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className={`absolute top-full left-0 right-0 mt-2 sm:mt-3 bg-white dark:bg-surface-900 backdrop-blur-2xl rounded-3xl shadow-premium-xl border border-surface-100 dark:border-surface-800 z-50 max-h-[70vh] sm:max-h-96 overflow-y-auto transition-all duration-300 origin-top ${
          isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
        }`}
      >
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-marsana-500 animate-spin" />
          </div>
        )}

        {!loading && suggestions.length > 0 && (
          <div className="p-2.5 sm:p-3">
            <p className="px-3 sm:px-4 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Suggestions
            </p>
            {suggestions.map((item, index) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => executeSearch(item.name)}
                className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 min-h-[44px] rounded-2xl text-left transition-all duration-200 ${
                  index === activeIndex
                    ? 'bg-marsana-50 dark:bg-marsana-950 text-marsana-700 dark:text-marsana-300'
                    : 'hover:bg-surface-50 dark:hover:bg-surface-800'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.type === 'product'
                    ? 'bg-marsana-100 dark:bg-marsana-900 text-marsana-600 dark:text-marsana-400'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'
                }`}>
                  {item.type === 'product' ? (
                    <ShoppingBag className="w-4 h-4" />
                  ) : (
                    <Tag className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-surface-400 capitalize">{item.type}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && suggestions.length === 0 && history.length > 0 && (
          <div className="p-2.5 sm:p-3">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Recent Searches
              </p>
            </div>
            {history.slice(0, 5).map((item, index) => {
              const queryText = item.query || item;
              return (
                <div
                  key={queryText}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-3 min-h-[44px] rounded-2xl transition-all duration-200 ${
                    index === activeIndex
                      ? 'bg-marsana-50 dark:bg-marsana-950 text-marsana-700 dark:text-marsana-300'
                      : 'hover:bg-surface-50 dark:hover:bg-surface-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-surface-400" />
                  </div>
                  <button
                    onClick={() => executeSearch(queryText)}
                    className="flex-1 text-left text-sm text-surface-700 dark:text-surface-300 truncate min-h-[44px] flex items-center"
                  >
                    {queryText}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && suggestions.length === 0 && history.length === 0 && popularSearches.length > 0 && (
          <div className="p-2.5 sm:p-3">
            <p className="px-3 sm:px-4 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Popular Searches
            </p>
            {popularSearches.map((item, index) => (
              <button
                key={item.id}
                onClick={() => executeSearch(item.query)}
                className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 min-h-[44px] rounded-2xl text-left transition-all duration-200 ${
                  index === activeIndex
                    ? 'bg-marsana-50 dark:bg-marsana-950 text-marsana-700 dark:text-marsana-300'
                    : 'hover:bg-surface-50 dark:hover:bg-surface-800'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-marsana-500/10 to-accent-violet/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-marsana-500" />
                </div>
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{item.query}</span>
              </button>
            ))}
          </div>
        )}

        {!loading && suggestions.length === 0 && history.length === 0 && popularSearches.length === 0 && (
          <div className="py-10 sm:py-12 text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 sm:w-7 sm:h-7 text-surface-300 dark:text-surface-600" />
            </div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
              Start typing to search
            </p>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
              Search for products, categories, and more
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
