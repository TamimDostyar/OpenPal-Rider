import { useCallback, useEffect, useState } from "react";

import { ApiError, api } from "@/api/client";
import type { DirectMessageResponse } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";

export function useConversation(otherUsername: string, bookingId?: string) {
  const { token, signOut } = useAuth();
  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = useCallback(
    async (err: ApiError) => {
      if (err.status === 401 || err.status === 403) {
        await signOut();
        return true;
      }
      return false;
    },
    [signOut],
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const next = await api.messages.with(token, otherUsername);
      setMessages(next);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (await handleAuth(err)) return;
        setError(err.message);
      } else {
        setError("Couldn't load messages.");
      }
    } finally {
      setLoading(false);
    }
  }, [handleAuth, otherUsername, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const send = useCallback(
    async (text: string): Promise<boolean> => {
      if (!token) return false;
      if (!text.trim()) return false;
      setSending(true);
      setError(null);
      try {
        const { data } = await api.messages.send(token, {
          recipientUsername: otherUsername,
          text: text.trim(),
          bookingId,
        });
        setMessages((curr) => [...curr, data]);
        return true;
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (await handleAuth(err)) return false;
          setError(err.message);
        } else {
          setError("Couldn't send the message.");
        }
        return false;
      } finally {
        setSending(false);
      }
    },
    [bookingId, handleAuth, otherUsername, token],
  );

  return { messages, loading, sending, error, refresh: load, send };
}
