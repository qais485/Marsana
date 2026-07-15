import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';

function FilterSection({ title, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

function CheckboxItem({ label, checked, onChange, count }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-1 group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1 truncate">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </label>
  );
}

export default function FilterSidebar({
  filterOptions,
  filters,
  onFilterChange,
  onClearAll,
}) {
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
    let updated;
    if (checked) {
      updated = [...current, value];
    } else {
      updated = current.filter((v) => v !== value);
    }
    onFilterChange({ [key]: updated.length > 0 ? updated : undefined, page: 1 });
  };

  const handleSingleValue = (key, value) => {
    onFilterChange({ [key]: filters[key] === value ? undefined : value, page: 1 });
  };

  const handleRatingClick = (rating) => {
    onFilterChange({
      min_rating: filters.min_rating === rating ? undefined : rating,
      page: 1,
    });
  };

  return (
    <div className="space-y-0">
      {filterOptions.price_range && (
        <FilterSection title="Price Range">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Min"
              min="0"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max"
              min="0"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handlePriceApply}
            className="mt-2 w-full px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            Apply
          </button>
        </FilterSection>
      )}

      {filterOptions.categories && filterOptions.categories.length > 0 && (
        <FilterSection title="Category">
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filterOptions.categories.map((cat) => (
              <CheckboxItem
                key={cat.id}
                label={cat.name}
                count={cat.count}
                checked={(filters.category_ids || []).includes(cat.id)}
                onChange={(e) =>
                  handleCheckboxArray('category_ids', cat.id, e.target.checked)
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      {filterOptions.brands && filterOptions.brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filterOptions.brands.map((brand) => (
              <CheckboxItem
                key={brand.id}
                label={brand.name}
                count={brand.count}
                checked={(filters.brand_ids || []).includes(brand.id)}
                onChange={(e) =>
                  handleCheckboxArray('brand_ids', brand.id, e.target.checked)
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Rating">
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingClick(rating)}
              className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-sm transition-colors ${
                filters.min_rating === rating
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
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
              <button
                key={size}
                onClick={() => handleCheckboxArray('sizes', size, !(filters.sizes || []).includes(size))}
                className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                  (filters.sizes || []).includes(size)
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
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
              <button
                key={color}
                onClick={() => handleCheckboxArray('colors', color, !(filters.colors || []).includes(color))}
                className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                  (filters.colors || []).includes(color)
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Availability">
        <div className="space-y-1">
          <CheckboxItem
            label="In Stock"
            checked={filters.in_stock === true}
            onChange={() => handleSingleValue('in_stock', true)}
          />
          <CheckboxItem
            label="Out of Stock"
            checked={filters.in_stock === false}
            onChange={() => handleSingleValue('in_stock', false)}
          />
        </div>
      </FilterSection>

      <FilterSection title="Discount">
        <div className="space-y-1">
          <CheckboxItem
            label="On Sale"
            checked={filters.on_sale === true}
            onChange={() => handleSingleValue('on_sale', true)}
          />
        </div>
      </FilterSection>
    </div>
  );
}
