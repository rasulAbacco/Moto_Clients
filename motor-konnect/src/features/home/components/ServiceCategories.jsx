// src/features/home/components/ServiceCategories.jsx
//
// Renders the Home "browse categories" section — plain MainService rows
// from GET /services (e.g. "Car Services", "Denting & Painting"). These
// are catalog CATEGORIES, not bookable sub-services: no price, no garage,
// no rating attached at this level. That's the whole bug this file fixes
// — UnifiedSearchResults was wrongly reused here and both (a) rendered
// fake "Unknown Garage / ★4.5 / ₹0" placeholders for fields that don't
// exist on a MainService, and (b) navigated straight to
// /sub-service/[id] using the MainService's own id, which 404s because
// that id was never a sub-service.
//
// Tapping a category here goes to /services/[id] (mainServiceId only,
// no garageId) — that screen's existing fallback already calls the
// confirmed-working GET /services/:id?vehicleType= to drill into
// sections + sub-services from the catalog.

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useAppStore from "../../../store/useAppStore";

const PRIMARY_BLUE = "#007AFF";

const ICON_MAP = {
  default: "construct-outline",
  tyre: "ellipse-outline",
  battery: "battery-charging-outline",
  service: "settings-outline",
  wash: "water-outline",
  ac: "thermometer-outline",
  denting: "hammer-outline",
};

export default function ServiceCategories({ categories, loading }) {
  const router = useRouter();
  const activeVehicleType = useAppStore((s) => s.activeVehicleType);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loaderText}>Loading categories...</Text>
      </View>
    );
  }

  if (!categories?.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.loaderText}>No categories available.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const iconKey = item.name?.toLowerCase() || "default";
    const iconName = ICON_MAP[iconKey] || ICON_MAP.default;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() =>
          // ✅ FIX: mainServiceId only, no garageId — this is generic
          // catalog browsing, not tied to any specific garage yet.
          router.push({
            pathname: "/services/[id]",
            params: { id: item.id, vehicleType: activeVehicleType },
          })
        }
      >
        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={20} color={PRIMARY_BLUE} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={categories}
      keyExtractor={(item, i) => String(item.id ?? i)}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  center: { padding: 30, alignItems: "center" },
  loaderText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: PRIMARY_BLUE + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { flex: 1, fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
});
