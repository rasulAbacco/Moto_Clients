//client/src/features/home/components/LocationModal.jsx
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function LocationModal({
  visible,
  onClose,
  onSelect,
  selectedCity,
}) {
  const { theme } = useTheme();

  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchLocation();
    }
  }, [visible]);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setAddress("Location permission denied");
        setLoading(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geo] = await Location.reverseGeocodeAsync({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });

      if (geo) {
        // ✅ FULL detailed address (same like SOS)
        const formatted = [
          geo.name,
          geo.street,
          geo.district,
          geo.subregion,
          geo.city,
          geo.region,
          geo.postalCode,
          geo.country,
        ]
          .filter(Boolean)
          .join(", ");

        setAddress(formatted);
      }
    } catch (e) {
      setAddress("Unable to fetch location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.border,
            },
          ]}
          onPress={() => {}}
        >
          {/* Handle */}
          <View
            style={[styles.handle, { backgroundColor: theme.colors.border }]}
          />

          {/* Title */}
          <View style={styles.titleRow}>
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
              Your Location
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={22}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Location Content */}
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View
                style={[
                  styles.cityIcon,
                  { backgroundColor: theme.colors.card || "#f5f5f5" },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={theme.colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.cityName, { color: theme.colors.text }]}
                >
                  Current Location
                </Text>

                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{ marginTop: 4 }}
                  />
                ) : (
                  <Text
                    style={[
                      styles.stateName,
                      { color: theme.colors.textSecondary },
                    ]}
                    numberOfLines={3}
                  >
                    {address || "Fetching location..."}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {Platform.OS === "ios" && <View style={{ height: 20 }} />}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 0.5,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cityName: {
    fontSize: 15,
    fontWeight: "600",
  },
  stateName: {
    fontSize: 11,
    marginTop: 2,
  },
});