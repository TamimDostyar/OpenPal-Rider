/**
 * Renders an origin → destination route on a free, open-source map: Leaflet
 * for rendering, OpenStreetMap for tiles, and OSRM's public demo server for
 * driving directions — none of which require an API key.
 *
 * Coordinates are the fast path. When a post has no coordinates (e.g. older
 * posts created before location picking existed), we fall back to geocoding
 * the origin/destination *labels* via Nominatim so a route still renders —
 * approximately — instead of showing nothing.
 *
 * When OSRM routing is unavailable the map draws a dashed straight line
 * between the two points, so start/end are always shown.
 */
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PostRouteMapProps {
  originLat: number | null;
  originLng: number | null;
  destLat: number | null;
  destLng: number | null;
  originLabel: string;
  destLabel: string;
  /** Height of the map in pixels. Defaults to 220. */
  height?: number;
}

const START_COLOR = '#0E7C66';
const END_COLOR = '#DC2626';

function hasCoords(lat: number | null, lng: number | null): lat is number {
  return typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng);
}

function pinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

async function geocodeLabel(label: string): Promise<[number, number] | null> {
  if (!label.trim()) return null;
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(label)}` +
      `&email=${encodeURIComponent('support@openpal.app')}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (data.length) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  } catch {
    return null;
  }
}

async function resolvePoint(
  lat: number | null,
  lng: number | null,
  label: string,
): Promise<[number, number] | null> {
  if (hasCoords(lat, lng) && typeof lng === 'number') return [lat, lng];
  return geocodeLabel(label);
}

export function PostRouteMap({
  originLat,
  originLng,
  destLat,
  destLng,
  originLabel,
  destLabel,
  height = 220,
}: PostRouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  const haveCoords = hasCoords(originLat, originLng) && hasCoords(destLat, destLng);
  const haveLabels = !!originLabel?.trim() && !!destLabel?.trim();
  const canRender = haveCoords || haveLabels;

  useEffect(() => {
    if (!canRender || !containerRef.current) {
      setStatus('unavailable');
      return;
    }

    setStatus('loading');
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    let cancelled = false;
    const fitTo = (coords: [number, number][]) => {
      map.fitBounds(L.latLngBounds(coords), { padding: [36, 36], maxZoom: 14 });
    };

    void Promise.all([
      resolvePoint(originLat, originLng, originLabel),
      resolvePoint(destLat, destLng, destLabel),
    ]).then(([origin, dest]) => {
      if (cancelled) return;
      if (!origin || !dest) {
        setStatus('unavailable');
        return;
      }
      setStatus('ready');

      L.marker(origin, { icon: pinIcon(START_COLOR) }).addTo(map).bindPopup(originLabel || 'Start');
      L.marker(dest, { icon: pinIcon(END_COLOR) }).addTo(map).bindPopup(destLabel || 'Destination');
      fitTo([origin, dest]);

      const routeUrl =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;

      fetch(routeUrl)
        .then((r) => r.json())
        .then((data: { routes?: { geometry: { coordinates: [number, number][] } }[] }) => {
          if (cancelled) return;
          if (data.routes && data.routes.length) {
            const line = data.routes[0].geometry.coordinates.map(
              ([lng, lat]) => [lat, lng] as [number, number],
            );
            L.polyline(line, { color: '#0A0A0A', weight: 4, opacity: 0.85 }).addTo(map);
            fitTo(line);
          } else {
            L.polyline([origin, dest], { color: '#0A0A0A', weight: 3, opacity: 0.6, dashArray: '6 8' }).addTo(map);
          }
        })
        .catch(() => {
          if (cancelled) return;
          L.polyline([origin, dest], { color: '#0A0A0A', weight: 3, opacity: 0.6, dashArray: '6 8' }).addTo(map);
        });
    });

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
  }, [canRender, originLat, originLng, destLat, destLng, originLabel, destLabel]);

  if (!canRender) {
    return (
      <div
        style={{ height }}
        className="flex flex-col items-center justify-center rounded-2xl border border-line bg-cream-2 text-center"
      >
        <p className="text-sm font-semibold text-ink-2">Map unavailable</p>
        <p className="mt-1 px-6 text-xs text-muted">This ride doesn&apos;t have a location set.</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative overflow-hidden rounded-2xl border border-line bg-cream-2">
      <div ref={containerRef} className="h-full w-full" />
      {status === 'unavailable' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cream-2 text-center">
          <p className="px-6 text-xs text-muted">Couldn&apos;t locate this route on the map.</p>
        </div>
      ) : null}
    </div>
  );
}
