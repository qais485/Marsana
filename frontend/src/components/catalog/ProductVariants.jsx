import { useState } from 'react';
import { Check } from 'lucide-react';

export default function ProductVariants({ variants = [], selectedVariant, onSelectVariant }) {
  if (variants.length === 0) return null;

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <h3 className="text-sm font-medium text-surface-900">Variants</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock_quantity != null && variant.stock_quantity <= 0;

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelectVariant && onSelectVariant(variant)}
              disabled={isOutOfStock}
              className={`relative px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all min-h-[44px] ${
                isSelected
                  ? 'border-marsana-600 bg-marsana-50 text-marsana-700'
                  : isOutOfStock
                  ? 'border-surface-200 bg-surface-50 text-surface-400 cursor-not-allowed'
                  : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300'
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
