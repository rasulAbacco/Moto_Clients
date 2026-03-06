import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import ChatModal from "./ChatModal";

export default function ChatWidget() {
  const [visible, setVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleOpen = () => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
    setVisible(true);
  };

  const handleClose = () => {
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setVisible(false);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <>
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          { transform: [{ scale: pulseAnim }], opacity: visible ? 0 : 0.35 },
        ]}
        pointerEvents="none"
      />

      <TouchableOpacity
        onPress={visible ? handleClose : handleOpen}
        activeOpacity={0.85}
      >
        <Animated.View style={[styles.fab, { transform: [{ rotate }] }]}>
          <Ionicons
            name={visible ? "close" : "car-sport"}
            size={26}
            color="#fff"
          />
        </Animated.View>
      </TouchableOpacity>

      <ChatModal visible={visible} onClose={handleClose} />
    </>
  );
}

const styles = StyleSheet.create({
  pulseRing: {
    position: "absolute",
    bottom: 112,
    right: 12,
    width: 56,
    height: 56,
    borderRadius: 38,
    backgroundColor: "#E85D04",
  },
  fab: {
    position: "absolute",
    bottom: 120,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: "#E85D04",
    alignItems: "center",
    justifyContent: "center",
    elevation: 12,
    shadowColor: "#E85D04",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
});
