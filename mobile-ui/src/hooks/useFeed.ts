/**
 * Drives the home-feed screen: loads, refreshes, and optimistically deletes
 * posts, and signs the user out on 401/403 responses from the backend.
 */
import { useCallback, useEffect, useState } from "react";

import { ApiError, api } from "@/api/client";
import type { FeedPostResponse } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";

interface UseFeedResult {
  posts: FeedPostResponse[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  myEmail: string | null;
  refresh: () => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

function emailFromToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const decoded = globalThis.atob ? globalThis.atob(padded) : "";
    if (!decoded) return null;
    const claims = JSON.parse(decoded) as { sub?: string };
    return claims.sub ?? null;
  } catch {
    return null;
  }
}

export function useFeed(): UseFeedResult {
  const { token, signOut } = useAuth();
  const [posts, setPosts] = useState<FeedPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myEmail = token ? emailFromToken(token) : null;

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
        const next = await api.feed.list(token);
        setPosts(next);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (await handleAuthFailure(err)) return;
          setError(err.message);
        } else {
          setError("Couldn't load the feed.");
        }
      } finally {
        if (mode === "initial") setLoading(false);
        else setRefreshing(false);
      }
    },
    [handleAuthFailure, token],
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  const refresh = useCallback(() => load("refresh"), [load]);

  const deletePost = useCallback(
    async (id: string) => {
      if (!token) return;
      const previous = posts;
      setPosts((curr) => curr.filter((p) => p.id !== id));
      try {
        await api.feed.delete(token, id);
      } catch (err: unknown) {
        setPosts(previous);
        if (err instanceof ApiError) {
          if (await handleAuthFailure(err)) return;
          setError(err.message);
        } else {
          setError("Couldn't delete the post.");
        }
      }
    },
    [handleAuthFailure, posts, token],
  );

  return {
    posts,
    loading,
    refreshing,
    error,
    myEmail,
    refresh,
    deletePost,
  };
}
