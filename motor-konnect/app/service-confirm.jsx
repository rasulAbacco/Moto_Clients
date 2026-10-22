// motor-konnect\app\service-confirm.jsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  BackHandler,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../src/hooks/useCart";
import { useAuth } from "../src/providers/AuthProvider";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { safeBack } from "../src/utils/navigation";
import ScreenHeader from "../src/components/common/ScreenHeader";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.3:8000/api/v1";
const WAIT_SECONDS = 35;
const POLL_INTERVAL_MS = 5000;

export default function ServiceConfirmScreen() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [bookingState, setBookingState] = useState(null);
  const [countdown, setCountdown] = useState(WAIT_SECONDS);
  const [bookingNotification, setBookingNotification] = useState(null);

  const countdownRef = useRef(null);
  const pollRef = useRef(null);
  const bookedAtRef = useRef(null);

  const { garageId, name, garage } = useLocalSearchParams();
  const garageData = garage ? JSON.parse(garage) : null;

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  useEffect(() => {
    if (bookingState !== "waiting") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => subscription.remove();
  }, [bookingState]);

  useEffect(() => {
    if (bookingState !== "waiting") return;
    setCountdown(WAIT_SECONDS);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const poll = async () => {
      try {
        const phone = user?.phone;
        if (!phone) return;
        const res = await axios.get(`${BASE_URL}/notifications`, {
          params: { phone },
        });
        if (!res.data?.success) return;

        const notifications = res.data.data || [];
        const bookedAt = bookedAtRef.current
          ? new Date(bookedAtRef.current)
          : new Date(Date.now() - WAIT_SECONDS * 1000);

        const match = notifications.find((n) => {
          if (n.type !== "BOOKING_ACCEPTED" && n.type !== "BOOKING_REJECTED")
            return false;
          const notifTime = new Date(n.createdAt);
          return notifTime >= bookedAt;
        });

        if (match) {
          clearInterval(countdownRef.current);
          clearInterval(pollRef.current);
          setBookingNotification(match);
          setBookingState(
            match.type === "BOOKING_ACCEPTED" ? "accepted" : "rejected",
          );
        }
      } catch (err) {
        console.log("Poll error:", err.message);
      }
    };

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      clearInterval(countdownRef.current);
      clearInterval(pollRef.current);
    };
  }, [bookingState]);

  useEffect(() => {
    if (bookingState === "waiting" && countdown === 0) {
      clearInterval(pollRef.current);
      setBookingState("timeout");
    }
  }, [countdown, bookingState]);

  const resolveCrmClientId = async () => {
    const res = await axios.post(`${BASE_URL}/marketplace/client-lookup`, {
      phone: user.phone,
      name: user.name,
      email: user.email || null,
    });
    if (!res.data?.success || !res.data?.data?.clientId)
      throw new Error("Could not resolve CRM client ID");
    return res.data.data.clientId;
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      if (!cartItems.length) return Alert.alert("Error", "Cart is empty");
      if (!garageId) return Alert.alert("Error", "Garage not selected");
      if (!user?.phone) return Alert.alert("Error", "Missing phone number");

      const clientId = await resolveCrmClientId();
      const primaryItem = cartItems[0];
      const externalServiceId = primaryItem.slug || primaryItem.id;
      const scheduledAt = new Date().toISOString();
      bookedAtRef.current = scheduledAt;

      // ✅ Build a flat list of all services across all cart items
      // For package items: use item.services[] (the included services)
      // For regular service items: use item.title as the service name
      const allServices = cartItems.flatMap((item) => {
        if (item.source === "package" && item.services?.length) {
          // Package — expand its included services
          return item.services.map((s) => ({
            serviceName: s.serviceName || s.name || "",
            fromPackage: item.title, // which package this came from
          }));
        }
        // Regular service
        return [{ serviceName: item.title }];
      });

      // Human-readable summary for CRM display (e.g. notifications, CRM UI)
      const serviceNames = allServices.map((s) => s.serviceName).join(", ");

      const payload = {
        externalServiceId,
        garageId,
        clientId,
        scheduledAt,
        carType: primaryItem.carType || "SEDAN",

        // ✅ Plain string summary (kept for backwards compat with CRM)
        serviceName: serviceNames,

        // ✅ Structured services array — CRM can now see every included service
        services: allServices,

        appPrice: total,

        // ✅ Package-specific fields (only set when booking a package)
        ...(primaryItem.source === "package" && {
          packageId: primaryItem.id,
          packageName: primaryItem.title,
        }),
      };

      console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));
      await axios.post(`${BASE_URL}/marketplace/book`, payload);

      clearCart();
      setBookingState("waiting");
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message;
      console.error("❌ Booking Error:", errorMsg);
      Alert.alert("Booking Failed", errorMsg);
    } finally {
      setConfirming(false);
    }
  };

  const goHome = () => router.replace("/(tabs)/home");
  const goBack = () => safeBack(router);

  // ── Result screens ──
  if (["accepted", "rejected", "timeout"].includes(bookingState)) {
    const isAccepted = bookingState === "accepted";
    const isRejected = bookingState === "rejected";
    const iconChar = isAccepted ? "✓" : isRejected ? "✕" : "⏱";
    const color = isAccepted ? "#2E7D5B" : isRejected ? "#B3261E" : "#1E3A5F";

    return (
      <SafeAreaView style={styles.waitingContainer}>
        <View
          style={[
            styles.iconCircle,
            { borderColor: color, backgroundColor: color + "10" },
          ]}
        >
          <Text style={[styles.checkIcon, { color }]}>{iconChar}</Text>
        </View>
        <Text style={[styles.waitingTitle, { color }]}>
          {isAccepted ? "Accepted!" : isRejected ? "Rejected" : "Timeout"}
        </Text>
        <Text style={styles.waitingBody}>
          {bookingNotification?.body || "Update from garage received."}
        </Text>
        <View style={styles.resultButtonRow}>
          <TouchableOpacity
            style={[styles.resultBtn, styles.outlineBtn]}
            onPress={goBack}
          >
            <Text style={styles.outlineBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resultBtn, styles.homeBtn]}
            onPress={goHome}
          >
            <Text style={styles.homeBtnText}>Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Waiting screen ──
  if (bookingState === "waiting") {
    return (
      <SafeAreaView style={styles.waitingContainer}>
        <View style={styles.countdownWrapper}>
          <Text style={styles.countdownNumber}>{countdown}</Text>
        </View>
        <Text style={styles.waitingTitle}>Booking Sent!</Text>
        <ActivityIndicator
          size="large"
          color="#1E3A5F"
          style={{ marginVertical: 20 }}
        />
        <Text style={styles.waitingBody}>Waiting for garage response...</Text>
      </SafeAreaView>
    );
  }

  // ── Confirm screen ──
  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader title="Confirm Booking" onBack={() => safeBack(router)} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Garage Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={18} color="#1E3A5F" />
            <Text style={styles.sectionTitle}>Garage Details</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>
              {garageData?.companyName ||
                garageData?.name ||
                name ||
                "Not Available"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>
              {garageData?.address || "Not Available"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>
              {garageData?.phone || "Not Available"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>
              {garageData?.email || "Not Available"}
            </Text>
          </View>
        </View>

        {/* Services — expanded view for packages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {cartItems.map((item) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.title} × {item.quantity || 1}
                </Text>
                <Text style={styles.itemPrice}>
                  ₹{item.price * (item.quantity || 1)}
                </Text>
              </View>
              {/* ✅ If it's a package, show its included services below */}
              {item.source === "package" && item.services?.length > 0 && (
                <View style={styles.packageServices}>
                  {item.services.map((s, i) => (
                    <View key={i} style={styles.packageServiceRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color="#6DB892"
                      />
                      <Text style={styles.packageServiceText}>
                        {s.serviceName || s.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Estimated Cost</Text>
          <Text style={styles.total}>₹{total}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            No online payment required. Pay at the garage.
          </Text>
        </View>
      </ScrollView>

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
  container: { flex: 1, backgroundColor: "#F6F7F9" },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#E3E6EB",
  },
  backBtn: { marginRight: 12 },
  title: { fontSize: 18, fontWeight: "700" },
  section: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#374151" },
  infoRow: { marginBottom: 10 },
  label: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  value: { fontSize: 14, fontWeight: "600", color: "#1A1D23" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  itemName: { fontSize: 14, color: "#374151" },
  itemPrice: { fontSize: 14, fontWeight: "700" },
  // ✅ Package included services styles
  packageServices: {
    marginLeft: 8,
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#E6ECF3",
  },
  packageServiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  packageServiceText: { fontSize: 12, color: "#6B7280" },
  total: { fontSize: 22, fontWeight: "800", color: "#1E3A5F" },
  infoBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#E6ECF3",
    borderRadius: 10,
  },
  infoText: { fontSize: 13, color: "#1E3A5F", fontWeight: "500" },
  btn: {
    margin: 16,
    backgroundColor: "#1E3A5F",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  waitingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  checkIcon: { fontSize: 32, fontWeight: "bold" },
  waitingTitle: { fontSize: 22, fontWeight: "800", marginBottom: 10 },
  waitingBody: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  resultButtonRow: { flexDirection: "row", gap: 12, marginTop: 30 },
  resultBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center" },
  outlineBtn: { borderWidth: 1, borderColor: "#1E3A5F" },
  outlineBtnText: { color: "#1E3A5F", fontWeight: "700" },
  homeBtn: { backgroundColor: "#1E3A5F" },
  homeBtnText: { color: "#fff", fontWeight: "700" },
  countdownWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#1E3A5F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  countdownNumber: { fontSize: 24, fontWeight: "800", color: "#1E3A5F" },
});
