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
import SectionHeader from "./SectionHeader";

const { width } = Dimensions.get("window");
const CARD_W = (width - 32 - 12) / 2;

const PLANS = [
  {
    id: "miles",
    name: "Miles",
    tagline: "Roadside Hero",
    perks: ["Free Towing", "SOS 24x7", "Flat Tyre Help"],
    icon: "car-sport-outline",
    gradient: ["#7c3aed", "#4f46e5"],
    path: "/membership/miles",
  },
  {
    id: "warranty",
    name: "Warranty",
    tagline: "Save Big",
    perks: ["Save ₹30,000", "AMC Plans", "Priority Service"],
    icon: "shield-checkmark-outline",
    gradient: ["#7c3aed", "#4f46e5"],
    path: "/membership/warranty",
  },
];

export default function MembershipCards() {
  const router = useRouter();

  return (
    <View>
      <SectionHeader title="Membership Plans" seeAllPath="/membership" />
      <View style={styles.row}>
        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            onPress={() => router.push(plan.path)}
            activeOpacity={0.88}
            style={styles.cardTouch}
          >
            <LinearGradient
              colors={plan.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Ionicons name={plan.icon} size={20} color="#fff" />
                </View>
              </View>

              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.tagline}>{plan.tagline}</Text>

              <View style={styles.divider} />

              {/* Perks */}
              {plan.perks.map((perk) => (
                <View key={perk} style={styles.perkRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}

              {/* CTA */}
              <View style={styles.cta}>
                <Text style={styles.ctaText}>Explore</Text>
                <Ionicons name="arrow-forward" size={12} color="#fff" />
              </View>

              {/* Decorative */}
              <View style={styles.decor} />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  cardTouch: {
    flex: 1,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    minHeight: 200,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    marginBottom: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  planName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  tagline: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 10,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  perkText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  ctaText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  decor: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
