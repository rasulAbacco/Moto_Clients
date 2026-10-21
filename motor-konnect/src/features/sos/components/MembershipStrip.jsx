import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const PERKS = [
  { icon: "car-outline", text: "2 Free SOS / year" },
  { icon: "shield-checkmark-outline", text: "Priority dispatch" },
  { icon: "pricetag-outline", text: "Save ₹21,700" },
];

export default function MembershipStrip() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#B3261E", "#1E3A5F"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative circle */}
      <View style={styles.decor} />

      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.badgeWrap}>
          <Ionicons name="star" size={12} color="#B8862B" />
          <Text style={styles.badgeText}>MILES MEMBERSHIP</Text>
        </View>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push("/membership")}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Get Plan</Text>
          <Ionicons name="arrow-forward" size={12} color="#1E3A5F" />
        </TouchableOpacity>
      </View>

      <Text style={styles.headline}>Get 2 Free SOS Services every year</Text>

      {/* Perks row */}
      <View style={styles.perksRow}>
        {PERKS.map((p) => (
          <View key={p.text} style={styles.perk}>
            <Ionicons name={p.icon} size={12} color="rgba(255,255,255,0.75)" />
            <Text style={styles.perkText}>{p.text}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#B3261E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  decor: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ctaText: {
    color: "#1E3A5F",
    fontWeight: "700",
    fontSize: 12,
  },
  headline: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 12,
    lineHeight: 22,
  },
  perksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  perk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  perkText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
  },
});
