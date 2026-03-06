import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme.js";
import { useRouter } from "expo-router";
import SectionHeader from "./SectionHeader";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 32 - 12) / 2; // 2 cols, 16px side padding, 12px gap

// Fallback icon map if API doesn't return icons
const ICON_MAP = {
  default: "construct-outline",
  tyre: "ellipse-outline",
  battery: "battery-charging-outline",
  service: "settings-outline",
  wash: "water-outline",
  ac: "thermometer-outline",
  denting: "hammer-outline",
  insurance: "shield-checkmark-outline",
  sos: "alert-circle-outline",
};

export default function ServiceGrid({ services = [] }) {
  const { theme } = useTheme();
  const router = useRouter();

  if (!services.length) return null;

  return (
    <View>
      <SectionHeader title="Our Services" />
      <View style={styles.grid}>
        {services.map((item) => {
          const iconKey = item.iconKey?.toLowerCase() || "default";
          const iconName = ICON_MAP[iconKey] || ICON_MAP.default;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor:
                    theme.colors.card || theme.colors.surface || "#fff",
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push(`/services/${item.id}`)}
              activeOpacity={0.75}
            >
              {/* Icon */}
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Ionicons
                  name={item.ionicon || iconName}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>

              {/* Name */}
              <Text
                style={[styles.name, { color: theme.colors.text }]}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              {/* Optional price tag */}
              {item.startingPrice ? (
                <Text
                  style={[styles.price, { color: theme.colors.textSecondary }]}
                >
                  From ₹{item.startingPrice}
                </Text>
              ) : null}

              {/* Arrow */}
              <Ionicons
                name="chevron-forward"
                size={14}
                color={theme.colors.textSecondary}
                style={styles.arrow}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: CARD_SIZE,
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
    marginBottom: 4,
  },
  price: {
    fontSize: 12,
    fontWeight: "500",
  },
  arrow: {
    position: "absolute",
    top: 14,
    right: 12,
  },
});
