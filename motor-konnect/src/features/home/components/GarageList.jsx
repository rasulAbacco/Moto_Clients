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

  const renderItem = ({ item }) => {
    const garageId = item.id ?? item.userId;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/service-confirm",
            params: {
              garageId,
              name: item.companyName,
            },
          })
        }
      >
        {/* Top Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Trusted</Text>
        </View>

        {/* Garage Name */}
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

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#fff" />
            <Text style={styles.ratingText}>4.5</Text>
          </View>

          <Text style={styles.price}>₹499 onwards</Text>
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

    // Shadow (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },

    // Elevation (Android)
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
    backgroundColor: "#00a86b",
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
    color: "#333",
  },
});
