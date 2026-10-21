import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/hooks/useTheme";
import ScreenHeader from "../../src/components/common/ScreenHeader";

const POINTS = [
  {
    icon: "construct-outline",
    title: "Trusted garages",
    text: "Book servicing and repairs with verified garages near you.",
  },
  {
    icon: "pricetag-outline",
    title: "Clear pricing",
    text: "See prices for your exact vehicle before you book.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Roadside help",
    text: "SOS assistance when you need it most.",
  },
];

const LINKS = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Service", path: "/terms" },
  { label: "Contact Support", path: "/support" },
];

export default function AboutPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title="About" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: c.primary }]}>
            <Ionicons name="car-sport" size={30} color={c.onPrimary} />
          </View>
          <Text style={[styles.appName, { color: c.text }]}>Motor Konnect</Text>
          <Text style={[styles.version, { color: c.textMuted }]}>
            Version {version}
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          {POINTS.map((p, i) => (
            <View
              key={p.title}
              style={[
                styles.point,
                i < POINTS.length - 1 && {
                  borderBottomColor: c.divider,
                  borderBottomWidth: 1,
                },
              ]}
            >
              <View
                style={[styles.pointIcon, { backgroundColor: c.primaryLight }]}
              >
                <Ionicons name={p.icon} size={20} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pointTitle, { color: c.text }]}>
                  {p.title}
                </Text>
                <Text style={[styles.pointText, { color: c.textSecondary }]}>
                  {p.text}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          {LINKS.map((l, i) => (
            <Pressable
              key={l.path}
              onPress={() => router.push(l.path)}
              android_ripple={{ color: c.divider }}
              style={[
                styles.link,
                i < LINKS.length - 1 && {
                  borderBottomColor: c.divider,
                  borderBottomWidth: 1,
                },
              ]}
            >
              <Text style={[styles.linkText, { color: c.text }]}>
                {l.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.footer, { color: c.textMuted }]}>
          © {new Date().getFullYear()} Motor Konnect. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16 },
  brand: { alignItems: "center", paddingVertical: 24 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  appName: { fontSize: 22, fontWeight: "700" },
  version: { fontSize: 13, marginTop: 4 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  point: { flexDirection: "row", gap: 14, padding: 16, alignItems: "center" },
  pointIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pointTitle: { fontSize: 15, fontWeight: "600" },
  pointText: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  link: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 52,
  },
  linkText: { fontSize: 15 },
  footer: { textAlign: "center", fontSize: 12, marginTop: 8 },
});
