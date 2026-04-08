import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function MembershipCard() {
  const router = useRouter();

  const benefits = [
    { icon: "car-outline", text: "Free towing up to 50 km" },
    { icon: "shield-checkmark-outline", text: "Free SOS assistance" },
    { icon: "pricetag-outline", text: "Save ₹21,700 annually" },
  ];

  return (
    <LinearGradient
      colors={["#ef4444", "#b91c9a", "#7c3aed"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Top row: title + badge */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>MILES MEMBERSHIP</Text>
          <Text style={styles.title}>Premium Plan</Text>
        </View>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>Active</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Benefits */}
      <View style={styles.benefits}>
        {benefits.map((b) => (
          <View key={b.text} style={styles.benefitRow}>
            <Ionicons name={b.icon} size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.benefitText}>{b.text}</Text>
          </View>
        ))}
      </View>

      {/* Bottom row: expiry + CTA */}
      <View style={styles.bottomRow}>
        <Text style={styles.expiry}>Expires: 31 Dec 2025</Text>
        <TouchableOpacity
          style={styles.renewBtn}
          onPress={() => router.push("/membership")}
          activeOpacity={0.85}
        >
          <Text style={styles.renewText}>View Details</Text>
          <Ionicons name="chevron-forward" size={12} color="#9333ea" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
  },
  activeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 14,
  },
  benefits: {
    gap: 7,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  benefitText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expiry: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
  renewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 3,
  },
  renewText: {
    color: "#9333ea",
    fontSize: 12,
    fontWeight: "700",
  },
});
