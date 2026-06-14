/**
 * RouteMap renders an origin → destination route on a free, open-source map:
 * Leaflet for rendering, OpenStreetMap for tiles, and OSRM's public demo
 * server for driving directions — none of which require an API key. The map is
 * drawn inside a WebView from a self-contained HTML document.
 *
 * Coordinates are the fast path. When a post has no coordinates (e.g. older
 * posts created before location picking existed), the HTML falls back to
 * geocoding the origin/destination *labels* via Nominatim so a route still
 * renders — approximately — instead of showing nothing.
 *
 * When OSRM routing is unavailable the map draws a dashed straight line between
 * the two points, so start/end are always shown.
 */
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";

interface RouteMapProps {
  originLat: number | null;
  originLng: number | null;
  destLat: number | null;
  destLng: number | null;
  originLabel: string;
  destLabel: string;
  /** Height of the map in pixels. Defaults to 220. */
  height?: number;
}

function hasCoords(lat: number | null, lng: number | null): lat is number {
  return typeof lat === "number" && typeof lng === "number" && !Number.isNaN(lat) && !Number.isNaN(lng);
}

function buildHtml(
  oLat: number | null,
  oLng: number | null,
  dLat: number | null,
  dLng: number | null,
  originLabel: string,
  destLabel: string,
): string {
  // Theme colors mirrored from tailwind.config.js so the map reads as part of
  // the app: sage green for the start, coral for the destination.
  const start = "#0E7C66";
  const end = "#DC2626";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #F5F5F7; }
    .leaflet-control-attribution { font-size: 9px; }
    .pin {
      width: 18px; height: 18px; border-radius: 50%;
      border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.35);
    }
    .pin-start { background: ${start}; }
    .pin-end { background: ${end}; }
    #msg {
      position: absolute; inset: 0; display: none;
      align-items: center; justify-content: center; text-align: center;
      font-family: -apple-system, Roboto, sans-serif; color: #6B7076;
      font-size: 13px; padding: 0 24px; background: #F5F5F7;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="msg">Couldn't locate this route on the map.</div>
  <script>
    var injectedOrigin = ${hasCoords(oLat, oLng) ? `[${oLat}, ${oLng}]` : "null"};
    var injectedDest = ${hasCoords(dLat, dLng) ? `[${dLat}, ${dLng}]` : "null"};
    var originLabel = ${JSON.stringify(originLabel)};
    var destLabel = ${JSON.stringify(destLabel)};

    var map = L.map('map', { zoomControl: true, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    function pin(cls) {
      return L.divIcon({ className: '', html: '<div class="pin ' + cls + '"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
    }
    function fitTo(coords) {
      map.fitBounds(L.latLngBounds(coords), { padding: [36, 36], maxZoom: 14 });
    }
    function showMessage() {
      document.getElementById('msg').style.display = 'flex';
    }

    // Resolve a point: use the injected coordinate if present, otherwise geocode
    // the label via Nominatim (free OpenStreetMap geocoding, no API key).
    function resolve(injected, label) {
      if (injected) return Promise.resolve(injected);
      if (!label) return Promise.resolve(null);
      var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q='
        + encodeURIComponent(label) + '&email=support@openpal.app';
      return fetch(url, { headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.length) return [parseFloat(d[0].lat), parseFloat(d[0].lon)];
          return null;
        })
        .catch(function () { return null; });
    }

    Promise.all([resolve(injectedOrigin, originLabel), resolve(injectedDest, destLabel)])
      .then(function (pts) {
        var origin = pts[0], dest = pts[1];
        if (!origin || !dest) { showMessage(); return; }

        L.marker(origin, { icon: pin('pin-start') }).addTo(map).bindPopup(originLabel || 'Start');
        L.marker(dest, { icon: pin('pin-end') }).addTo(map).bindPopup(destLabel || 'Destination');
        fitTo([origin, dest]);

        var routeUrl = 'https://router.project-osrm.org/route/v1/driving/'
          + origin[1] + ',' + origin[0] + ';' + dest[1] + ',' + dest[0]
          + '?overview=full&geometries=geojson';
        fetch(routeUrl)
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data && data.routes && data.routes.length) {
              var line = data.routes[0].geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
              L.polyline(line, { color: '#0A0A0A', weight: 4, opacity: 0.85 }).addTo(map);
              fitTo(line);
            } else {
              L.polyline([origin, dest], { color: '#0A0A0A', weight: 3, opacity: 0.6, dashArray: '6 8' }).addTo(map);
            }
          })
          .catch(function () {
            L.polyline([origin, dest], { color: '#0A0A0A', weight: 3, opacity: 0.6, dashArray: '6 8' }).addTo(map);
          });
      })
      .catch(showMessage);
  </script>
</body>
</html>`;
}

export function RouteMap({
  originLat,
  originLng,
  destLat,
  destLng,
  originLabel,
  destLabel,
  height = 220,
}: RouteMapProps) {
  const haveCoords = hasCoords(originLat, originLng) && hasCoords(destLat, destLng);
  const haveLabels = !!originLabel?.trim() && !!destLabel?.trim();
  // We can render whenever we have coordinates OR labels to geocode from.
  const canRender = haveCoords || haveLabels;

  const html = useMemo(() => {
    if (!canRender) return null;
    return buildHtml(originLat, originLng, destLat, destLng, originLabel, destLabel);
  }, [canRender, originLat, originLng, destLat, destLng, originLabel, destLabel]);

  if (!html) {
    return (
      <View
        style={{ height }}
        className="items-center justify-center rounded-2xl border border-line bg-cream-2"
      >
        <Text className="text-sm font-semibold text-ink-2">Map unavailable</Text>
        <Text className="mt-1 px-6 text-center text-xs text-muted">
          This ride doesn&apos;t have a location set.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ height }}
      className="overflow-hidden rounded-2xl border border-line bg-cream-2"
    >
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        scrollEnabled={false}
        nestedScrollEnabled
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}
