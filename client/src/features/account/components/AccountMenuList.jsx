import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useRouter } from "expo-router";

export default function AccountMenuList() {
  const { theme } = useTheme();
  const router = useRouter();

  const menuSections = [
    {
      sectionTitle: "Account",
      items: [
        { title: "Profile", icon: "person-outline", path: "/profile" },
        {
          title: "Set Preferences",
          icon: "settings-outline",
          path: "/preferences",
        },
        {
          title: "Notifications",
          icon: "notifications-outline",
          path: "/notifications",
        },
      ],
    },
    {
      sectionTitle: "My Garage",
      items: [
        { title: "My Vehicles", icon: "car-outline", path: "/vehicles" },
        {
          title: "Service History",
          icon: "time-outline",
          path: "/service-history",
        },
        {
          title: "Appointments",
          icon: "calendar-outline",
          path: "/appointments",
        },
      ],
    },
    {
      sectionTitle: "Rewards & Partners",
      items: [
        { title: "Refer & Earn", icon: "gift-outline", path: "/refer" },
        {
          title: "Register as Partner",
          icon: "business-outline",
          path: "/partner",
        },
      ],
    },
    {
      sectionTitle: "Support",
      items: [
        { title: "Help & FAQ", icon: "help-circle-outline", path: "/help" },
        {
          title: "Contact Support",
          icon: "chatbubble-outline",
          path: "/support",
        },
        { title: "Privacy Policy", icon: "shield-outline", path: "/privacy" },
      ],
    },
  ];

  return (
    <View style={styles.wrapper}>
      {menuSections.map((section) => (
        <View key={section.sectionTitle} style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          >
            {section.sectionTitle.toUpperCase()}
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.colors.card || theme.colors.surface || "#fff",
                borderColor: theme.colors.border,
              },
            ]}
          >
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.row,
                  index < section.items.length - 1 && {
                    borderBottomWidth: 0.5,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
                onPress={() => router.push(item.path)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: theme.colors.primary + "15" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
});
