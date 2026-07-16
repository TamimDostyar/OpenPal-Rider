import { useEffect, useRef, useState } from 'react';
import { searchPlaces, type GeocodePlace } from '@/lib/geocode';

interface LocationFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onSelect: (place: GeocodePlace) => void;
}

/**
 * Labeled location input with OpenStreetMap autocomplete. As the user types,
 * it debounces and queries Nominatim, showing a dropdown of real places.
 * Selecting one reports the place — with coordinates — so the post can
 * render a route map. Free typing is preserved: if the user never picks a
 * suggestion, the typed text is still the origin/destination string, just
 * without coordinates.
 */
export function LocationField({ label, value, placeholder, onChangeText, onSelect }: LocationFieldProps) {
  const [results, setResults] = useState<GeocodePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // True right after a selection so the resulting value change doesn't
  // re-trigger a search and reopen the dropdown.
  const justSelected = useRef(false);

  const tooShort = value.trim().length < 3;

  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    // A too-short query has nothing to fetch; `effectiveResults` below hides
    // any stale results without needing to reset state from here.
    if (tooShort) return;
    const q = value.trim();

    const controller = new AbortController();
    // Debounced network fetch triggered by a value change — the effect
    // necessarily sets state as the request starts and settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const timer = window.setTimeout(() => {
      void searchPlaces(q, controller.signal).then((places) => {
        if (!controller.signal.aborted) {
          setResults(places);
          setOpen(true);
          setLoading(false);
        }
      });
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value, tooShort]);

  const effectiveResults = tooShort ? [] : results;

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const choose = (place: GeocodePlace) => {
    justSelected.current = true;
    onChangeText(place.label);
    onSelect(place);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block w-full">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </span>
        <div className="relative">
          <input
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            onFocus={() => effectiveResults.length > 0 && setOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full rounded-2xl border border-line bg-cream px-4 py-3.5 pr-10 text-sm text-ink outline-none transition-all duration-150 ease-out placeholder:text-muted focus:border-ink focus:ring-4 focus:ring-ink/5"
          />
          {loading ? (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-muted" />
            </span>
          ) : null}
        </div>
      </label>

      {open && effectiveResults.length > 0 ? (
        <div className="animate-scale-in absolute left-0 right-0 top-full z-20 mt-1.5 origin-top overflow-hidden rounded-2xl border border-line bg-cream shadow-[var(--shadow-lg)]">
          {effectiveResults.map((place, i) => (
            <button
              key={place.placeId}
              type="button"
              onClick={() => choose(place)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cream-2 cursor-pointer ${
                i > 0 ? 'border-t border-line-2' : ''
              }`}
            >
              <span className="text-base">📍</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{place.label}</span>
                {place.detail ? (
                  <span className="block truncate text-xs text-muted">{place.detail}</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
