import { useEffect, useState } from "react";

import { ApiError, api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

type Status = "checking" | "online" | "offline";

export function useHome() {
  const { signOut } = useAuth();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;
    api
      .health()
      .then(() => active && setStatus("online"))
      .catch((err: unknown) => {
        if (active) setStatus(err instanceof ApiError ? "offline" : "offline");
      });
    return () => {
      active = false;
    };
  }, []);

  return { status, signOut };
}
