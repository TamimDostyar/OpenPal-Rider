import { useEffect, useState } from "react";

import { api } from "@/api/client";
import type { LegalDocument } from "@/api/types";

/**
 * Fetches a legal document (Terms or Privacy) from the backend so the copy can
 * be updated server-side without an app release. Starts from a bundled fallback
 * so something is always shown — including before login, offline, or if the API
 * is unreachable — then swaps in the fetched copy when it arrives.
 */
export function useLegalDocument(
  kind: "terms" | "privacy",
  fallback: LegalDocument,
): { doc: LegalDocument; loading: boolean } {
  const [doc, setDoc] = useState<LegalDocument>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const fetched =
          kind === "terms" ? await api.legal.terms() : await api.legal.privacy();
        // Only adopt a well-formed document; otherwise keep the fallback.
        if (active && fetched && Array.isArray(fetched.sections) && fetched.sections.length) {
          setDoc(fetched);
        }
      } catch {
        // Network/API failure — keep the bundled fallback.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [kind]);

  return { doc, loading };
}
