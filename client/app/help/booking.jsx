// app/help/booking.jsx
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
    q: "How do I book a service?",
    a: "Go to the Home page, choose a service, select your vehicle and preferred time slot, then confirm the booking.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes. You can cancel from the Appointments section before the service starts.",
  },
  {
    q: "Can I reschedule a booking?",
    a: "Yes. Tap your booking in Appointments and select Reschedule to pick a new time.",
  },
  {
    q: "How far in advance can I book?",
    a: "You can book a service up to 30 days in advance. Same-day bookings are subject to garage availability.",
  },
  {
    q: "Can I book for multiple vehicles at once?",
    a: "Each booking is tied to a single vehicle. You can create separate bookings for each of your registered vehicles.",
  },
  {
    q: "What happens after I confirm a booking?",
    a: "You will receive a confirmation notification. The garage will also confirm your slot. You can track the status in the Appointments section.",
  },
  {
    q: "Is there a booking fee?",
    a: "No. There is no extra fee for placing a booking. You only pay for the service at the garage.",
  },
  {
    q: "What if the garage is not available at my preferred time?",
    a: "You will be shown available time slots only. If your preferred slot is unavailable, choose the next available option.",
  },
  {
    q: "Can I book multiple services in one visit?",
    a: "Currently each booking covers one service. Contact the garage directly if you need multiple services in a single visit.",
  },
];

export default function BookingHelp() {
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
          Booking Issues
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
              <Text style={[styles.question, { color: theme.colors.text }]}>
                {item.q}
              </Text>
            </View>
            <Text
              style={[styles.answer, { color: theme.colors.textSecondary }]}
            >
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
  card: { borderRadius: 14, borderWidth: 0.5, padding: 16 },
  qRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  question: { fontSize: 15, fontWeight: "700", flex: 1 },
  answer: { fontSize: 13, lineHeight: 20 },
});
