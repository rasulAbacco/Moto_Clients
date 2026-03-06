import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme.js";
import { useEffect, useState } from "react";
import { getSelectedVehicle } from "../../vehicle/vehicle.service.js";
import { useRouter } from "expo-router";
import LocationModal from "./LocationModal";

export default function HomeHeader() {
  const { theme } = useTheme();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [city, setCity] = useState("Bengaluru");
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const v = await getSelectedVehicle();
        setVehicle(v);
      } catch (e) {
        // ignore
      }
    };
    loadVehicle();
  }, []);

  return (
    <>
      <View style={styles.container}>
        {/* Location row */}
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => setLocationModalVisible(true)}
          activeOpacity={0.75}
        >
          <Ionicons
            name="location-sharp"
            size={15}
            color={theme.colors.primary}
          />
          <Text style={[styles.cityText, { color: theme.colors.text }]}>
            {city}
          </Text>
          <Ionicons
            name="chevron-down"
            size={13}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Vehicle chip (if selected) */}
        {vehicle ? (
          <TouchableOpacity
            style={[
              styles.vehicleChip,
              {
                backgroundColor: theme.colors.primary + "15",
                borderColor: theme.colors.primary + "30",
              },
            ]}
            onPress={() => router.push("/vehicles")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="car-outline"
              size={13}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.vehicleText, { color: theme.colors.primary }]}
              numberOfLines={1}
            >
              {vehicle.brand?.name} {vehicle.model?.name}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.vehicleChip,
              {
                backgroundColor: theme.colors.card || "#f5f5f5",
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.push("/add-vehicle")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add-circle-outline"
              size={13}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.vehicleText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Add Vehicle
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
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
  vehicleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 160,
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
