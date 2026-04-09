// app/screens/service-confirm.jsx  (APP SIDE)
//
// ─── FIXES ───────────────────────────────────────────────────────
//  FIX 1 — Uses same hardcoded BASE_URL that works for booking
//  FIX 2 — slug is undefined in cart → falls back to item.id (App service UUID)
//           The CRM MarketplaceService.externalServiceId must match this UUID
//  FIX 3 — clientId: calls /marketplace/client-lookup on CRM to get integer Client.id
//           because App user.id (UUID) ≠ CRM Client.id (integer)
// ─────────────────────────────────────────────────────────────────

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useCart } from "../src/hooks/useCart";
import { useAuth } from "../src/providers/AuthProvider";
import axios from "axios";

// ✅ Same base URL used everywhere — matches the working /marketplace/book call
// const BASE_URL = "https://cqw6v494-8000.inc1.devtunnels.ms/api/v1";
const BASE_URL = "https://ld3bgq17-8000.inc1.devtunnels.ms/api/v1";

export default function ServiceConfirmScreen() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const { garageId, name } = useLocalSearchParams();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ─────────────────────────────────────────────────────────────
  // Calls CRM to find or create a Client by phone number.
  // Returns integer Client.id that MarketplaceBooking.clientId needs.
  // App user.id is a UUID — completely different from CRM Client.id.
  // ─────────────────────────────────────────────────────────────
  const resolveCrmClientId = async () => {
    const res = await axios.post(`${BASE_URL}/marketplace/client-lookup`, {
      phone: user.phone,
      name: user.name,
      email: user.email || null,
    });

    if (!res.data?.success || !res.data?.data?.clientId) {
      throw new Error("Could not resolve CRM client ID");
    }

    return res.data.data.clientId; // integer
  };

  // const handleConfirm = async () => {
  //   try {
  //     setConfirming(true);

  //     if (!cartItems || cartItems.length === 0) {
  //       return Alert.alert("Error", "Cart is empty");
  //     }

  //     if (!garageId) {
  //       return Alert.alert("Error", "Garage not selected");
  //     }

  //     if (!user?.phone) {
  //       return Alert.alert("Error", "Your account is missing a phone number");
  //     }

  //     // Resolve CRM clientId once — same client for all bookings
  //     const clientId = await resolveCrmClientId();

  //     // Send one booking per cart item
  //     const results = await Promise.allSettled(
  //       cartItems.map((item) => {
  //         const externalServiceId = item.slug || item.id;

  //         if (!externalServiceId) return Promise.reject(new Error("Service ID missing"));

  //         const payload = {
  //           externalServiceId,
  //           garageId: Number(garageId),
  //           clientId,
  //           scheduledAt: new Date().toISOString(),
  //           carType: item.carType || "SEDAN",
  //           serviceName: item.title,
  //           appPrice: item.price,
  //           totalCartPrice: total,
  //         };

  //         console.log("📤 Sending booking:", payload);

  //         return axios.post(`${BASE_URL}/marketplace/book`, payload);
  //       })
  //     );

  //     // Check results
  //     const failed = results.filter((r) => r.status === "rejected");
  //     const succeeded = results.filter((r) => r.status === "fulfilled");

  //     console.log(`✅ ${succeeded.length} bookings confirmed, ❌ ${failed.length} failed`);

  //     clearCart();

  //     if (failed.length === 0) {
  //       Alert.alert(
  //         "Booking Confirmed 🚗",
  //         `${succeeded.length} service${succeeded.length > 1 ? "s" : ""} booked. Garage has received your request.`,
  //         [{ text: "OK", onPress: () => router.replace("/(tabs)/services") }]
  //       );
  //     } else {
  //       Alert.alert(
  //         "Partially Confirmed ⚠️",
  //         `${succeeded.length} booked, ${failed.length} failed. Please try again for failed services.`,
  //         [{ text: "OK", onPress: () => router.replace("/(tabs)/services") }]
  //       );
  //     }
  //   } catch (err) {
  //     console.error("❌ Booking error:", err?.response?.data || err.message);
  //     Alert.alert(
  //       "Booking Failed",
  //       err?.response?.data?.message || "Something went wrong"
  //     );
  //   } finally {
  //     setConfirming(false);
  //   }
  // };
  const handleConfirm = async () => {
    try {
      setConfirming(true);

      if (!cartItems || cartItems.length === 0) {
        return Alert.alert("Error", "Cart is empty");
      }

      if (!garageId) {
        return Alert.alert("Error", "Garage not selected");
      }

      if (!user?.phone) {
        return Alert.alert("Error", "Your account is missing a phone number");
      }

      const clientId = await resolveCrmClientId();

      // ← Send ONE booking with combined service names and total price
      const serviceNames = cartItems.map((i) => i.title).join(", ");
      const totalPrice = cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );

      // Use first item's ID as primary externalServiceId
      const primaryItem = cartItems[0];
      const externalServiceId = primaryItem.slug || primaryItem.id;

      if (!externalServiceId) {
        return Alert.alert(
          "Error",
          "Service ID missing. Please re-add to cart.",
        );
      }

      const payload = {
        externalServiceId,
        garageId: Number(garageId),
        clientId,
        scheduledAt: new Date().toISOString(),
        carType: primaryItem.carType || "SEDAN",
        serviceName: serviceNames, // ← all service names combined
        appPrice: totalPrice, // ← total cart price
      };

      console.log("📤 Sending booking to CRM:", payload);

      const res = await axios.post(`${BASE_URL}/marketplace/book`, payload);

      console.log("✅ CRM booking response:", res.data);

      clearCart();

      Alert.alert("Booking Confirmed 🚗", "Garage has received your request.", [
        { text: "OK", onPress: () => router.replace("/(tabs)/services") },
      ]);
    } catch (err) {
      console.error("❌ Booking error:", err?.response?.data || err.message);
      Alert.alert(
        "Booking Failed",
        err?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setConfirming(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Booking</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Selected Garage</Text>
        <Text style={styles.value}>{name || "N/A"}</Text>
      </View>

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

      <View style={styles.section}>
        <Text style={styles.label}>Estimated Cost</Text>
        <Text style={styles.total}>₹{total}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 No online payment required. Pay after service completion.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, confirming && { opacity: 0.6 }]}
        onPress={handleConfirm}
        disabled={confirming}
      >
        {confirming ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Confirm Booking</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, borderBottomWidth: 0.5, borderColor: "#ddd" },
  title: { fontSize: 18, fontWeight: "700" },
  section: { padding: 16, borderBottomWidth: 0.5, borderColor: "#eee" },
  label: { fontSize: 12, color: "#666", marginBottom: 4 },
  value: { fontSize: 15, fontWeight: "600" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: { fontSize: 14 },
  itemPrice: { fontSize: 14, fontWeight: "600" },
  total: { fontSize: 18, fontWeight: "700" },
  infoBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
  },
  infoText: { fontSize: 13, color: "#444" },
  btn: {
    margin: 16,
    backgroundColor: "#0062ff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
