import { X } from 'lucide-react';

export default function ActiveFilters({ filters, filterOptions, onRemove }) {
  const chips = [];

  if (filters.min_price || filters.max_price) {
    const min = filters.min_price || '0';
    const max = filters.max_price || '∞';
    chips.push({
      key: 'price',
      label: `Price: $${min} - $${max}`,
      onRemove: () => onRemove('min_price', undefined),
    });
  }

  if (filters.category_ids) {
    filters.category_ids.forEach((id) => {
      const cat = filterOptions.categories?.find((c) => c.id === id);
      if (cat) {
        chips.push({
          key: `cat-${id}`,
          label: cat.name,
          onRemove: () => {
            const updated = filters.category_ids.filter((v) => v !== id);
            onRemove('category_ids', updated.length > 0 ? updated : undefined);
          },
        });
      }
    });
  }

  if (filters.brand_ids) {
    filters.brand_ids.forEach((id) => {
      const brand = filterOptions.brands?.find((b) => b.id === id);
      if (brand) {
        chips.push({
          key: `brand-${id}`,
          label: brand.name,
          onRemove: () => {
            const updated = filters.brand_ids.filter((v) => v !== id);
            onRemove('brand_ids', updated.length > 0 ? updated : undefined);
          },
        });
      }
    });
  }

  if (filters.min_rating) {
    chips.push({
      key: 'rating',
      label: `${filters.min_rating}★ & Up`,
      onRemove: () => onRemove('min_rating', undefined),
    });
  }

  if (filters.sizes) {
    filters.sizes.forEach((size) => {
      chips.push({
        key: `size-${size}`,
        label: `Size: ${size}`,
        onRemove: () => {
          const updated = filters.sizes.filter((v) => v !== size);
          onRemove('sizes', updated.length > 0 ? updated : undefined);
        },
      });
    });
  }

  if (filters.colors) {
    filters.colors.forEach((color) => {
      chips.push({
        key: `color-${color}`,
        label: `Color: ${color}`,
        onRemove: () => {
          const updated = filters.colors.filter((v) => v !== color);
          onRemove('colors', updated.length > 0 ? updated : undefined);
        },
      });
    });
  }

  if (filters.in_stock !== undefined) {
    chips.push({
      key: 'stock',
      label: filters.in_stock ? 'In Stock' : 'Out of Stock',
      onRemove: () => onRemove('in_stock', undefined),
    });
  }

  if (filters.on_sale !== undefined) {
    chips.push({
      key: 'sale',
      label: 'On Sale',
      onRemove: () => onRemove('on_sale', undefined),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="hover:text-primary-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
