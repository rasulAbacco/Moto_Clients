import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme.js";
import { useCallback, useState } from "react";
import {
  getSelectedVehicle,
  setSelectedVehicle,
} from "../../vehicle/vehicle.service.js";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import LocationModal from "./LocationModal.jsx";
import * as Location from "expo-location";
import { useAuth } from "../../../providers/AuthProvider.jsx";
import api from "../../../services/apiClient.js";

export default function HomeHeader() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [city, setCity] = useState(null);
  const [fullAddress, setFullAddress] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // ✅ Runs every time Home screen comes into focus (e.g. back from VehiclesScreen)
  useFocusEffect(
    useCallback(() => {
      fetchLiveLocation();
      loadVehicle();
    }, [user])
  );

  const fetchLiveLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCity("Unknown");
        setFullAddress("Unknown");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (place) {
        setCity(place?.city || place?.subregion || place?.region || "Unknown");
        const address = [
          place.street,
          place.district,
          place.subregion,
          place.city,
          place.region,
          place.postalCode,
        ]
          .filter(Boolean)
          .join(", ");
        setFullAddress(address);
      }
    } catch (e) {
      setCity("Unknown");
      setFullAddress("Unknown");
    }
  };

  const loadVehicle = async () => {
    try {
      if (user) {
        const res = await api.get("/auth/vehicles");
        const all = res.data?.data || [];
        const primary = all.find((v) => v.isPrimary) ?? all[0] ?? null;

        if (primary) {
          const normalized = normalizeApiVehicle(primary);
          setVehicle(normalized);
          await setSelectedVehicle(normalized);
        } else {
          setVehicle(null);
        }
      } else {
        const v = await getSelectedVehicle();
        setVehicle(v);
      }
    } catch (e) {
      console.log("HomeHeader loadVehicle error:", e.message);
      try {
        const v = await getSelectedVehicle();
        setVehicle(v);
      } catch {}
    }
  };

  /**
   * API now returns model.thumbnailUrl directly (enriched in getVehicles).
   * Priority: model.thumbnailUrl → brand.logoUrl → null
   */
  const normalizeApiVehicle = (v) => ({
    isPrimary: v.isPrimary ?? false,
    brand: {
      name: v.brand?.name ?? "",
      logoUrl: v.brand?.logoUrl ?? null,
    },
    model: {
      name: v.model?.name ?? "",
      thumbnailUrl: v.model?.thumbnailUrl ?? null, // ✅ now set by getVehicles
      segment: v.model?.segment ?? null,
    },
    fuelType: v.fuelType ?? null,
    transmission: v.transmission ?? null,
    modelYear: v.modelYear?.year ?? null,
    registration: v.registration ?? null,
  });

  const vehicleImage =
    vehicle?.model?.thumbnailUrl ?? vehicle?.brand?.logoUrl ?? null;

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
      {/* ── Location row ──────────────────────────────────── */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => setLocationModalVisible(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="location-sharp" size={14} color={accent} />
          <Text
            style={[styles.cityText, { color: textPrimary }]}
            numberOfLines={2}
          >
            {fullAddress || city || "Locating..."}
          </Text>
          <Ionicons name="chevron-down" size={12} color={textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Vehicle card ──────────────────────────────────── */}
      {vehicle ? (
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: surface,
              borderColor: vehicle.isPrimary ? accent + "60" : border,
              borderWidth: vehicle.isPrimary ? 1.2 : StyleSheet.hairlineWidth,
            },
          ]}
          onPress={() => router.push("/vehicles")}
          activeOpacity={0.8}
        >
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

          <View style={styles.cardBody}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.carName, { color: textPrimary }]}
                numberOfLines={1}
              >
                {vehicleName}
              </Text>
              {vehicle.isPrimary && (
                <Ionicons
                  name="star"
                  size={11}
                  color={accent}
                  style={{ marginLeft: 5 }}
                />
              )}
            </View>

            {vehicleSub ? (
              <Text
                style={[styles.carSub, { color: textSecondary }]}
                numberOfLines={1}
              >
                {vehicleSub}
              </Text>
            ) : null}

            {vehicle.model?.segment ? (
              <View
                style={[styles.segmentBadge, { backgroundColor: accent + "15" }]}
              >
                <Text style={[styles.segmentText, { color: accent }]}>
                  {vehicle.model.segment.replace("_", " ")}
                </Text>
              </View>
            ) : null}
          </View>

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
          onPress={() => router.push("/vehicle/type")}
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
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
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
  segmentBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 2,
  },
  segmentText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  changeBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});