import { View, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function ScreenWrapper({ children }) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    marginTop: 0,
  },
});
