// src/features/home/components/UnifiedSearchResults.jsx
//
// Renders the flat "Zomato dish-vs-restaurant" comparison list returned by
// /services/search — one row per service, each carrying its parent
// garage's metadata. Tapping a row goes straight to the deep-dive screen
// via subServiceId + garageId only (no payload).
//
// Also used as the plain services list (non-search, browsing state) —
// pass rows shaped the same way and it just works.

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getServicePrice } from "../../../utils/pricing";
import useAppStore from "../../../store/useAppStore";

const PRIMARY_BLUE = "#007AFF";

export default function UnifiedSearchResults({ rows, loading, title }) {
  const router = useRouter();
  const activeVehicleType = useAppStore((s) => s.activeVehicleType);

  if (loading) {
    return (
      <View>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.center}>
          <Text style={styles.loaderText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!rows?.length) {
    return (
      <View>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.center}>
          <Text style={styles.loaderText}>No services available yet.</Text>
        </View>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const { final, original } = getServicePrice(item, activeVehicleType);
    const hasDiscount = original > final;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() =>
          // ✅ ID-only params — SubServiceDetails looks up the rest itself.
          router.push({
            pathname: "/sub-service/[id]",
            params: {
              id: item.serviceId ?? item.id,
              garageId: item.garageId,
            },
          })
        }
      >
        <View style={styles.imageWrap}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="construct-outline" size={22} color="#B0B0B8" />
          )}
        </View>

        <View style={styles.rowLeft}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {item.serviceName ?? item.name}
          </Text>
          <View style={styles.garageLine}>
            <Ionicons name="storefront-outline" size={11} color="#8E8E93" />
            <Text style={styles.garageName} numberOfLines={1}>
              {item.garageName ?? "Unknown Garage"}
            </Text>
            <Ionicons
              name="star"
              size={11}
              color="#FFB800"
              style={{ marginLeft: 6 }}
            />
            <Text style={styles.rating}>
              {Number(item.garageRating ?? 4.5).toFixed(1)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{final}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{original}</Text>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={rows}
        keyExtractor={(item, i) =>
          // ✅ FIX: always include the array index. serviceId/garageId
          // alone aren't guaranteed unique (source data can duplicate
          // a service across sections/garages) — index guarantees no
          // "two children with the same key" crash regardless.
          `${String(item.serviceId ?? item.id ?? "row")}-${String(item.garageId)}-${i}`
        }
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  center: { padding: 30, alignItems: "center" },
  loaderText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    gap: 12,
  },
  imageWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  rowLeft: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  garageLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  garageName: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "500",
    flexShrink: 1,
  },
  rating: { fontSize: 11, color: "#1a1a1a", fontWeight: "600" },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  price: { fontSize: 15, fontWeight: "800", color: PRIMARY_BLUE },
  originalPrice: {
    fontSize: 12,
    color: "#B0B0B8",
    textDecorationLine: "line-through",
  },
});
