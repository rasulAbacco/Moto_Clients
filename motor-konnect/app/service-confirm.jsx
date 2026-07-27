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
import {
  connectSocket,
  subscribeToBookingUpdates,
} from "../src/services/socket.service";

// const BASE_URL = "https://x59j71v4-8000.inc1.devtunnels.ms/api/v1";
const BASE_URL = "https://moto-clients.onrender.com/api/v1";
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
  const bookingIdRef = useRef(null);

  const { garageId, name, garage } = useLocalSearchParams();
  const garageData = garage ? JSON.parse(garage) : null;

  // 🆕 Selected vehicle for this booking. Same shape confirmed in
  // profile.jsx's `primaryVehicle = user?.vehicles?.[0]`:
  //   { id, registration, vehicleType: { name }, brand: { name },
  //     model: { name }, modelYear: { year }, fuel? }
  // If the booking flow has its own vehicle-picker state somewhere
  // upstream (e.g. attached to the cart item), that takes priority;
  // otherwise we fall back to the user's primary registered vehicle.
  const selectedVehicle =
    cartItems?.[0]?.selectedVehicle || user?.vehicles?.[0] || null;

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

  // 🆕 Fast path: listen for the real-time socket push from Motor Desk.
  // This usually resolves the screen instantly instead of waiting on the
  // next 5-second poll tick. The poll above stays as a fallback in case
  // the socket connection drops or the event is missed.
  useEffect(() => {
    if (bookingState !== "waiting") return;
    if (!user?.phone) return;

    connectSocket(user.phone);

    const unsubscribe = subscribeToBookingUpdates((payload) => {
      if (
        !bookingIdRef.current ||
        String(payload.id) !== String(bookingIdRef.current)
      ) {
        return; // not this booking
      }
      if (payload.status !== "ACCEPTED" && payload.status !== "REJECTED") {
        return;
      }

      clearInterval(countdownRef.current);
      clearInterval(pollRef.current);
      setBookingNotification({
        body:
          payload.status === "ACCEPTED"
            ? `Your booking for ${payload.serviceName || "the service"} has been accepted!`
            : `Your booking for ${payload.serviceName || "the service"} could not be confirmed.`,
      });
      setBookingState(payload.status === "ACCEPTED" ? "accepted" : "rejected");
    });

    return unsubscribe;
  }, [bookingState, user?.phone]);

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

        // 🆕 Real vehicle details for this booking, pulled from the
        // customer's registered vehicle (same data shown on Profile /
        // Registered Vehicles). Sent as plain strings/numbers since the
        // CRM stores a snapshot, not a live reference.
        ...(selectedVehicle && {
          vehicleMake: selectedVehicle.brand?.name || null,
          vehicleModel: selectedVehicle.model?.name || null,
          vehicleRegNumber: selectedVehicle.registration || null,
          vehicleYear: selectedVehicle.modelYear?.year || null,
          vehicleFuelType:
            selectedVehicle.fuel || selectedVehicle.fuelType || null,
        }),
      };

      console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));
      const bookRes = await axios.post(`${BASE_URL}/marketplace/book`, payload);
      bookingIdRef.current = bookRes?.data?.data?.id || null;

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
  const goBack = () => router.back();

  // ── Result screens ──
  if (["accepted", "rejected", "timeout"].includes(bookingState)) {
    const isAccepted = bookingState === "accepted";
    const isRejected = bookingState === "rejected";
    const iconChar = isAccepted ? "✓" : isRejected ? "✕" : "⏱";
    const color = isAccepted ? "#16a34a" : isRejected ? "#ef4444" : "#f97316";

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
          color="#0062ff"
          style={{ marginVertical: 20 }}
        />
        <Text style={styles.waitingBody}>Waiting for garage response...</Text>
      </SafeAreaView>
    );
  }

  // ── Confirm screen ──
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Booking</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Garage Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={18} color="#0062ff" />
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

        {/* 🆕 Vehicle Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car-sport" size={18} color="#0062ff" />
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.value}>
              {selectedVehicle
                ? `${selectedVehicle.brand?.name || ""} ${selectedVehicle.model?.name || ""}`.trim() ||
                  "Not Available"
                : "Not Available"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Registration No.</Text>
            <Text style={styles.value}>
              {selectedVehicle?.registration || "Not Available"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Year</Text>
            <Text style={styles.value}>
              {selectedVehicle?.modelYear?.year || "Not Available"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fuel Type</Text>
            <Text style={styles.value}>
              {selectedVehicle?.fuel ||
                selectedVehicle?.fuelType ||
                "Not Available"}
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
                        color="#4ade80"
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
            💡 No online payment required. Pay at the garage.
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
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
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
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#333" },
  infoRow: { marginBottom: 10 },
  label: { fontSize: 12, color: "#777", marginBottom: 2 },
  value: { fontSize: 14, fontWeight: "600", color: "#111" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  itemName: { fontSize: 14, color: "#444" },
  itemPrice: { fontSize: 14, fontWeight: "700" },
  // ✅ Package included services styles
  packageServices: {
    marginLeft: 8,
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#e0e7ff",
  },
  packageServiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  packageServiceText: { fontSize: 12, color: "#666" },
  total: { fontSize: 22, fontWeight: "800", color: "#0062ff" },
  infoBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#eef2ff",
    borderRadius: 10,
  },
  infoText: { fontSize: 13, color: "#4338ca", fontWeight: "500" },
  btn: {
    margin: 16,
    backgroundColor: "#0062ff",
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
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  resultButtonRow: { flexDirection: "row", gap: 12, marginTop: 30 },
  resultBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center" },
  outlineBtn: { borderWidth: 1, borderColor: "#0062ff" },
  outlineBtnText: { color: "#0062ff", fontWeight: "700" },
  homeBtn: { backgroundColor: "#0062ff" },
  homeBtnText: { color: "#fff", fontWeight: "700" },
  countdownWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#0062ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  countdownNumber: { fontSize: 24, fontWeight: "800", color: "#0062ff" },
});
