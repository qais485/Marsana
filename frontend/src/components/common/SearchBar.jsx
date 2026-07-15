import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Loader2, Tag, ShoppingBag } from 'lucide-react';
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

  const fetchPopularSearches = useCallback(async () => {
    try {
      const response = await searchService.getPopularSearches(5);
      if (response.success) {
        setPopularSearches(response.data || []);
      }
    } catch {
      setPopularSearches([]);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      let stored;
      try {
        stored = JSON.parse(localStorage.getItem('search_history') || '[]');
      } catch {
        stored = [];
      }
      setHistory(stored);
      return;
    }
    try {
      const response = await searchService.getHistory(5);
      if (response.success) {
        setHistory(response.data || []);
      }
    } catch {
      setHistory([]);
    }
  }, [isAuthenticated]);

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
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
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

  const handleClearHistory = async () => {
    if (isAuthenticated) {
      try {
        await searchService.clearHistory();
      } catch {}
    } else {
      localStorage.removeItem('search_history');
    }
    setHistory([]);
  };

  const removeHistoryItem = async (itemId) => {
    if (isAuthenticated && itemId) {
      try {
        await searchService.removeFromHistory(itemId);
        setHistory((prev) => prev.filter((h) => h.id !== itemId));
      } catch {}
    } else if (!isAuthenticated) {
      const queryStr = typeof itemId === 'string' ? itemId : '';
      let stored;
      try {
        stored = JSON.parse(localStorage.getItem('search_history') || '[]');
      } catch {
        stored = [];
      }
      localStorage.setItem(
        'search_history',
        JSON.stringify(stored.filter((s) => s !== queryStr))
      );
      setHistory((prev) => prev.filter((h) => (h.query || h) !== queryStr));
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                Suggestions
              </p>
              {suggestions.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => executeSearch(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    index === activeIndex
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {item.type === 'product' ? (
                    <ShoppingBag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && suggestions.length === 0 && history.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-1">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Recent Searches
                </p>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Clear
                </button>
              </div>
              {history.slice(0, 5).map((item, index) => {
                const queryText = item.query || item;
                const itemId = item.id || queryText;
                return (
                  <div
                    key={itemId}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      index === activeIndex
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <button
                      onClick={() => executeSearch(queryText)}
                      className="flex-1 text-left text-sm text-gray-900 truncate"
                    >
                      {queryText}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryItem(itemId);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!loading &&
            suggestions.length === 0 &&
            history.length === 0 &&
            popularSearches.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                  Popular Searches
                </p>
                {popularSearches.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => executeSearch(item.query)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      index === activeIndex
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900">{item.query}</span>
                  </button>
                ))}
              </div>
            )}

          {!loading &&
            suggestions.length === 0 &&
            history.length === 0 &&
            popularSearches.length === 0 && (
              <div className="py-8 text-center">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Type to search products and categories
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
