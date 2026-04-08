import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function AccountQuickActions() {
  const { theme } = useTheme();
  const router = useRouter();

  const actions = [
    {
      title: "Order History",
      icon: "cube-outline",
      path: "/orders",
      badge: null,
    },
    {
      title: "My Vehicles",
      icon: "car-outline",
      path: "/vehicles",
      badge: null,
    },
    // {
    //   title: "Appointments",
    //   icon: "calendar-outline",
    //   path: "/appointments",
    //   badge: 2,
    // },
    {
      title: "Help & Support",
      icon: "help-circle-outline",
      path: "/support",
      badge: null,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card || theme.colors.surface || "#fff",
          borderColor: theme.colors.border,
        },
      ]}
    >
      {actions.map((item, index) => (
        <TouchableOpacity
          key={item.title}
          style={[
            styles.item,
            index < actions.length - 1 && {
              borderRightWidth: 0.5,
              borderRightColor: theme.colors.border,
            },
          ]}
          onPress={() => router.push(item.path)}
          activeOpacity={0.7}
        >
          {/* Icon with optional badge */}
          <View style={styles.iconWrap}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={theme.colors.primary}
              />
            </View>
            {item.badge ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
          </View>

          <Text
            style={[styles.label, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 20,
    overflow: "hidden",
  },
  item: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 8,
  },
  iconWrap: {
    position: "relative",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 14,
  },
});
