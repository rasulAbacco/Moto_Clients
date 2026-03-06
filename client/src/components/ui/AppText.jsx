import { Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function AppText({ children, style, variant = "body" }) {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        styles.base,
        { color: theme.colors.text },
        styles[variant],
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  body: {
    fontSize: 16,
  },
});
