import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "../../../hooks/useTheme";

const CONTACT_OPTIONS = [
  {
    id: "chat",
    label: "Live Chat",
    subLabel: "Avg. reply in 2 min",
    icon: "chatbubble-ellipses-outline",
    action: "chat",
  },
  {
    id: "call",
    label: "Call Us",
    subLabel: "Mon–Sat, 9am–8pm",
    icon: "call-outline",
    action: "call",
  },
  {
    id: "email",
    label: "Email Us",
    subLabel: "Reply within 24 hrs",
    icon: "mail-outline",
    action: "email",
  },
];

export default function ContactSupportCard() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleAction = (action) => {
    switch (action) {
      case "chat":
        Linking.openURL(
          "https://wa.me/917204986825?text=Hello%20I%20need%20help%20with%20my%20vehicle%20service",
        ).catch(() => {});
        break;
      case "call":
        Linking.openURL("tel:+917204986825").catch(() => {});
        break;
      case "email":
        Linking.openURL("mailto:support@themotordesk.com").catch(() => {});
        break;
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primary + "cc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Decorative circles */}
      <View style={styles.decor1} />
      <View style={styles.decor2} />

      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerIconWrap}>
          <Ionicons name="headset-outline" size={24} color="#fff" />
        </View>
        <View>
          <Text style={styles.title}>Still Need Help?</Text>
          <Text style={styles.subtitle}>Our support team is here for you</Text>
        </View>
      </View>

      {/* Contact options */}
      <View style={styles.optionsRow}>
        {CONTACT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={styles.optionBtn}
            onPress={() => handleAction(opt.action)}
            activeOpacity={0.82}
          >
            <View style={styles.optionIconWrap}>
              <Ionicons name={opt.icon} size={20} color="#fff" />
            </View>
            <Text style={styles.optionLabel}>{opt.label}</Text>
            <Text style={styles.optionSub}>{opt.subLabel}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Primary CTA */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => handleAction("chat")}
        activeOpacity={0.88}
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={16}
          color={theme.colors.primary}
        />
        <Text style={[styles.primaryBtnText, { color: theme.colors.primary }]}>
          Start Live Chat
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
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
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  decor2: {
    position: "absolute",
    right: 40,
    bottom: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  optionBtn: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 6,
  },
  optionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  optionSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 12,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 13,
    borderRadius: 14,
  },
  primaryBtnText: {
    fontWeight: "700",
    fontSize: 15,
  },
});
