/**
 * Free, key-less place search backed by Nominatim — OpenStreetMap's geocoding
 * service. Used by LocationField to turn a typed place name into coordinates
 * so posts can render a real route map.
 *
 * Scoped to the US for now (countrycodes=us) and presented as "City, ST".
 *
 * Nominatim usage policy: keep volume low, identify the app via the `email`
 * param (browsers won't let fetch set User-Agent/Referer), and stay under
 * ~1 request/second. Callers MUST debounce; we cap results and only fire on
 * non-trivial queries here.
 */

export interface GeocodePlace {
  /** Compact display, e.g. "Minneapolis, MN". */
  label: string;
  /** Secondary context shown under the label, e.g. "Hennepin County". */
  detail?: string;
  lat: number;
  lng: number;
  placeId: string;
}

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

// Full state/territory name → USPS abbreviation, so suggestions read "City, MN".
const STATE_ABBR: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL',
  Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA',
  Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
  Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI',
  Wyoming: 'WY', 'Puerto Rico': 'PR',
};

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  county?: string;
  state?: string;
}

interface NominatimResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

function buildLabel(r: NominatimResult): { label: string; detail?: string } {
  const a = r.address ?? {};
  const locality = a.city ?? a.town ?? a.village ?? a.hamlet ?? a.municipality ?? a.county;
  const state = a.state ? (STATE_ABBR[a.state] ?? a.state) : undefined;

  if (locality && state) {
    // Show county as secondary context only when it isn't the primary locality.
    const detail = a.county && a.county !== locality ? a.county : undefined;
    return { label: `${locality}, ${state}`, detail };
  }
  // Fallback: first two segments of the raw display name.
  const parts = r.display_name.split(',').map((s) => s.trim());
  return { label: parts.slice(0, 2).join(', '), detail: parts[2] };
}

/**
 * Search OpenStreetMap (US only) for places matching `query`. Returns up to 6
 * de-duplicated results as "City, ST". Returns [] for short/empty queries or
 * on any network/parse error — the caller treats an empty list as "no
 * suggestions".
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodePlace[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url =
    `${ENDPOINT}?format=json&addressdetails=1&limit=6&countrycodes=us` +
    `&q=${encodeURIComponent(q)}` +
    `&email=${encodeURIComponent('support@openpal.app')}`;

  try {
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    const seen = new Set<string>();
    const places: GeocodePlace[] = [];
    for (const r of data as NominatimResult[]) {
      const lat = Number(r.lat);
      const lng = Number(r.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const { label, detail } = buildLabel(r);
      // Collapse duplicate "City, ST" rows that Nominatim often returns.
      const key = `${label}|${detail ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      places.push({ label, detail, lat, lng, placeId: String(r.place_id) });
    }
    return places;
  } catch {
    // Aborted requests and network failures both surface as "no results".
    return [];
  }
}
