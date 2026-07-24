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
  pending: 'text-surface-500 bg-surface-100 dark:text-surface-400 dark:bg-surface-800',
  processing: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  shipped: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
  out_for_delivery: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
  delivered: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
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
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-6 transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-surface-500 dark:text-surface-400" />
          <h3 className="font-semibold text-surface-900 dark:text-white">Delivery Tracking</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-marsana-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!tracking || (!tracking.tracking_number && (!tracking.events || tracking.events.length === 0))) {
    return null;
  }

  const StatusIcon = STATUS_ICONS[tracking.status] || Package;
  const statusColor = STATUS_COLORS[tracking.status] || 'text-surface-500 bg-surface-100 dark:text-surface-400 dark:bg-surface-800';

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-6 transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-surface-500 dark:text-surface-400" />
        <h3 className="font-semibold text-surface-900 dark:text-white">Delivery Tracking</h3>
      </div>

      <div className="flex items-start gap-3 sm:gap-4 mb-6 p-3 sm:p-4 bg-surface-50 dark:bg-surface-800 rounded-xl transition-all duration-300">
        <div className={`p-2.5 sm:p-3 rounded-full flex-shrink-0 ${statusColor}`}>
          <StatusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-surface-900 dark:text-white capitalize">
            {tracking.status.replace(/_/g, ' ')}
          </p>
          {tracking.carrier && (
            <p className="text-sm text-surface-500 dark:text-surface-400 truncate">
              {tracking.carrier}
              {tracking.tracking_number && ` - ${tracking.tracking_number}`}
            </p>
          )}
          {tracking.estimated_delivery && (
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Estimated delivery: {new Date(tracking.estimated_delivery).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {tracking.actual_delivery && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
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
                  <div className={`p-2 rounded-full transition-all duration-300 ${isFirst ? 'bg-marsana-100 text-marsana-600 dark:bg-marsana-900/30 dark:text-marsana-400' : 'bg-surface-100 text-surface-400 dark:bg-surface-800 dark:text-surface-500'}`}>
                    <EventIcon className="w-4 h-4" />
                  </div>
                  {index < tracking.events.length - 1 && (
                    <div className="w-0.5 h-full bg-surface-200 dark:bg-surface-700 my-1" />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-medium ${isFirst ? 'text-surface-900 dark:text-white' : 'text-surface-600 dark:text-surface-300'}`}>
                    {event.status.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {new Date(event.event_time).toLocaleString()}
                  </p>
                  {event.description && (
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1 mt-0.5">
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
