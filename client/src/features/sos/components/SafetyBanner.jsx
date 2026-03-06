import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const SAFETY_STATS = [
  { value: "50K+", label: "Assists Done" },
  { value: "4.9★", label: "Avg Rating" },
  { value: "<45m", label: "Avg Response" },
];

export default function SafetyBanner() {
  const handleCall = () => {
    Linking.openURL("tel:+918000000000").catch(() => {});
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative circles */}
      <View style={styles.decor1} />
      <View style={styles.decor2} />

      {/* Shield icon + title */}
      <View style={styles.topRow}>
        <View style={styles.shieldWrap}>
          <Ionicons name="shield-checkmark" size={22} color="#4ade80" />
        </View>
        <View>
          <Text style={styles.title}>Your Safety Shield</Text>
          <Text style={styles.subtitle}>on every road, every hour</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Stats */}
      <View style={styles.statsRow}>
        {SAFETY_STATS.map((s, i) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
            {i < SAFETY_STATS.length - 1 && <View style={styles.statDivider} />}
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.callBtn}
        onPress={handleCall}
        activeOpacity={0.85}
      >
        <Ionicons name="call" size={16} color="#0f172a" />
        <Text style={styles.callText}>Call Emergency Helpline</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  decor1: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  decor2: {
    position: "absolute",
    left: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  shieldWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "rgba(74,222,128,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 18,
    position: "relative",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statLabel: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "500",
  },
  statDivider: {
    position: "absolute",
    right: 0,
    top: "10%",
    height: "80%",
    width: 0.5,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4ade80",
    paddingVertical: 13,
    borderRadius: 14,
  },
  callText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 14,
  },
});
