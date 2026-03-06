import { StyleSheet, Animated } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import HomeHeader from "./HomeHeader";
import SearchBar from "./SearchBar";

export default function StickyHeader({ scrollY }) {
  const { theme } = useTheme();

  const elevation = scrollY?.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 8],
    extrapolate: "clamp",
  });

  const shadowOpacity = scrollY?.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 0.12],
    extrapolate: "clamp",
  });

  const borderBottomOpacity = scrollY?.interpolate({
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
          elevation,
          shadowOpacity,
          borderBottomColor: Animated.multiply(borderBottomOpacity, 1),
        },
      ]}
    >
      <HomeHeader />
      <SearchBar />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    zIndex: 10,
  },
});
