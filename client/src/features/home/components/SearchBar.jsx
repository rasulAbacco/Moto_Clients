import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useRouter } from "expo-router";

export default function SearchBar() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push("/search")}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card || theme.colors.surface,
          borderColor: theme.colors.border || "#E5E7EB",
        },
      ]}
    >
      {/* Search icon + placeholder */}
      <View style={styles.left}>
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.colors.textSecondary}
          style={styles.icon}
        />
        <Text
          style={[styles.placeholder, { color: theme.colors.textSecondary }]}
          numberOfLines={1}
        >
          Search services, tyres, batteries...
        </Text>
      </View>

      {/* Mic icon */}
      <View
        style={[
          styles.micWrap,
          { backgroundColor: theme.colors.primary + "15" },
        ]}
      >
        <Ionicons name="mic-outline" size={16} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 9,
  },
  placeholder: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  micWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
