import { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle, Clock, MapPin, Loader2 } from 'lucide-react';
import { checkoutService } from '../../services/api/checkoutService';

const STATUS_ICONS = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle,
};

const STATUS_COLORS = {
  pending: 'text-gray-500 bg-gray-100',
  processing: 'text-blue-600 bg-blue-100',
  shipped: 'text-purple-600 bg-purple-100',
  out_for_delivery: 'text-orange-600 bg-orange-100',
  delivered: 'text-green-600 bg-green-100',
};

export default function DeliveryTrackingSection({ orderId }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await checkoutService.getOrderTracking(orderId);
        if (!cancelled && response.success && response.data) {
          setTracking(response.data);
        }
      } catch (error) {
        console.error('Failed to load tracking information:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Delivery Tracking</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!tracking || (!tracking.tracking_number && (!tracking.events || tracking.events.length === 0))) {
    return null;
  }

  const StatusIcon = STATUS_ICONS[tracking.status] || Package;
  const statusColor = STATUS_COLORS[tracking.status] || 'text-gray-500 bg-gray-100';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">Delivery Tracking</h3>
      </div>

      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className={`p-3 rounded-full ${statusColor}`}>
          <StatusIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="font-medium text-gray-900 capitalize">
            {tracking.status.replace(/_/g, ' ')}
          </p>
          {tracking.carrier && (
            <p className="text-sm text-gray-500">
              {tracking.carrier}
              {tracking.tracking_number && ` - ${tracking.tracking_number}`}
            </p>
          )}
          {tracking.estimated_delivery && (
            <p className="text-sm text-gray-500">
              Estimated delivery: {new Date(tracking.estimated_delivery).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {tracking.actual_delivery && (
            <p className="text-sm text-green-600 font-medium">
              Delivered on {new Date(tracking.actual_delivery).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>

      {tracking.events && tracking.events.length > 0 && (
        <div className="space-y-0">
          {tracking.events.map((event, index) => {
            const EventIcon = STATUS_ICONS[event.status] || Package;
            const isFirst = index === 0;
            return (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${isFirst ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                    <EventIcon className="w-4 h-4" />
                  </div>
                  {index < tracking.events.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 my-1" />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-medium ${isFirst ? 'text-gray-900' : 'text-gray-600'}`}>
                    {event.status.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.event_time).toLocaleString()}
                  </p>
                  {event.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
