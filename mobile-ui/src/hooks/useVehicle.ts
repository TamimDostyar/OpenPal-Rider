import { useCallback, useEffect, useState } from "react";

import { ApiError, api } from "@/api/client";
import type { VehicleInfo, VehicleUpdateRequest } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";

export function useVehicle() {
  const { token, signOut } = useAuth();
  const [info, setInfo] = useState<VehicleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const data = await api.vehicle.get(token);
      setInfo(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (await handleAuth(err)) return;
        setError(err.message);
      } else {
        setError("Couldn't load vehicle info.");
      }
    } finally {
      setLoading(false);
    }
  }, [handleAuth, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (payload: VehicleUpdateRequest): Promise<boolean> => {
      if (!token) return false;
      setSaving(true);
      setError(null);
      try {
        await api.vehicle.update(token, payload);
        await load();
        return true;
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (await handleAuth(err)) return false;
          setError(err.message);
        } else {
          setError("Couldn't save vehicle info.");
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [handleAuth, load, token],
  );

  return { info, loading, saving, error, refresh: load, save };
}
