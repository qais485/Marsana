import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

function FilterSection({ title, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-surface-100 dark:border-surface-800 pb-4 sm:pb-5 mb-4 sm:mb-5 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group min-h-[44px]"
      >
        <h4 className="text-sm font-semibold text-surface-900 dark:text-white group-hover:text-marsana-600 dark:group-hover:text-marsana-400 transition-colors">{title}</h4>
        {isOpen ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
      </button>
      {isOpen && <div className="mt-3 sm:mt-4">{children}</div>}
    </div>
  );
}

function CheckboxItem({ label, checked, onChange, count }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer py-1.5 group min-h-[44px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 text-marsana-500 border-surface-300 dark:border-surface-600 rounded-lg focus:ring-marsana-500/20 flex-shrink-0" />
      <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white flex-1 truncate transition-colors">{label}</span>
      {count !== undefined && <span className="text-xs text-surface-400 dark:text-surface-500 flex-shrink-0">({count})</span>}
    </label>
  );
}

export default function FilterSidebar({ filterOptions, filters, onFilterChange, onClearAll }) {
  const [priceMin, setPriceMin] = useState(filters.min_price || '');
  const [priceMax, setPriceMax] = useState(filters.max_price || '');

  useEffect(() => {
    setPriceMin(filters.min_price || '');
    setPriceMax(filters.max_price || '');
  }, [filters.min_price, filters.max_price]);

  const handlePriceApply = () => {
    onFilterChange({
      min_price: priceMin !== '' ? Number(priceMin) : undefined,
      max_price: priceMax !== '' ? Number(priceMax) : undefined,
      page: 1,
    });
  };

  const handleCheckboxArray = (key, value, checked) => {
    const current = filters[key] || [];
    const updated = checked ? [...current, value] : current.filter((v) => v !== value);
    onFilterChange({ [key]: updated.length > 0 ? updated : undefined, page: 1 });
  };

  const handleSingleValue = (key, value) => {
    onFilterChange({ [key]: filters[key] === value ? undefined : value, page: 1 });
  };

  const handleRatingClick = (rating) => {
    onFilterChange({ min_rating: filters.min_rating === rating ? undefined : rating, page: 1 });
  };

  return (
    <div className="space-y-0">
      {filterOptions.price_range && (
        <FilterSection title="Price Range">
          <div className="flex items-center gap-2">
            <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min" min="0" className="w-full px-3 py-2.5 text-sm border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-marsana-500/20 focus:border-marsana-500 transition-all bg-white dark:bg-surface-800 text-surface-900 dark:text-white min-h-[44px]" />
            <span className="text-surface-400 flex-shrink-0">-</span>
            <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max" min="0" className="w-full px-3 py-2.5 text-sm border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-marsana-500/20 focus:border-marsana-500 transition-all bg-white dark:bg-surface-800 text-surface-900 dark:text-white min-h-[44px]" />
          </div>
          <button onClick={handlePriceApply} className="mt-3 w-full px-3 py-2.5 text-sm font-medium text-marsana-600 dark:text-marsana-400 bg-marsana-50 dark:bg-marsana-950 rounded-xl hover:bg-marsana-100 dark:hover:bg-marsana-900 transition-colors min-h-[44px]">
            Apply
          </button>
        </FilterSection>
      )}

      {filterOptions.categories && filterOptions.categories.length > 0 && (
        <FilterSection title="Category">
          <div className="max-h-48 overflow-y-auto space-y-1 -mr-2 pr-2">
            {filterOptions.categories.map((cat) => (
              <CheckboxItem key={cat.id} label={cat.name} count={cat.count} checked={(filters.category_ids || []).includes(cat.id)} onChange={(e) => handleCheckboxArray('category_ids', cat.id, e.target.checked)} />
            ))}
          </div>
        </FilterSection>
      )}

      {filterOptions.brands && filterOptions.brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="max-h-48 overflow-y-auto space-y-1 -mr-2 pr-2">
            {filterOptions.brands.map((brand) => (
              <CheckboxItem key={brand.id} label={brand.name} count={brand.count} checked={(filters.brand_ids || []).includes(brand.id)} onChange={(e) => handleCheckboxArray('brand_ids', brand.id, e.target.checked)} />
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Rating">
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => (
            <button key={rating} onClick={() => handleRatingClick(rating)} className={`flex items-center gap-2 w-full px-3 py-2.5 min-h-[44px] rounded-xl text-sm transition-all duration-200 ${filters.min_rating === rating ? 'bg-marsana-50 dark:bg-marsana-950 text-marsana-600 dark:text-marsana-400' : 'hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400'}`}>
              <div className="flex items-center flex-shrink-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3.5 h-3.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-surface-200 dark:fill-surface-700 text-surface-200 dark:text-surface-700'}`} />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {filterOptions.sizes && filterOptions.sizes.length > 0 && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {filterOptions.sizes.map((size) => (
              <button key={size} onClick={() => handleCheckboxArray('sizes', size, !(filters.sizes || []).includes(size))} className={`px-3 py-2 text-sm border rounded-xl transition-all duration-200 min-h-[44px] ${(filters.sizes || []).includes(size) ? 'bg-marsana-50 dark:bg-marsana-950 border-marsana-300 dark:border-marsana-700 text-marsana-600 dark:text-marsana-400' : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600'}`}>
                {size}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {filterOptions.colors && filterOptions.colors.length > 0 && (
        <FilterSection title="Color">
          <div className="flex flex-wrap gap-2">
            {filterOptions.colors.map((color) => (
              <button key={color} onClick={() => handleCheckboxArray('colors', color, !(filters.colors || []).includes(color))} className={`px-3 py-2 text-sm border rounded-xl transition-all duration-200 min-h-[44px] ${(filters.colors || []).includes(color) ? 'bg-marsana-50 dark:bg-marsana-950 border-marsana-300 dark:border-marsana-700 text-marsana-600 dark:text-marsana-400' : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600'}`}>
                {color}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Availability">
        <div className="space-y-1">
          <CheckboxItem label="In Stock" checked={filters.in_stock === true} onChange={() => handleSingleValue('in_stock', true)} />
          <CheckboxItem label="Out of Stock" checked={filters.in_stock === false} onChange={() => handleSingleValue('in_stock', false)} />
        </div>
      </FilterSection>

      <FilterSection title="Discount">
        <div className="space-y-1">
          <CheckboxItem label="On Sale" checked={filters.on_sale === true} onChange={() => handleSingleValue('on_sale', true)} />
        </div>
      </FilterSection>
    </div>
  );
}
