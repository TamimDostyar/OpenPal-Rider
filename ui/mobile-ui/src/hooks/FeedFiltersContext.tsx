import React, { createContext, useContext, useState } from "react";

import type { FeedSearchParams } from "@/api/types";

interface Ctx {
  filters: FeedSearchParams | null;
  setFilters: (next: FeedSearchParams | null) => void;
}

const FeedFiltersContext = createContext<Ctx | undefined>(undefined);

export function FeedFiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FeedSearchParams | null>(null);
  return (
    <FeedFiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FeedFiltersContext.Provider>
  );
}

export function useFeedFilters(): Ctx {
  const ctx = useContext(FeedFiltersContext);
  if (!ctx) {
    throw new Error("useFeedFilters must be used within a FeedFiltersProvider");
  }
  return ctx;
}
