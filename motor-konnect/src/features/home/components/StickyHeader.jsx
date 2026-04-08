import { StyleSheet, Animated } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import SearchBar from "./SearchBar";

export default function StickyHeader({ scrollY }) {
  const { theme } = useTheme();

  const shadowOpacity = scrollY?.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 0.12],
    extrapolate: "clamp",
  });

  const borderOpacity = scrollY?.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          shadowOpacity,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <SearchBar />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    zIndex: 10,
  },
});
