import { useState } from 'react';
import { Check } from 'lucide-react';

export default function ProductVariants({ variants = [], selectedVariant, onSelectVariant }) {
  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Variants</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock_quantity != null && variant.stock_quantity <= 0;

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelectVariant && onSelectVariant(variant)}
              disabled={isOutOfStock}
              className={`relative px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : isOutOfStock
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {variant.name}
                {isSelected && <Check className="w-4 h-4" />}
              </span>
              {isOutOfStock && (
                <span className="absolute -top-2 -right-2 text-xs text-red-500 bg-white px-1">
                  Out of stock
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
