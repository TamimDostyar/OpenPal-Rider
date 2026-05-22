import { useEffect, useMemo, useState } from "react";

import { ApiError, api } from "@/api/client";
import type { University } from "@/api/types";

export function useUniversities() {
  const [all, setAll] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    api
      .universities()
      .then((res) => {
        if (active) setAll(res.universities);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof ApiError ? err.message : "Failed to load schools.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return all;
    return all.filter((u) => u.name.toLowerCase().includes(term));
  }, [all, query]);

  return { loading, error, query, setQuery, results };
}
