import { useState, useEffect, useCallback } from 'react';
import { Truck, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { cartService } from '../../services/api/cartService';
import { formatPrice } from '../../utils/format';

export default function ShippingSelector() {
  const { cart, setShippingMethod } = useCart();
  const currentMethod = cart.summary?.shipping_method || 'standard';
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMethods = useCallback(async () => {
    try {
      const response = await cartService.getShippingMethods();
      if (response.success) {
        setMethods(response.data || []);
      }
    } catch {
      // TODO: Replace with dynamic fallback or show error message
      setMethods([
        { id: 'standard', name: 'Standard Shipping', cost: 5.99, estimated_days_min: 5, estimated_days_max: 7 },
        { id: 'express', name: 'Express Shipping', cost: 12.99, estimated_days_min: 2, estimated_days_max: 3 },
        { id: 'overnight', name: 'Overnight Shipping', cost: 24.99, estimated_days_min: 1, estimated_days_max: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  const handleSelect = async (methodId) => {
    if (methodId !== currentMethod) {
      try {
        await setShippingMethod(methodId);
      } catch {
        // Error handled by CartContext
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="w-4 h-4 text-surface-500 dark:text-surface-400" />
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Shipping Method</span>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-marsana-600 dark:text-marsana-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="w-4 h-4 text-surface-500 dark:text-surface-400" />
        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Shipping Method</span>
      </div>
      {methods.map((method) => (
        <label
          key={method.id}
          className={`flex items-center justify-between p-2.5 sm:p-3 border rounded-xl cursor-pointer transition-all duration-300 min-h-[44px] ${
            currentMethod === method.id
              ? 'border-marsana-500 dark:border-marsana-400 bg-marsana-50 dark:bg-marsana-900/20'
              : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <input
              type="radio"
              name="shipping"
              value={method.id}
              checked={currentMethod === method.id}
              onChange={() => handleSelect(method.id)}
              className="w-4 h-4 text-marsana-600 dark:text-marsana-400"
            />
            <div>
              <p className="text-xs sm:text-sm font-medium text-surface-900 dark:text-white">{method.name}</p>
              <p className="text-[10px] sm:text-xs text-surface-500 dark:text-surface-400">
                {method.estimated_days_min}-{method.estimated_days_max} business days
              </p>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-medium text-surface-900 dark:text-white flex-shrink-0">
            {method.free_shipping ? 'Free' : formatPrice(method.cost)}
          </span>
        </label>
      ))}
    </div>
  );
}
