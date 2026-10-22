// client/src/features/home/components/HomeSearchBar.jsx
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";

export default function HomeSearchBar({ value, onChangeText, onClear }) {
  const { theme } = useTheme();
  const isDark = theme.dark;

  // Classic high-contrast color palette
  const inputBg = isDark ? "#1c1c1e" : "#FFFFFF";
  const borderColor = isDark ? "#2c2c2e" : "#E3E6EB";
  const textColor = theme.colors.text;
  const placeholderColor = isDark ? "#636366" : "#8A919C";

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: inputBg, borderColor: borderColor },
      ]}
    >
      <Ionicons
        name="search"
        size={18}
        color={placeholderColor}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder="Search for garages or services..."
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={18} color={placeholderColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50, // Slightly taller for a more premium feel
    gap: 10,
    borderWidth: 1,
    // Subtle shadow for the "Classic" floating look
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400", // Clean, modern weight
    paddingVertical: 0,
    letterSpacing: -0.2,
  },
});
