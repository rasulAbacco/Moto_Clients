import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

// Safe-area aware screen container (was a fixed 50px top padding, which
// sat under the Dynamic Island on newer iPhones).
// Pass `header` when the screen renders a ScreenHeader itself — the header
// then owns the top inset.
export default function ScreenWrapper({
  children,
  header = false,
  padded = true,
  style,
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: header ? 0 : insets.top + 12,
          paddingHorizontal: padded ? 20 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
