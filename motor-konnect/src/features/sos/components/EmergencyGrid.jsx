import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 32 - 12) / 2;

const SOS_SERVICES = [
  {
    id: "tyre-puncture",
    title: "Tyre Puncture",
    subtitle: "Immediate tyre repair",
    icon: "disc-outline",
    color: "#f59e0b",
    urgent: false,
    phone: "+917204986825",
  },
  {
    id: "fuel-assistance",
    title: "Fuel Assistance",
    subtitle: "Emergency fuel delivery",
    icon: "water-outline",
    color: "#3b82f6",
    urgent: false,
    phone: "+917204986825",
  },
  {
    id: "battery-jumpstart",
    title: "Battery Jumpstart",
    subtitle: "Dead battery start",
    icon: "battery-charging-outline",
    color: "#10b981",
    urgent: false,
    phone: "+917204986825",
  },
  {
    id: "fluid-leakage",
    title: "Car Fluid Leakage",
    subtitle: "Fluid leak inspection",
    icon: "alert-circle-outline",
    color: "#ef4444",
    urgent: true,
    phone: "+917204986825",
  },
  {
    id: "engine-scan",
    title: "Engine Scanning",
    subtitle: "OBD diagnostic scan",
    icon: "build-outline",
    color: "#6366f1",
    urgent: false,
    phone: "+917204986825",
  },
  {
    id: "wheel-lift",
    title: "Wheel-Lift Tow",
    subtitle: "Up to 20 km towing",
    icon: "car-sport-outline",
    color: "#ef4444",
    urgent: true,
    phone: "+917204986825",
  },
  {
    id: "starter-issue",
    title: "Self Starter Issue",
    subtitle: "Car not starting",
    icon: "flash-outline",
    color: "#f97316",
    urgent: false,
    phone: "+917204986825",
  },
  {
    id: "flatbed",
    title: "Flat-Bed Tow",
    subtitle: "Safe towing up to 20 km",
    icon: "trail-sign-outline",
    color: "#ef4444",
    urgent: true,
    phone: "+917204986825",
  },
  {
    id: "clutch",
    title: "Clutch Breakdown",
    subtitle: "Clutch failure support",
    icon: "settings-outline",
    color: "#8b5cf6",
    urgent: false,
    phone: "+917204986825",
  },
  {
    id: "accident",
    title: "Insurance Accident",
    subtitle: "Accident assistance",
    icon: "alert-circle-outline",
    color: "#ef4444",
    urgent: true,
    phone: "+917204986825",
  },
  {
    id: "flood",
    title: "Car Flooding",
    subtitle: "Water damage support",
    icon: "rainy-outline",
    color: "#3b82f6",
    urgent: true,
    phone: "+917204986825",
  },
  {
    id: "brake",
    title: "Brake Failure",
    subtitle: "Brake system issue",
    icon: "warning-outline",
    color: "#ef4444",
    urgent: true,
    phone: "+917204986825",
  },
  {
    id: "dashboard-light",
    title: "Critical Dashboard Light",
    subtitle: "Warning indicator issue",
    icon: "speedometer-outline",
    color: "#f59e0b",
    urgent: false,
    phone: "+917204986825",
  },
  {
    id: "wrong-fuel",
    title: "Wrong Fuel Emergency",
    subtitle: "Fuel contamination help",
    icon: "flask-outline",
    color: "#ef4444",
    urgent: true,
    phone: "+917204986825",
  },
];

export default function EmergencyGrid() {
  const { theme } = useTheme();

  const handlePress = (item) => {
    Alert.alert(
      `Call ${item.title}`,
      `Connecting you to our ${item.title.toLowerCase()} team. Stay calm — help is on the way.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call Now",
          style: "destructive",
          onPress: () => Linking.openURL(`tel:${item.phone}`).catch(() => {}),
        },
      ],
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Emergency Services
        </Text>
        <Text style={[styles.available, { color: theme.colors.textSecondary }]}>
          24 × 7 available
        </Text>
      </View>

      <View style={styles.grid}>
        {SOS_SERVICES.map((item) => (
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
            onPress={() => handlePress(item)}
            activeOpacity={0.75}
          >
            {/* Urgent badge */}
            {item.urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>URGENT</Text>
              </View>
            )}

            {/* Icon */}
            <View
              style={[styles.iconWrap, { backgroundColor: item.color + "18" }]}
            >
              <Ionicons name={item.icon} size={26} color={item.color} />
            </View>

            {/* Labels */}
            <Text
              style={[styles.cardTitle, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.cardSub, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.subtitle}
            </Text>

            {/* Call row */}
            <View
              style={[styles.callRow, { backgroundColor: item.color + "15" }]}
            >
              <Ionicons name="call-outline" size={11} color={item.color} />
              <Text style={[styles.callText, { color: item.color }]}>
                Call Now
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  available: {
    fontSize: 12,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: CARD_SIZE,
    padding: 14,
    borderRadius: 18,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  urgentBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },
  urgentText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 15,
  },
  callRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  callText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
