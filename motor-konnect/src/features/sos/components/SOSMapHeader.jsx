// src/features/sos/components/SOSMapHeader.jsx
//
// SOS header: the user's current location + a small map.
//
// Map: free OpenStreetMap tiles via Leaflet in a WebView (FreeMap) — no
// Google Maps SDK and no API key on Android or iOS.
//   (Previously react-native-maps was used. On Android it always runs on the
//   Google Maps SDK and crashed the whole app in release builds without a
//   key, even with OSM tiles on top.)
//
// Location: checks device location is switched on, shows the last known
// position instantly, then refines it with a 10s timeout, so the screen
// never hangs on "Fetching your location…". If the map can't load, a
// location card with "Open in Maps" is shown instead.

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import FreeMap from "../../../components/map/FreeMap";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { Component, useCallback, useEffect, useRef, useState } from "react";

const LOCATION_TIMEOUT_MS = 10000;

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Location timed out")), ms),
    ),
  ]);

// Catches JS/render errors from the map so SOS stays usable.
class MapErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("SOS map failed to render:", error?.message);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const openInMaps = ({ latitude, longitude }) => {
  const label = encodeURIComponent("My location");
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${label}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
  Linking.openURL(url).catch(() =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    ),
  );
};

export default function SOSMapHeader() {
  const { theme } = useTheme();
  const c = theme.colors;

  // status: loading | ready | denied | services-off | error
  const [status, setStatus] = useState("loading");
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [mapFailed, setMapFailed] = useState(false);
  const mounted = useRef(true);

  // Pulse animation for the SOS dot
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.35,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const lookupAddress = async (coords) => {
    try {
      const [geo] = await withTimeout(
        Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
        LOCATION_TIMEOUT_MS,
      );
      if (geo && mounted.current) {
        setAddress(
          [
            geo.name,
            geo.street,
            geo.district || geo.subregion,
            geo.city,
            geo.region,
          ]
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(", "),
        );
      }
    } catch (e) {
      // Address is a nice-to-have; coordinates are enough for SOS.
      console.warn("Reverse geocode failed:", e?.message);
    }
  };

  const requestLocation = useCallback(async () => {
    setStatus("loading");
    try {
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        if (mounted.current) setStatus("services-off");
        return;
      }

      const { status: perm } =
        await Location.requestForegroundPermissionsAsync();
      if (perm !== "granted") {
        if (mounted.current) setStatus("denied");
        return;
      }

      // 1) Instant: last known position (may be null on a fresh device)
      const last = await Location.getLastKnownPositionAsync().catch(() => null);
      if (last?.coords && mounted.current) {
        setLocation(last.coords);
        setStatus("ready");
        lookupAddress(last.coords);
      }

      // 2) Accurate: current position, but never wait forever
      try {
        const current = await withTimeout(
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          LOCATION_TIMEOUT_MS,
        );
        if (current?.coords && mounted.current) {
          setLocation(current.coords);
          setStatus("ready");
          lookupAddress(current.coords);
        }
      } catch (e) {
        // Keep the last known position if we have one
        if (!last?.coords && mounted.current) setStatus("error");
        console.warn("Current location failed:", e?.message);
      }
    } catch (e) {
      console.warn("Location error:", e?.message);
      if (mounted.current) setStatus("error");
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    requestLocation();
    return () => {
      mounted.current = false;
    };
  }, [requestLocation]);

  // ── Placeholders ──────────────────────────────────────────────────────────
  const Placeholder = ({ icon, title, sub, action, onAction, spinner }) => (
    <View style={[styles.mapPlaceholder, { backgroundColor: c.card }]}>
      {spinner ? (
        <ActivityIndicator size="large" color={c.primary} />
      ) : (
        <Ionicons name={icon} size={36} color={c.textSecondary} />
      )}
      {!!title && (
        <Text style={[styles.deniedTitle, { color: c.text }]}>{title}</Text>
      )}
      {!!sub && (
        <Text style={[styles.deniedSub, { color: c.textSecondary }]}>
          {sub}
        </Text>
      )}
      {!!action && (
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: c.primary }]}
          onPress={onAction}
        >
          <Text style={styles.retryText}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Shown instead of the embedded map when a map can't be rendered safely
  const LocationCard = () => (
    <View style={[styles.mapPlaceholder, { backgroundColor: c.card }]}>
      <View style={[styles.pinCircle, { backgroundColor: c.dangerSoft }]}>
        <Ionicons name="location" size={28} color={c.danger} />
      </View>
      <Text style={[styles.deniedTitle, { color: c.text }]}>
        Location found
      </Text>
      <Text style={[styles.deniedSub, { color: c.textSecondary }]}>
        {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
      </Text>
      <TouchableOpacity
        style={[styles.retryBtn, { backgroundColor: c.primary }]}
        onPress={() => openInMaps(location)}
      >
        <Text style={styles.retryText}>Open in Maps</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMapArea = () => {
    if (status === "loading" && !location) {
      return <Placeholder spinner sub="Fetching your location…" />;
    }
    if (status === "services-off") {
      return (
        <Placeholder
          icon="navigate-circle-outline"
          title="Location is turned off"
          sub="Turn on location (GPS) in your phone settings"
          action="Try again"
          onAction={requestLocation}
        />
      );
    }
    if (status === "denied") {
      return (
        <Placeholder
          icon="location-outline"
          title="Location access denied"
          sub="Allow location so help can reach you faster"
          action="Grant access"
          onAction={async () => {
            const { canAskAgain } =
              await Location.getForegroundPermissionsAsync();
            if (canAskAgain) requestLocation();
            else Linking.openSettings();
          }}
        />
      );
    }
    if (!location) {
      return (
        <Placeholder
          icon="cloud-offline-outline"
          title="Couldn't get your location"
          sub="Emergency services below still work"
          action="Try again"
          onAction={requestLocation}
        />
      );
    }
    if (mapFailed) return <LocationCard />;

    return (
      <MapErrorBoundary fallback={<LocationCard />}>
        <FreeMap
          latitude={location.latitude}
          longitude={location.longitude}
          zoom={16}
          markerColor={c.danger}
          accuracyRadius={Math.min(Math.max(location.accuracy || 60, 30), 300)}
          style={StyleSheet.absoluteFillObject}
          onError={() => setMapFailed(true)}
        />
        <TouchableOpacity
          onPress={() => openInMaps(location)}
          style={[styles.mapBtn, { backgroundColor: c.surface }]}
          accessibilityLabel="Open in Maps"
        >
          <Ionicons name="navigate" size={14} color={c.primary} />
          <Text style={[styles.mapBtnText, { color: c.primary }]}>
            Open in Maps
          </Text>
        </TouchableOpacity>
      </MapErrorBoundary>
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* Location label row */}
      <View style={styles.locationRow}>
        <View style={styles.locationLeft}>
          <Ionicons name="location-sharp" size={15} color={c.primary} />
          <Text style={[styles.locationLabel, { color: c.textSecondary }]}>
            Your Location
          </Text>
          {status === "loading" && !!location && (
            <ActivityIndicator size="small" color={c.textMuted} />
          )}
        </View>
        <TouchableOpacity
          onPress={requestLocation}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Refresh location"
        >
          <Ionicons name="refresh-outline" size={16} color={c.primary} />
        </TouchableOpacity>
      </View>

      {!!address && (
        <Text style={[styles.addressText, { color: c.text }]} numberOfLines={2}>
          {address}
        </Text>
      )}

      <View style={[styles.mapContainer, { backgroundColor: c.border }]}>
        {renderMapArea()}
      </View>

      {/* SOS pulse indicator + heading */}
      <View style={styles.titleRow}>
        <Animated.View
          style={[styles.sosPulse, { transform: [{ scale: pulse }] }]}
        />
        <View style={styles.sosDot} />
        <Text style={[styles.title, { color: c.text }]}>
          Choose Emergency Service
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  addressText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    lineHeight: 20,
  },
  mapContainer: {
    height: 230,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 18,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  pinCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  deniedTitle: { fontSize: 16, fontWeight: "700" },
  deniedSub: { fontSize: 13, textAlign: "center" },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
  },
  mapBtn: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    shadowColor: "#14243B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  mapBtnText: { fontSize: 12, fontWeight: "700" },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  sosPulse: {
    position: "absolute",
    left: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(179,38,30,0.25)",
  },
  sosDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#B3261E",
    marginLeft: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
