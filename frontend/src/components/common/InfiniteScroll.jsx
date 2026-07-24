import { Loader2 } from 'lucide-react';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

export default function InfiniteScroll({
  children,
  fetchMore,
  hasMore,
  threshold = 100,
  loadingText = 'Loading more...',
  endText = 'No more items',
  className = '',
}) {
  const { sentinelRef, loading, page } = useInfiniteScroll({
    fetchMore,
    hasMore,
    threshold,
  });

  return (
    <div className={className}>
      {children}
      <div ref={sentinelRef} className="py-4">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-surface-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{loadingText}</span>
          </div>
        )}
        {!hasMore && !loading && page > 1 && (
          <div className="text-center text-sm text-surface-400 py-4">
            {endText}
          </div>
        )}
      </div>
    </div>
  );
}
