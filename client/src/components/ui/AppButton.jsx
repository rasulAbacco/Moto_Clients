import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function AppButton({ title, onPress, loading }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.primary }]}
      onPress={onPress}
      disabled={loading}
    >
      <Text style={[styles.text, { color: "#fff" }]}>
        {loading ? "Please wait..." : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
  },
});
