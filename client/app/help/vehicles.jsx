// app/help/vehicles.jsx
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
    q: "How do I add a vehicle?",
    a: "Go to Profile → Vehicles → Add Vehicle and enter your vehicle registration number, company, and model.",
  },
  {
    q: "Can I edit vehicle details?",
    a: "Yes. Open your vehicle from the Profile page and tap Edit to update the information.",
  },
  {
    q: "Can I add multiple vehicles?",
    a: "Yes. You can register multiple vehicles under a single account with no limit.",
  },
  {
    q: "How do I delete a vehicle?",
    a: "Open the vehicle details and tap Remove Vehicle. Note that vehicles with active bookings cannot be removed.",
  },
  {
    q: "What information do I need to add a vehicle?",
    a: "You need the vehicle registration number, manufacturer (company), and model name.",
  },
  {
    q: "Can I use the same registration number for two vehicles?",
    a: "No. Each registration number must be unique across the platform.",
  },
  {
    q: "How do I select a vehicle when booking a service?",
    a: "During the booking flow, you will be prompted to choose from your registered vehicles. Make sure to add your vehicle before booking.",
  },
  {
    q: "What if my vehicle details are wrong?",
    a: "Go to the vehicle details page and tap Edit. Update the necessary fields and save. Contact support if you face issues with the registration number.",
  },
];

export default function VehiclesHelp() {
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
          My Vehicles
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
