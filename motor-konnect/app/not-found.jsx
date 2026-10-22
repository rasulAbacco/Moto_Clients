import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../src/hooks/useTheme";
import ScreenHeader from "../src/components/common/ScreenHeader";

export default function NotFound() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title="" border={false} transparent />
      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: c.primaryLight }]}>
          <Ionicons name="compass-outline" size={34} color={c.primary} />
        </View>
        <Text style={[styles.title, { color: c.text }]}>Page not found</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          The page you are looking for doesn&apos;t exist or has moved.
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)/home")}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.btnText}>Go to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  sub: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 28 },
  btn: {
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
  },
  btnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});
