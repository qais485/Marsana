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
          <Truck className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Shipping Method</span>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Shipping Method</span>
      </div>
      {methods.map((method) => (
        <label
          key={method.id}
          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
            currentMethod === method.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="shipping"
              value={method.id}
              checked={currentMethod === method.id}
              onChange={() => handleSelect(method.id)}
              className="w-4 h-4 text-primary-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{method.name}</p>
              <p className="text-xs text-gray-500">
                {method.estimated_days_min}-{method.estimated_days_max} business days
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {method.free_shipping ? 'Free' : formatPrice(method.cost)}
          </span>
        </label>
      ))}
    </div>
  );
}
