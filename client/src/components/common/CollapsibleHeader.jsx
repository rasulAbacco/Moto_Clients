import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../hooks/useTheme";

const HEADER_MAX_HEIGHT = 110;
const HEADER_MIN_HEIGHT = 60;

export default function CollapsibleHeader({ title, scrollY }) {
  const router = useRouter();
  const { theme } = useTheme();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const titleSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [26, 18],
    extrapolate: "clamp",
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [20, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: headerHeight,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Animated.Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontSize: titleSize,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
      >
        {title}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  topRow: {
    position: "absolute",
    top: 16,
    left: 16,
  },
  title: {
    fontWeight: "700",
  },
});
