import { useCallback, useEffect, useState } from "react";

import { ApiError, api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

export function useConversationsBadge() {
  const { token } = useAuth();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!token) {
      setUnread(0);
      return;
    }
    try {
      const data = await api.messages.conversations(token);
      setUnread(data.reduce((acc, c) => acc + (c.unreadCount ?? 0), 0));
    } catch (err) {
      if (!(err instanceof ApiError)) return;
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { unread, refresh };
}
