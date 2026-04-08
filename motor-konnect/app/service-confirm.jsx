import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "../src/hooks/useCart";
import { useAuth } from "../src/providers/AuthProvider";
import api from "../src/services/apiClient";

export default function ServiceConfirmScreen() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const { garageId, name } = useLocalSearchParams();

  // ==============================
  // DEBUG LOGS (VERY IMPORTANT)
  // ==============================
  console.log("🧾 CART ITEMS:", cartItems);
  console.log("🏠 GARAGE PARAMS:", { garageId, name });
  console.log("👤 USER:", user);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ==============================
  // 🔥 BOOKING FUNCTION
  // ==============================
  const handleConfirm = async () => {
    try {
      console.log("🚀 CONFIRM BUTTON CLICKED");

      const selectedService = cartItems[0];

      console.log("📦 SELECTED SERVICE:", selectedService);

      // ✅ VALIDATION
      if (!selectedService) {
        console.log("❌ No service in cart");
        return Alert.alert("Error", "Cart is empty");
      }

      if (!selectedService.slug) {
        console.log("❌ Missing slug in cart item:", selectedService);
        return Alert.alert("Error", "Service mapping missing (slug)");
      }

      if (!garageId) {
        console.log("❌ Missing garageId");
        return Alert.alert("Error", "Garage not selected");
      }

      if (!user?.id) {
        console.log("❌ Missing user");
        return Alert.alert("Error", "User not logged in");
      }

      const payload = {
        externalServiceId: selectedService.slug, // 🔥 KEY FIX
        garageId: Number(garageId),
        clientId: user.id,
        scheduledAt: new Date().toISOString(),
        carType: "SUV",
      };

      console.log("📤 FINAL BOOKING PAYLOAD:", payload);

      // ==============================
      // API CALL
      // ==============================
      const res = await api.post("/marketplace/book", payload);

      console.log("✅ BOOKING SUCCESS:", res.data);

      clearCart();

      Alert.alert("Booking Confirmed 🚗", "Garage has received your request.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/services"),
        },
      ]);
    } catch (err) {
      console.log("❌ BOOKING ERROR:", err?.response?.data || err.message);

      Alert.alert(
        "Booking Failed",
        err?.response?.data?.message || "Something went wrong",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Booking</Text>
      </View>

      {/* Garage */}
      <View style={styles.section}>
        <Text style={styles.label}>Selected Garage</Text>
        <Text style={styles.value}>{name || "N/A"}</Text>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.label}>Services</Text>

        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.title} × {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                ₹{item.price * item.quantity}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Total */}
      <View style={styles.section}>
        <Text style={styles.label}>Estimated Cost</Text>
        <Text style={styles.total}>₹{total}</Text>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 No online payment required. Pay after service completion.
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.btn} onPress={handleConfirm}>
        <Text style={styles.btnText}>Confirm Booking</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  section: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  itemName: {
    fontSize: 14,
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
  },

  total: {
    fontSize: 18,
    fontWeight: "700",
  },

  infoBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
  },

  infoText: {
    fontSize: 13,
    color: "#444",
  },

  btn: {
    margin: 16,
    backgroundColor: "#0062ff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
