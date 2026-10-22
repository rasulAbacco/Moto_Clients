// src/components/map/FreeMap.jsx
//
// Free map — OpenStreetMap tiles rendered with Leaflet inside a WebView.
// No Google Maps SDK and no API key, on Android and iOS alike.
// (react-native-maps on Android always runs on the Google Maps SDK, which
// needs a paid-account API key and crashes release builds without one.)
//
// Usage:
//   <FreeMap latitude={13.08} longitude={77.55} zoom={16} style={{ flex: 1 }} />
//
// Tiles: tile.openstreetmap.org is free for light use. If traffic grows,
// switch TILE_URL to a free-tier provider (MapTiler, Stadia Maps, Carto)
// to stay within the OSM tile usage policy.
import { useMemo, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const buildHtml = ({
  latitude,
  longitude,
  zoom,
  color,
  radius,
}) => `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #E3E6EB; }
  .leaflet-control-attribution { font-size: 9px; }
  .pin { width: 18px; height: 18px; border-radius: 50%; background: ${color};
         border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.35); box-sizing: border-box; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  function post(type) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(type);
  }
  try {
    var pos = [${latitude}, ${longitude}];
    var map = L.map('map', { zoomControl: false, attributionControl: true, tap: true })
      .setView(pos, ${zoom});
    map.attributionControl.setPrefix(false);
    L.tileLayer('${TILE_URL}', { maxZoom: 19, attribution: '${ATTRIBUTION}' }).addTo(map);
    L.circle(pos, { radius: ${radius}, color: '${color}', weight: 1, opacity: 0.5,
                    fillColor: '${color}', fillOpacity: 0.12 }).addTo(map);
    L.marker(pos, { icon: L.divIcon({ className: '', html: '<div class="pin"></div>',
                                      iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(map);
    map.whenReady(function () { post('ready'); });
  } catch (e) { post('error'); }
</script>
</body>
</html>`;

export default function FreeMap({
  latitude,
  longitude,
  zoom = 16,
  markerColor = "#B3261E",
  accuracyRadius = 120,
  style,
  onError,
}) {
  const [loading, setLoading] = useState(true);

  // Rebuild only when the position actually changes (~1 m precision)
  const lat = Number(latitude).toFixed(5);
  const lng = Number(longitude).toFixed(5);
  const html = useMemo(
    () =>
      buildHtml({
        latitude: lat,
        longitude: lng,
        zoom,
        color: markerColor,
        radius: accuracyRadius,
      }),
    [lat, lng, zoom, markerColor, accuracyRadius],
  );

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        key={`${lat},${lng}`}
        originWhitelist={["*"]}
        // baseUrl gives tile requests a proper Referer (OSM tile policy)
        source={{ html, baseUrl: "https://motorkonnect.app/" }}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
        setSupportMultipleWindows={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={(e) => {
          if (e.nativeEvent.data === "ready") setLoading(false);
          if (e.nativeEvent.data === "error") onError?.();
        }}
        onLoadEnd={() => setTimeout(() => setLoading(false), 1500)}
        onError={() => onError?.()}
        onHttpError={(e) => {
          // Only the page itself matters; tile errors don't reach here
          if (e.nativeEvent.statusCode >= 500) onError?.();
        }}
      />
      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator color="#1E3A5F" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", backgroundColor: "#E3E6EB" },
  web: { flex: 1, backgroundColor: "#E3E6EB" },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3E6EB",
  },
});
