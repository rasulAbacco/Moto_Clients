import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function GarageList({ garages, loading }) {
  const router = useRouter();

  if (loading) {
    return <Text style={{ textAlign: "center" }}>Loading garages...</Text>;
  }

  if (!garages?.length) {
    return <Text style={{ textAlign: "center" }}>No garages found</Text>;
  }

  // ✅ Get lowest price from nested services
  const getLowestPrice = (garage) => {
    if (!garage.services?.length) return null;

    const prices = [];

    garage.services.forEach((main) => {
      main.sections?.forEach((section) => {
        section.services?.forEach((svc) => {
          svc.pricing?.forEach((p) => {
            if (p.price) prices.push(p.price);
          });
        });
      });
    });

    if (!prices.length) return null;

    return Math.min(...prices);
  };

  const renderItem = ({ item }) => {
    const garageId = item.id ?? item.userId;
    const rating = item.avgRating ?? 4.0;
    const lowestPrice = getLowestPrice(item);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/garage-services",
            params: {
              garageId: garageId,
              garageName: item.companyName || item.name,
              services: JSON.stringify(item.services),

              // ✅ FIXED: Pass the FULL item object
              // This includes address, phone, and email from your API
              garage: JSON.stringify(item),
            },
          })
        }
      >
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Trusted</Text>
        </View>

        {/* Name */}
        <Text style={styles.name} numberOfLines={1}>
          {item.companyName || item.name || "Garage"}
        </Text>

        {/* Address */}
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.meta} numberOfLines={1}>
            {item.address || "No address"}
          </Text>
        </View>

        {/* Bottom */}
        <View style={styles.bottomRow}>
          {/* ⭐ Rating */}
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#fff" />
            <Text style={styles.ratingText}>{Number(rating).toFixed(1)}</Text>
          </View>

          {/* 💰 Price */}
          <Text style={styles.price}>
            {lowestPrice ? `₹${lowestPrice} onwards` : "Price unavailable"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <Text style={styles.title}>Nearby Garages</Text>

      <FlatList
        data={garages}
        numColumns={2}
        keyExtractor={(item, index) => String(item.id ?? item.userId ?? index)}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    marginHorizontal: 4,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },

    elevation: 3,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#e6f0ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0066ff",
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  meta: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1778ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  ratingText: {
    color: "#fff",
    fontSize: 11,
    marginLeft: 3,
    fontWeight: "600",
  },

  price: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1b6afc",
  },
});
