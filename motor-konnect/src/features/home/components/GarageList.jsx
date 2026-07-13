// src/features/home/components/GarageList.jsx
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useAppStore from "../../../store/useAppStore";
import { getLowestPriceForGarage } from "../../../utils/pricing";

const PRIMARY_BLUE = "#007AFF";

export default function GarageList({ garages, loading }) {
  const router = useRouter();
  // ✅ Reads directly from the global store now — no more prop drilling
  // selectedVehicleType down from HomeScreen -> SectionRenderer -> here.
  const activeVehicleType = useAppStore((s) => s.activeVehicleType);

  if (loading)
    return (
      <View style={styles.center}>
        <Text style={styles.loaderText}>Searching workshops...</Text>
      </View>
    );
  if (!garages?.length)
    return (
      <View style={styles.center}>
        <Text style={styles.loaderText}>No workshops found.</Text>
      </View>
    );

  const renderItem = ({ item }) => {
    const garageId = item.id ?? item.userId;
    const lowestPrice = getLowestPriceForGarage(item, activeVehicleType);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          // ✅ ID-driven navigation only. ServiceGrid fetches the full
          // nested service tree itself on mount via garageId.
          router.push({
            pathname: "/garage-services",
            params: { garageId },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={PRIMARY_BLUE} />
            <Text style={styles.verifiedText}>PRO</Text>
          </View>
          <View style={styles.ratingGroup}>
            <Ionicons name="star" size={10} color="#FFB800" />
            <Text style={styles.ratingText}>
              {Number(item.avgRating || 4.5).toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.name} numberOfLines={1}>
            {item.companyName || item.name}
          </Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={10} color="#8E8E93" />
            <Text style={styles.address} numberOfLines={1}>
              {item.address || "Main Workshop"}
            </Text>
          </View>
        </View>

        <View style={styles.vehicleTypeTag}>
          <Ionicons name="car-sport" size={10} color={PRIMARY_BLUE} />
          <Text style={styles.vehicleTypeText}>{activeVehicleType}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.priceLabel}>EST. STARTING</Text>
            <Text style={styles.priceValue}>
              {lowestPrice ? `₹${lowestPrice}` : "N/A"}
            </Text>
          </View>
          <View style={styles.blueButton}>
            <Ionicons name="chevron-forward" size={12} color="#FFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Nearby Workshops</Text>
      <FlatList
        data={garages}
        numColumns={2}
        keyExtractor={(item, index) => String(item.id ?? item.userId ?? index)}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderItem}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 15 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  columnWrapper: { justifyContent: "space-between" },
  listContainer: { paddingBottom: 10 },
  center: { padding: 40, alignItems: "center" },
  loaderText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    justifyContent: "space-between",
    minHeight: 175,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  verifiedText: { fontSize: 9, fontWeight: "800", color: PRIMARY_BLUE },
  ratingGroup: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 11, fontWeight: "700", color: "#1A1A1A" },
  cardBody: { marginTop: 10, marginBottom: 6 },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  address: { fontSize: 11, color: "#8E8E93", fontWeight: "500", flex: 1 },
  vehicleTypeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 10,
  },
  vehicleTypeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#636366",
    textTransform: "uppercase",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F8F9FA",
  },
  priceLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  priceValue: { fontSize: 16, fontWeight: "800", color: PRIMARY_BLUE },
  blueButton: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: PRIMARY_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
});
