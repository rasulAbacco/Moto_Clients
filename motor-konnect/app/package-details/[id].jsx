// app/package-details/[id].jsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../src/hooks/useCart";
import { safeBack } from "../../src/utils/navigation";
import ScreenHeader from "../../src/components/common/ScreenHeader";

export default function PackageDetailsScreen() {
  const { id, packageData } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, cartItems, clearCart } = useCart();

  const pkg = packageData ? JSON.parse(packageData) : null;
  if (!pkg) return null;

  const handleAddToCart = () => {
    const existingService = cartItems.find(
      (item) => item.source === "service" || item.source === "package",
    );

    const executeAdd = () => {
      const gId = pkg.garageId || pkg.userId || pkg.user?.id;
      const gName = pkg.garageName || pkg.user?.companyName || "Garage";

      if (!gId) {
        Alert.alert(
          "Error",
          "Garage ID not found. Please try refreshing the home screen.",
        );
        return;
      }

      // ✅ Normalize services array — handle both { serviceName } and { name } shapes
      const normalizedServices = (pkg.services || []).map((s) => ({
        serviceName: s.serviceName || s.name || "",
      }));

      addToCart({
        id: pkg.id,
        title: pkg.name,
        price: pkg.price,
        source: "package", // ✅ was "service" — now correctly "package"
        garageId: gId,
        garageName: gName,

        // ✅ Services included so the booking payload can send them to the CRM
        services: normalizedServices,

        // ✅ Full garage details for the confirmation screen
        garage: {
          id: gId,
          name: gName,
          address: pkg.address || pkg.user?.address || "Address Not Available",
          phone: pkg.phone || pkg.user?.phone || "Phone Not Available",
          email: pkg.email || pkg.user?.email || "Email Not Available",
        },
        quantity: 1,
      });

      router.push("/cart");
    };

    if (
      existingService &&
      String(existingService.garageId) !== String(pkg.garageId || pkg.userId)
    ) {
      Alert.alert(
        "Replace Cart Items?",
        `Your cart has items from "${existingService.garageName}". You can only book with one garage at a time.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => {
              clearCart();
              executeAdd();
            },
          },
        ],
      );
    } else {
      executeAdd();
    }
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <ScreenHeader title="Package Details" onBack={() => safeBack(router)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{pkg.name}</Text>
          <Text style={styles.price}>₹{pkg.price}</Text>
          <Text style={styles.garage}>
            {pkg.garageName || pkg.user?.companyName}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Included Services:</Text>
          {pkg.services?.map((s, i) => (
            <View key={i} style={styles.serviceRow}>
              <Ionicons name="checkmark-circle" size={18} color="#6DB892" />
              <Text style={styles.serviceText}>{s.serviceName || s.name}</Text>
            </View>
          ))}
        </View>

        {pkg.description && (
          <View style={styles.section}>
            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.description}>{pkg.description}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.bookBtn} onPress={handleAddToCart}>
        <Text style={styles.bookBtnText}>Confirm & Add to Cart</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E3E6EB",
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", marginLeft: 12 },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#14243B" },
  price: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1E3A5F",
    marginVertical: 8,
  },
  garage: { fontSize: 14, color: "#6B7280" },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  sectionLabel: { fontSize: 16, fontWeight: "700", marginBottom: 15 },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  serviceText: { fontSize: 15, color: "#374151" },
  descTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  description: { fontSize: 14, color: "#6B7280", lineHeight: 22 },
  bookBtn: {
    margin: 20,
    backgroundColor: "#1E3A5F",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
