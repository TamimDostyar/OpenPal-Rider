import { useCallback, useEffect, useState } from "react";

import { ApiError, api } from "@/api/client";
import type { ConversationSummary } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";

export function useConversations() {
  const { token, signOut } = useAuth();
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      if (!token) return;
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const next = await api.messages.conversations(token);
        setItems(next);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (err.status === 401 || err.status === 403) {
            await signOut();
            return;
          }
          setError(err.message);
        } else {
          setError("Couldn't load conversations.");
        }
      } finally {
        if (mode === "initial") setLoading(false);
        else setRefreshing(false);
      }
    },
    [signOut, token],
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  return {
    items,
    loading,
    refreshing,
    error,
    refresh: () => load("refresh"),
  };
}
