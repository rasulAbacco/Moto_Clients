import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "../../../hooks/useTheme";

const CATEGORIES = [
  { id: "all", label: "All", icon: "apps-outline" },
  { id: "tyres", label: "Tyres", icon: "ellipse-outline" },
  { id: "oils", label: "Engine Oils", icon: "water-outline" },
  { id: "batteries", label: "Batteries", icon: "battery-charging-outline" },
  { id: "accessories", label: "Accessories", icon: "construct-outline" },
  { id: "care", label: "Car Care", icon: "sparkles-outline" },
  { id: "wipers", label: "Wipers", icon: "rainy-outline" },
  { id: "lights", label: "Lights", icon: "flashlight-outline" },
];

export default function CategoryCarousel({ onSelect }) {
  const { theme } = useTheme();
  const [active, setActive] = useState("all");

  const handlePress = (id) => {
    setActive(id);
    onSelect?.(id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      style={{ marginBottom: 20 }}
    >
      {CATEGORIES.map((item) => {
        const isActive = active === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.chip,
              {
                backgroundColor: isActive
                  ? theme.colors.primary
                  : theme.colors.card || theme.colors.surface || "#fff",
                borderColor: isActive
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={() => handlePress(item.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={item.icon}
              size={14}
              color={isActive ? "#fff" : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.chipText,
                { color: isActive ? "#fff" : theme.colors.text },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
