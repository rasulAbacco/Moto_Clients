import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme.js";
import { useRouter } from "expo-router";

export default function SectionHeader({ title, seeAllPath }) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

      {seeAllPath && (
        <TouchableOpacity
          onPress={() => router.push(seeAllPath)}
          style={styles.seeAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
            See All
          </Text>
          <Ionicons
            name="chevron-forward"
            size={13}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
