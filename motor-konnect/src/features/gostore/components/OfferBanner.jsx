import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

// Countdown to end of day
const getSecondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(23, 59, 59, 0);
  return Math.floor((midnight - now) / 1000);
};

const formatTime = (secs) => {
  const h = Math.floor(secs / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return { h, m, s };
};

function TimeUnit({ value, label }) {
  return (
    <View style={styles.timeUnit}>
      <View style={styles.timeBox}>
        <Text style={styles.timeNum}>{value}</Text>
      </View>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );
}

export default function OfferBanner() {
  const router = useRouter();
  const [secs, setSecs] = useState(getSecondsUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setSecs((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { h, m, s } = formatTime(secs);

  return (
    <LinearGradient
      colors={["#f59e0b", "#ef4444"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decor */}
      <View style={styles.decor1} />
      <View style={styles.decor2} />

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.flashWrap}>
          <Ionicons name="flash" size={14} color="#f59e0b" />
          <Text style={styles.flashText}>FLASH SALE</Text>
        </View>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => router.push("/store/sale")}
          activeOpacity={0.85}
        >
          <Text style={styles.shopText}>Shop Now</Text>
          <Ionicons name="arrow-forward" size={12} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Headline */}
      <Text style={styles.headline}>Flat 20% OFF</Text>
      <Text style={styles.subline}>on All Accessories & Car Care</Text>

      {/* Countdown */}
      <View style={styles.countdownRow}>
        <Text style={styles.endsIn}>Ends in</Text>
        <View style={styles.timerRow}>
          <TimeUnit value={h} label="HRS" />
          <Text style={styles.colon}>:</Text>
          <TimeUnit value={m} label="MIN" />
          <Text style={styles.colon}>:</Text>
          <TimeUnit value={s} label="SEC" />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 22,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  decor1: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  decor2: {
    position: "absolute",
    left: -20,
    bottom: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  flashWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  flashText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  shopText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 12,
  },
  headline: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subline: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginBottom: 16,
    marginTop: 2,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  endsIn: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "600",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeUnit: {
    alignItems: "center",
    gap: 3,
  },
  timeBox: {
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    minWidth: 34,
    alignItems: "center",
  },
  timeNum: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  timeLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  colon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
});
