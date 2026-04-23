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

const BASE_URL = "https://cqw6v494-8000.inc1.devtunnels.ms/api/v1";
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

  // ✅ GET PARAMS
  const { garageId, name, garage } = useLocalSearchParams();

  // ✅ PARSE GARAGE OBJECT (for address, phone, email)
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
      const serviceNames = cartItems.map((i) => i.title).join(", ");
      const primaryItem = cartItems[0];
      const externalServiceId = primaryItem.slug || primaryItem.id;
      const scheduledAt = new Date().toISOString();
      bookedAtRef.current = scheduledAt;

      const payload = {
        externalServiceId,
        garageId: Number(garageId),
        clientId,
        scheduledAt,
        carType: primaryItem.carType || "SEDAN",
        serviceName: serviceNames,
        appPrice: total,
      };

      await axios.post(`${BASE_URL}/marketplace/book`, payload);
      clearCart();
      setBookingState("waiting");
    } catch (err) {
      Alert.alert(
        "Booking Failed",
        err?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setConfirming(false);
    }
  };

  const goHome = () => {
    router.replace("/(tabs)/home");
  };
  const goBack = () => {
    router.back();
  };

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

  // ── CONFIRM SCREEN ──
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Booking</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ✅ GARAGE INFORMATION SECTION */}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.title} × {item.quantity || 1}
              </Text>
              <Text style={styles.itemPrice}>
                ₹{item.price * (item.quantity || 1)}
              </Text>
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
