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
const CARD_SIZE = (width - 32 - 12) / 2;

const HELP_CATEGORIES = [
  { title: "Booking Issues", icon: "calendar-outline", path: "/help/booking" },
  { title: "My Vehicles", icon: "car-outline", path: "/help/vehicles" },
  { title: "Service Status", icon: "time-outline", path: "/help/status" },
  { title: "Account & Login", icon: "person-outline", path: "/help/account" },
];

export default function HelpCategoryGrid() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Browse Topics
      </Text>
      <View style={styles.grid}>
        {HELP_CATEGORIES.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.colors.card || theme.colors.surface || "#fff",
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.push(item.path)}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <Text
              style={[styles.label, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={13}
              color={theme.colors.textSecondary}
              style={styles.arrow}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 14,
  },
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
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  arrow: {
    position: "absolute",
    top: 14,
    right: 12,
  },
});
