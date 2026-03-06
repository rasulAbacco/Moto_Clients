import { useRouter } from "expo-router";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import AppCard from "../../components/ui/AppCard";
import AppText from "../../components/ui/AppText";
import { Ionicons } from "@expo/vector-icons"; // Assuming you use Expo icons

export default function GarageList({ garages = [] }) {
  const router = useRouter();

  return garages.map((service) => (
    <AppCard
      key={service.id}
      style={styles.card}
      onPress={() => router.push(`/service/${service.id}`)}
    >
      {/* Top Section: Image & Badge */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              service.images?.[0] ||
              "https://5.imimg.com/data5/HV/LJ/TO/SELLER-39713083/car-engine-repair-services-500x500.jpeg",
          }}
          style={styles.image}
          resizeMode="cover"
        />
        {service.offers && (
          <View style={styles.badge}>
            <AppText style={styles.badgeText}>{service.offers}</AppText>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <AppText variant="subtitle" style={styles.serviceName}>
              {service.serviceName}
            </AppText>
            <AppText style={styles.garageName}>
              <Ionicons name="business-outline" size={12} />{" "}
              {service.garage?.name}
            </AppText>
          </View>
          <View style={styles.ratingBox}>
            <AppText style={styles.ratingText}>
              ⭐ {service.serviceRating}
            </AppText>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" color="#666" size={14} />
            <AppText style={styles.infoText}>{service.timeTaken}</AppText>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" color="#666" size={14} />
            <AppText style={styles.infoText}>{service.warranty}</AppText>
          </View>
        </View>

        <View style={styles.footer}>
          <AppText style={styles.price}>{service.pricing}</AppText>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push(`/service/${service.id}`)}
          >
            <AppText style={styles.buttonText}>View Details</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </AppCard>
  ));
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 0, // Let image touch edges
    overflow: "hidden",
    borderRadius: 16,
    elevation: 4,
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: "100%",
    height: 160,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FF5252",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  content: { padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  serviceName: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  garageName: { fontSize: 13, color: "#666" },
  ratingBox: {
    backgroundColor: "#F0F9FF",
    padding: 6,
    borderRadius: 8,
  },
  ratingText: { fontWeight: "bold", fontSize: 13 },
  infoGrid: {
    flexDirection: "row",
    gap: 15,
    marginVertical: 12,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoText: { fontSize: 13, color: "#555" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  price: { fontSize: 18, fontWeight: "800", color: "#2E7D32" },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
