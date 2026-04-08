//client\src\features\sos\components\SOSMapHeader.jsx
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useEffect, useState, useRef } from "react";

export default function SOSMapHeader() {
  const { theme } = useTheme();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  // Pulse animation for the SOS dot
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, []);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setLoading(true);
    setDenied(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setDenied(true);
        setLoading(false);
        return;
      }
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(current.coords);

      // Reverse geocode
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
      if (geo) {
        setAddress(
          [geo.name, geo.street, geo.city, geo.region]
            .filter(Boolean)
            .join(", "),
        );
      }
    } catch (e) {
      console.warn("Location error:", e.message);
      setDenied(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Location label row */}
      <View style={styles.locationRow}>
        <View style={styles.locationLeft}>
          <Ionicons
            name="location-sharp"
            size={15}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.locationLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Your Location
          </Text>
        </View>
        <TouchableOpacity
          onPress={requestLocation}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="refresh-outline"
            size={16}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {address && (
        <Text
          style={[styles.addressText, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {address}
        </Text>
      )}

      {/* Map container */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View
            style={[
              styles.mapPlaceholder,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              style={[
                styles.placeholderText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Fetching your location…
            </Text>
          </View>
        ) : denied ? (
          <View
            style={[
              styles.mapPlaceholder,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Ionicons
              name="location-outline"
              size={36}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.deniedTitle, { color: theme.colors.text }]}>
              Location Access Denied
            </Text>
            <Text
              style={[styles.deniedSub, { color: theme.colors.textSecondary }]}
            >
              Enable location to see your position
            </Text>
            <TouchableOpacity
              style={[
                styles.retryBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={requestLocation}
            >
              <Text style={styles.retryText}>Grant Access</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.012,
              longitudeDelta: 0.012,
            }}
            showsUserLocation={false}
            showsCompass={false}
            showsMyLocationButton={false}
          >
            {/* Accuracy circle */}
            <Circle
              center={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              radius={120}
              fillColor="rgba(239,68,68,0.12)"
              strokeColor="rgba(239,68,68,0.4)"
              strokeWidth={1}
            />
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.markerOuter}>
                <View style={styles.markerInner} />
              </View>
            </Marker>
          </MapView>
        )}
      </View>

      {/* SOS pulse indicator + heading */}
      <View style={styles.titleRow}>
        <Animated.View
          style={[styles.sosPulse, { transform: [{ scale: pulse }] }]}
        />
        <View style={styles.sosDot} />
        <Text style={[styles.title, { color: theme.colors.text }]}>
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
    backgroundColor: "#E5E7EB",
    marginBottom: 18,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  placeholderText: { fontSize: 13 },
  deniedTitle: { fontSize: 16, fontWeight: "700" },
  deniedSub: { fontSize: 13, textAlign: "center" },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // Custom marker
  markerOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(239,68,68,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  markerInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#fff",
  },

  // Title row
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
    backgroundColor: "rgba(239,68,68,0.25)",
  },
  sosDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
    marginLeft: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
