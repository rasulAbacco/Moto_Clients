import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme.js";
import { useEffect, useState } from "react";
import { getSelectedVehicle } from "../../vehicle/vehicle.service.js";
import { useRouter } from "expo-router";
import LocationModal from "./LocationModal.jsx";
import * as Location from "expo-location";

export default function HomeHeader() {
  const { theme } = useTheme();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [city, setCity] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    fetchLiveLocation();
  }, []);

  const fetchLiveLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCity("Unknown");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setCity(place?.city || place?.subregion || place?.region || "Unknown");
    } catch (e) {
      setCity("Unknown");
    }
  };

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const v = await getSelectedVehicle();
        setVehicle(v);
      } catch (e) {}
    };
    loadVehicle();
  }, []);

  const vehicleImage =
    vehicle?.model?.thumbnailUrl || vehicle?.brand?.logoUrl || null;
  const vehicleName = vehicle
    ? `${vehicle.brand?.name ?? ""} ${vehicle.model?.name ?? ""}`.trim()
    : null;
  const vehicleSub = vehicle
    ? [vehicle.fuelType, vehicle.transmission].filter(Boolean).join(" · ")
    : null;

  const isDark = theme.dark;
  const surface = isDark ? "#1c1c1e" : "#ffffff";
  const border = isDark ? "#3a3a3c" : "#e8e8e8";
  const textPrimary = isDark ? "#f5f5f5" : "#111111";
  const textSecondary = isDark ? "#8e8e93" : "#6b6b6b";
  const imageBg = isDark ? "#2a2a2c" : "#f2f2f7";
  const accent = theme.colors.primary;

  return (
    <>
      {/* ── Top row: location ─────────────────────────────── */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => setLocationModalVisible(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="location-sharp" size={14} color={accent} />
          <Text
            style={[styles.cityText, { color: textPrimary }]}
            numberOfLines={1}
          >
            {city ?? "Locating..."}
          </Text>
          <Ionicons name="chevron-down" size={12} color={textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Vehicle card ──────────────────────────────────── */}
      {vehicle ? (
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: surface, borderColor: border },
          ]}
          onPress={() => router.push("/vehicles")}
          activeOpacity={0.8}
        >
          {/* Left: image */}
          <View style={[styles.imageWrap, { backgroundColor: imageBg }]}>
            {vehicleImage ? (
              <Image
                source={{ uri: vehicleImage }}
                style={styles.carImage}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="car-outline" size={32} color={textSecondary} />
            )}
          </View>

          {/* Middle: name + sub */}
          <View style={styles.cardBody}>
            <Text
              style={[styles.carName, { color: textPrimary }]}
              numberOfLines={1}
            >
              {vehicleName}
            </Text>
            {vehicleSub ? (
              <Text
                style={[styles.carSub, { color: textSecondary }]}
                numberOfLines={1}
              >
                {vehicleSub}
              </Text>
            ) : null}
          </View>

          {/* Right: change icon */}
          <View style={[styles.changeBtn, { backgroundColor: accent + "15" }]}>
            <Ionicons name="swap-horizontal-outline" size={16} color={accent} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.card,
            styles.cardEmpty,
            { backgroundColor: surface, borderColor: border },
          ]}
          onPress={() => router.push("/add-vehicle")}
          activeOpacity={0.8}
        >
          <View style={[styles.imageWrap, { backgroundColor: imageBg }]}>
            <Ionicons
              name="add-circle-outline"
              size={26}
              color={textSecondary}
            />
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.carName, { color: textSecondary }]}>
              Add your vehicle
            </Text>
            <Text style={[styles.carSub, { color: textSecondary }]}>
              Personalise your experience
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={textSecondary} />
        </TouchableOpacity>
      )}

      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelect={(c) => setCity(c)}
        selectedCity={city}
      />
    </>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cityText: {
    fontSize: 15,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  cardEmpty: {
    paddingVertical: 13,
  },

  imageWrap: {
    width: 72,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  carImage: {
    width: 72,
    height: 46,
  },

  cardBody: {
    flex: 1,
    gap: 3,
  },
  carName: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  carSub: {
    fontSize: 12,
    fontWeight: "500",
  },

  changeBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});
