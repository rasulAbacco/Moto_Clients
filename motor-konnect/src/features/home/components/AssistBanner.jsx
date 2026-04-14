import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const FEATURES = [
  { icon: "time-outline", label: "24x7 Support" },
  { icon: "car-outline", label: "Towing Help" },
  { icon: "flash-outline", label: "Battery Jump" },
];

export default function AssistBanner() {
  const router = useRouter();

  // ✅ UPDATED CALL FUNCTION (WORKING)
  const handleCall = async () => {
    try {
      const phoneNumber = "7204986825";
      const url = `tel:${phoneNumber}`;

      console.log("📞 Call button clicked");

      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        console.log("❌ Phone call not supported on this device");
        return;
      }

      await Linking.openURL(url);
      console.log("✅ Calling:", phoneNumber);
    } catch (err) {
      console.log("❌ Call failed:", err);
    }
  };

  const handleNavigate = () => {
    console.log("🚀 Navigating to SOS screen");
    router.push("/sos");
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View>
          <View style={styles.sosRow}>
            <View style={styles.sosBadge}>
              <Text style={styles.sosText}>SOS</Text>
            </View>
            <Text style={styles.title}>Top Assist</Text>
          </View>
          <Text style={styles.subtitle}>24x7 Roadside Assistance</Text>
        </View>

        {/* ✅ CALL BUTTON FIXED */}
        <TouchableOpacity
          style={styles.callBtn}
          onPress={handleCall}
          activeOpacity={0.85}
        >
          <Ionicons name="call" size={16} color="#0f172a" />
          <Text style={styles.callText}>Call Now</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Features */}
      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.label} style={styles.feature}>
            <Ionicons name={f.icon} size={14} color="#94a3b8" />
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </View>

      {/* Navigation */}
      <TouchableOpacity
        style={styles.learnMore}
        onPress={handleNavigate}
        activeOpacity={0.8}
      >
        <Text style={styles.learnMoreText}>View All Emergency Services</Text>
        <Ionicons name="arrow-forward" size={13} color="#60a5fa" />
      </TouchableOpacity>

      {/* ✅ FIXED DECOR (NO TOUCH BLOCK) */}
      <View style={styles.decor} pointerEvents="none" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sosBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  sosText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
  },

  // ✅ FIXED BUTTON PRIORITY
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4ade80",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    zIndex: 10,
  },

  callText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },

  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 16,
  },

  features: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  feature: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  featureLabel: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },

  learnMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  learnMoreText: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "600",
  },

  decor: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
});
