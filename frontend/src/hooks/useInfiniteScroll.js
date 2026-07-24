import { useState, useEffect, useCallback, useRef } from 'react';

export function useInfiniteScroll({
  fetchMore,
  hasMore,
  threshold = 100,
  initialPage = 1,
}) {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      await fetchMore(page);
      setPage(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, fetchMore]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, loadMore, threshold]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLoading(false);
  }, [initialPage]);

  return {
    sentinelRef,
    loading,
    loadMore,
    reset,
    page,
  };
}
