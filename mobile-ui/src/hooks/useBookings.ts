import { useCallback, useEffect, useState } from "react";

import { ApiError, api } from "@/api/client";
import type { BookingResponse } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";

export type BookingScope = "mine" | "incoming";

interface UseBookingsResult {
  scope: BookingScope;
  setScope: (scope: BookingScope) => void;
  bookings: BookingResponse[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  accept: (id: string) => Promise<void>;
  decline: (id: string) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  complete: (id: string) => Promise<void>;
}

export function useBookings(): UseBookingsResult {
  const { token, signOut } = useAuth();
  const [scope, setScope] = useState<BookingScope>("mine");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthFailure = useCallback(
    async (err: ApiError) => {
      if (err.status === 401 || err.status === 403) {
        await signOut();
        return true;
      }
      return false;
    },
    [signOut],
  );

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      if (!token) return;
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const next =
          scope === "mine"
            ? await api.bookings.mine(token)
            : await api.bookings.incoming(token);
        setBookings(next);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (await handleAuthFailure(err)) return;
          setError(err.message);
        } else {
          setError("Couldn't load bookings.");
        }
      } finally {
        if (mode === "initial") setLoading(false);
        else setRefreshing(false);
      }
    },
    [handleAuthFailure, scope, token],
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  const refresh = useCallback(() => load("refresh"), [load]);

  const act = useCallback(
    async (
      id: string,
      fn: (token: string, id: string) => Promise<{ booking: BookingResponse }>,
    ) => {
      if (!token) return;
      try {
        const result = await fn(token, id);
        setBookings((curr) =>
          curr.map((b) => (b.id === id ? { ...b, ...result.booking } : b)),
        );
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (await handleAuthFailure(err)) return;
          setError(err.message);
        } else {
          setError("Couldn't update booking.");
        }
      }
    },
    [handleAuthFailure, token],
  );

  return {
    scope,
    setScope,
    bookings,
    loading,
    refreshing,
    error,
    refresh,
    accept: (id) => act(id, api.bookings.accept),
    decline: (id) => act(id, api.bookings.decline),
    cancel: (id) => act(id, api.bookings.cancel),
    complete: (id) => act(id, api.bookings.complete),
  };
}
