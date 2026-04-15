//motor-konnect\app\service-confirm.jsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../src/hooks/useCart";
import { useAuth } from "../src/providers/AuthProvider";
import axios from "axios";

const BASE_URL = "https://cqw6v494-8000.inc1.devtunnels.ms/api/v1";
const WAIT_SECONDS = 35; // poll window
const POLL_INTERVAL_MS = 5000; // poll every 5s

// ── Possible states after booking is sent ──
// "waiting"  → countdown + polling
// "accepted" → garage accepted
// "rejected" → garage rejected
// "timeout"  → 35s passed, no response yet

export default function ServiceConfirmScreen() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [bookingState, setBookingState] = useState(null); // null | "waiting" | "accepted" | "rejected" | "timeout"
  const [countdown, setCountdown] = useState(WAIT_SECONDS);
  const [bookingNotification, setBookingNotification] = useState(null); // the matched notification row

  const countdownRef = useRef(null);
  const pollRef = useRef(null);
  const bookedAtRef = useRef(null); // ISO timestamp when booking was sent

  const { garageId, name } = useLocalSearchParams();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ── Block Android hardware back button while waiting ──
  useEffect(() => {
    if (bookingState !== "waiting") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => subscription.remove();
  }, [bookingState]);

  // ── Start countdown + polling once "waiting" state is entered ──
  useEffect(() => {
    if (bookingState !== "waiting") return;

    setCountdown(WAIT_SECONDS);

    // ── Countdown timer ──
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // ── Polling for BOOKING_ACCEPTED / BOOKING_REJECTED notification ──
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

        // Find the most recent booking notification that was created AFTER the booking was sent
        const match = notifications.find((n) => {
          if (
            n.type !== "BOOKING_ACCEPTED" &&
            n.type !== "BOOKING_REJECTED"
          ) {
            return false;
          }
          const notifTime = new Date(n.createdAt);
          return notifTime >= bookedAt;
        });

        if (match) {
          // Stop all timers immediately
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

    // Run first poll right away, then every POLL_INTERVAL_MS
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      clearInterval(countdownRef.current);
      clearInterval(pollRef.current);
    };
  }, [bookingState]);

  // ── When countdown hits 0 → timeout (no response received) ──
  useEffect(() => {
    if (bookingState === "waiting" && countdown === 0) {
      clearInterval(pollRef.current);
      setBookingState("timeout");
    }
  }, [countdown, bookingState]);

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
    return res.data.data.clientId;
  };

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

      const serviceNames = cartItems.map((i) => i.title).join(", ");
      const totalPrice = cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );

      const primaryItem = cartItems[0];
      const externalServiceId = primaryItem.slug || primaryItem.id;

      if (!externalServiceId) {
        return Alert.alert("Error", "Service ID missing. Please re-add to cart.");
      }

      const scheduledAt = new Date().toISOString();
      bookedAtRef.current = scheduledAt; // save for notification filter

      const payload = {
        externalServiceId,
        garageId: Number(garageId),
        clientId,
        scheduledAt,
        carType: primaryItem.carType || "SEDAN",
        serviceName: serviceNames,
        appPrice: totalPrice,
      };

      console.log("📤 Sending booking to CRM:", payload);
      const res = await axios.post(`${BASE_URL}/marketplace/book`, payload);
      console.log("✅ CRM booking response:", res.data);

      clearCart();
      setBookingState("waiting"); // ← switch to polling + countdown screen
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

  const goHome = () => {
    clearInterval(countdownRef.current);
    clearInterval(pollRef.current);
    router.replace("/(tabs)/home");
  };

  const goBack = () => {
    clearInterval(countdownRef.current);
    clearInterval(pollRef.current);
    router.back();
  };

  // ─────────────────────────────────────────────────────────────
  // RESULT SCREEN — accepted / rejected / timeout
  // ─────────────────────────────────────────────────────────────
  if (
    bookingState === "accepted" ||
    bookingState === "rejected" ||
    bookingState === "timeout"
  ) {
    const isAccepted = bookingState === "accepted";
    const isRejected = bookingState === "rejected";
    const isTimeout = bookingState === "timeout";

    const iconChar = isAccepted ? "✓" : isRejected ? "✕" : "⏱";
    const iconColor = isAccepted ? "#16a34a" : isRejected ? "#ef4444" : "#f97316";
    const iconBg = isAccepted ? "#dcfce7" : isRejected ? "#fee2e2" : "#fff7ed";
    const borderColor = iconColor;

    const title = isAccepted
      ? "Booking Accepted! 🎉"
      : isRejected
      ? "Booking Rejected"
      : "No Response Yet";

    const subtitle = isAccepted
      ? "The garage has confirmed your appointment."
      : isRejected
      ? "The garage couldn't accept your request."
      : "The garage hasn't responded within the wait time.";

    const body = isAccepted
      ? bookingNotification?.body ||
        "Please arrive at the garage on time. Pay after service completion."
      : isRejected
      ? bookingNotification?.body ||
        "You can try booking with a different garage."
      : "Your booking request is still with the garage. You may check back later or try another garage.";

    return (
      <SafeAreaView style={styles.waitingContainer}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: iconBg, borderColor },
          ]}
        >
          <Text style={[styles.checkIcon, { color: iconColor }]}>
            {iconChar}
          </Text>
        </View>

        <Text style={[styles.waitingTitle, { color: iconColor }]}>{title}</Text>
        <Text style={styles.waitingSubtitle}>{subtitle}</Text>
        <Text style={styles.waitingBody}>{body}</Text>

        {bookingNotification?.garageName ? (
          <Text style={styles.garageTag}>
            🏪 {bookingNotification.garageName}
          </Text>
        ) : null}

        <View style={styles.resultButtonRow}>
          <TouchableOpacity
            style={[styles.resultBtn, styles.outlineBtn]}
            onPress={goBack}
          >
            <Text style={styles.outlineBtnText}>← Go Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.resultBtn, styles.homeBtn]} onPress={goHome}>
            <Text style={styles.homeBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // WAITING SCREEN — countdown + polling spinner
  // ─────────────────────────────────────────────────────────────
  if (bookingState === "waiting") {
    return (
      <SafeAreaView style={styles.waitingContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.waitingTitle}>Booking Sent! 🚗</Text>

        <Text style={styles.waitingSubtitle}>
          Your request has been sent to the garage.
        </Text>

        <Text style={styles.waitingBody}>
          Please wait while the garage reviews your appointment request. We'll
          update you the moment they respond.
        </Text>

        <View style={styles.countdownWrapper}>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownLabel}>seconds</Text>
        </View>

        <View style={styles.pollingRow}>
          <ActivityIndicator size="small" color="#0062ff" />
          <Text style={styles.pollingText}>Checking for garage response…</Text>
        </View>

        <Text style={styles.redirectNote}>
          Result will appear here automatically
        </Text>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CONFIRM SCREEN — default
  // ─────────────────────────────────────────────────────────────
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
  // ── Normal screen ──
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

  // ── Waiting / Result screen (shared shell) ──
  waitingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e6f0ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#0062ff",
  },
  checkIcon: { fontSize: 36, color: "#0062ff", fontWeight: "700" },
  waitingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginBottom: 10,
    textAlign: "center",
  },
  waitingSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  waitingBody: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  garageTag: {
    fontSize: 13,
    color: "#0062ff",
    fontWeight: "600",
    marginBottom: 28,
  },

  // ── Countdown ──
  countdownWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#0062ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#f0f5ff",
  },
  countdownNumber: { fontSize: 28, fontWeight: "800", color: "#0062ff" },
  countdownLabel: { fontSize: 10, color: "#666", marginTop: -2 },

  // ── Polling indicator ──
  pollingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  pollingText: { fontSize: 12, color: "#0062ff" },
  redirectNote: { fontSize: 12, color: "#999" },

  // ── Result buttons ──
  resultButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  resultBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: "#0062ff",
    backgroundColor: "#fff",
  },
  outlineBtnText: { color: "#0062ff", fontWeight: "700", fontSize: 14 },
  homeBtn: { backgroundColor: "#0062ff" },
  homeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});