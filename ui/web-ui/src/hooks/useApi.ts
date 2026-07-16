import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/api/client';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/** Loads data from an API call on mount (and whenever `deps` change). */
export function useApiData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const requestKey = `${JSON.stringify(deps)}:${tick}`;

  // Reset to the loading state as soon as the request identity changes
  // (state-during-render pattern, so the effect only handles the fetch).
  const [lastKey, setLastKey] = useState(requestKey);
  if (lastKey !== requestKey) {
    setLastKey(requestKey);
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    let cancelled = false;
    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Something went wrong.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const reload = useCallback(async () => {
    setTick((t) => t + 1);
  }, []);

  return { data, loading, error, reload };
}

export function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong.';
}
