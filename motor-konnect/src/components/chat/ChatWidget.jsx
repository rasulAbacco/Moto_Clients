import {
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import ChatModal from "./ChatModal";

// Visible only on the Home and Support tabs, sitting just above the docked
// tab bar (safe-area aware) so it never covers buttons on other screens.
const VISIBLE_ON = ["home", "help"];

export default function ChatWidget() {
  const [visible, setVisible] = useState(false);
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const onTab = segments[0] === "(tabs)" && VISIBLE_ON.includes(segments[1]);

  const animate = (to) =>
    Animated.timing(rotateAnim, {
      toValue: to,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

  const handleOpen = () => {
    animate(1);
    setVisible(true);
  };

  const handleClose = () => {
    animate(0);
    setVisible(false);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  // Tab bar height (see app/(tabs)/_layout.jsx) + safe-area inset
  const tabBar = (Platform.OS === "ios" ? 49 : 60) + insets.bottom;

  if (!onTab && !visible) return null;

  return (
    <>
      {onTab && (
        <Pressable
          onPress={visible ? handleClose : handleOpen}
          accessibilityRole="button"
          accessibilityLabel="Open Motor Konnect assistant"
          style={({ pressed }) => [
            styles.fab,
            { bottom: tabBar + 16, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons
              name={visible ? "close" : "chatbubble-ellipses"}
              size={24}
              color="#FFFFFF"
            />
          </Animated.View>
        </Pressable>
      )}

      <ChatModal visible={visible} onClose={handleClose} />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#1E3A5F",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#14243B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});
