// app/help/status.jsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/hooks/useTheme";

const DATA = [
  {
    q: "How do I track service status?",
    a: "Open the Appointments section to view the current service progress in real time.",
  },
  {
    q: "Will I get notifications?",
    a: "Yes. You will receive push notifications when your service starts, is in progress, and is completed.",
  },
  {
    q: "Can I contact the service center?",
    a: "Yes. Open the booking details and tap the contact button to reach the service provider directly.",
  },
  {
    q: "What do the different statuses mean?",
    a: "Pending: Awaiting garage confirmation. Confirmed: Slot accepted. In Progress: Vehicle is being serviced. Completed: Service finished. Cancelled: Booking was cancelled.",
  },
  {
    q: "My status shows Pending for a long time. What should I do?",
    a: "If your booking remains Pending for more than 2 hours, please contact the garage or reach out to our support team.",
  },
  {
    q: "Can I see my past service history?",
    a: "Yes. In the Appointments section, switch to the Completed tab to view all past services.",
  },
  {
    q: "What happens if a service is marked Completed but I am not satisfied?",
    a: "Please raise a complaint through the booking details page or contact support within 48 hours of service completion.",
  },
  {
    q: "Will I get a service report or invoice?",
    a: "Yes. Once the service is marked Completed, a digital invoice will be available in your booking details.",
  },
];

export default function StatusHelp() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Service Status
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {DATA.map((item, i) => (
          <View
            key={i}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card || "#fff",
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.qRow}>
              <Ionicons
                name="help-circle-outline"
                size={16}
                color={theme.colors.primary}
                style={{ marginRight: 6, marginTop: 1 }}
              />
              <Text style={[styles.q, { color: theme.colors.text }]}>
                {item.q}
              </Text>
            </View>
            <Text style={[styles.a, { color: theme.colors.textSecondary }]}>
              {item.a}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: { width: 40 },
  title: { fontSize: 17, fontWeight: "700" },
  container: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 14, borderWidth: 0.5 },
  qRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  q: { fontSize: 15, fontWeight: "700", flex: 1 },
  a: { fontSize: 13, lineHeight: 20 },
});
