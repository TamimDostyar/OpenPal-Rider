import { useCallback, useEffect, useState } from "react";

import { ApiError, api } from "@/api/client";
import type { FeedPostResponse, FeedSearchParams } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { useFeedFilters } from "@/hooks/FeedFiltersContext";

interface UseFeedResult {
  posts: FeedPostResponse[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  myEmail: string | null;
  school: string | null;
  filters: FeedSearchParams | null;
  hasData: boolean,
  refresh: () => Promise<void>;
  applyFilters: (filters: FeedSearchParams | null) => void;
  deletePost: (id: string) => Promise<void>;
  bookPost: (postId: string, seats: number) => Promise<boolean>;
  blockUser: (username: string) => Promise<boolean>;
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


const ACTIVE_BOOKING_STATES = new Set(["REQUESTED", "ACCEPTED", "COMPLETED"]);


export function useFeed(): UseFeedResult {
  const { token, signOut } = useAuth();
  const { filters, setFilters } = useFeedFilters();
  const [posts, setPosts] = useState<FeedPostResponse[]>([]);
  const [bookedPostIds, setBookedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [school, setSchool] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const myEmail = token ? emailFromToken(token) : null;

  useEffect(() => {
    if (!token) {
      setSchool(null);
      return;
    }
    let cancelled = false;
    api.profile
      .me(token)
      .then((profile) => {
        if (!cancelled) setSchool(profile.school);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!school) return;
    api.schools.news(school)
      .then((res) => setHasData(res.length > 0))
      .catch(() => setHasData(false));
  }, [school]);

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
        const [feedResult, bookingsResult] = await Promise.allSettled([
          filters ? api.feed.search(token, filters) : api.feed.list(token),
          api.bookings.mine(token),
        ]);
        if (feedResult.status === "rejected") throw feedResult.reason;
        const next = feedResult.value;

        // Build the set of post ids the user has actively booked. If the
        // bookings call fails (network blip, 5xx), fall back to whatever we
        // already had so the feed doesn't suddenly show ghosts.
        const bookedIds =
          bookingsResult.status === "fulfilled"
            ? new Set(
                bookingsResult.value
                  .filter((b) => ACTIVE_BOOKING_STATES.has(b.status))
                  .map((b) => b.postId),
              )
            : bookedPostIds;
        setBookedPostIds(bookedIds);



        const searchBasedOnTimePosted = () => {
        const now = new Date();
        const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDay()).getTime();
        
        const filtered = next.filter((post) => {
          if (myEmail && post.email.toLowerCase() === myEmail.toLowerCase()) return false;
          if (bookedIds.has(post.id)) return false;
          return true;
        });

        return filtered.map((post) => {
          const [year, month, day] = post.departureTime;
          const departMS = new Date(Number(year), Number(month) - 1, Number(day)).getTime();
          const difference = (todayMs - departMS) / (1000 * 60 * 60 * 24);
          return {...post, difference};
        }
      )

              
      }
      const sorted = searchBasedOnTimePosted();
      setPosts(sorted);

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
    [filters, handleAuthFailure, myEmail, token],
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  const refresh = useCallback(() => load("refresh"), [load]);

  const applyFilters = useCallback(
    (next: FeedSearchParams | null) => {
      setFilters(next);
    },
    [setFilters],
  );


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

  const bookPost = useCallback(
    async (postId: string, seats: number): Promise<boolean> => {
      if (!token) return false;
      try {
        await api.bookings.request(token, { postId, seatsRequested: seats });
        setBookedPostIds((curr) => {
          const next = new Set(curr);
          next.add(postId);
          return next;
        });
        setPosts((curr) => curr.filter((p) => p.id !== postId));
        return true;
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (await handleAuthFailure(err)) return false;
          setError(err.message);
        } else {
          setError("Couldn't book the ride.");
        }
        return false;
      }
    },
    [handleAuthFailure, token],
  );

  const blockUser = useCallback(
    async (username: string): Promise<boolean> => {
      if (!token) return false;
      const previous = posts;
      // Instantly remove every post from this user from the feed.
      setPosts((curr) =>
        curr.filter((p) => p.username.toLowerCase() !== username.toLowerCase()),
      );
      try {
        await api.blocks.create(token, { username });
        return true;
      } catch (err: unknown) {
        setPosts(previous);
        if (err instanceof ApiError) {
          if (await handleAuthFailure(err)) return false;
          setError(err.message);
        } else {
          setError("Couldn't block this user.");
        }
        return false;
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
    school,
    filters,
    refresh,
    applyFilters,
    deletePost,
    bookPost,
    blockUser,
    hasData
  };
}
