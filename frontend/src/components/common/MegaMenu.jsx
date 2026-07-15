import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LayoutGrid, Loader2 } from 'lucide-react';
import { categoryService } from '../../services/api/categoryService';

export default function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const menuRef = useRef(null);

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
        .finally(() => {
          setLoading(false);
        });
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
      >
        <LayoutGrid className="w-4 h-4" />
        Categories
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[800px] bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-sm text-red-500">
              {error}
            </div>
          ) : (
            <div className="flex">
              <div className="w-64 border-r border-gray-100 py-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onMouseEnter={() => setActiveCategory(category)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                      activeCategory?.id === category.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {category.name}
                    </span>
                    {category.children && category.children.length > 0 && (
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Link
                    to="/categories"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm text-primary-600 font-medium hover:bg-gray-50"
                  >
                    View All Categories
                  </Link>
                </div>
              </div>

              <div className="flex-1 p-6">
                {activeCategory ? (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      <Link
                        to={`/categories/${activeCategory.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {activeCategory.name}
                      </Link>
                    </h3>
                    {activeCategory.children && activeCategory.children.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {activeCategory.children.map((child) => (
                          <Link
                            key={child.id}
                            to={`/categories/${child.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {child.image_url ? (
                              <img
                                src={child.image_url}
                                alt={child.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <LayoutGrid className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <span className="text-sm text-gray-700">{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No subcategories</p>
                    )}
                    <Link
                      to={`/categories/${activeCategory.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="inline-block mt-4 text-sm text-primary-600 font-medium hover:text-primary-700"
                    >
                      View All →
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <LayoutGrid className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Select a category to see subcategories</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
