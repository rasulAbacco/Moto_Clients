// app/help/account.jsx
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
    q: "How do I update my profile?",
    a: "Go to Profile → Edit Profile to update your personal information.",
  },
  {
    q: "How do I change my phone number?",
    a: "Contact support to change your registered mobile number as it is your primary login identifier.",
  },
  {
    q: "How do I logout?",
    a: "Go to Profile and tap the Logout button at the bottom of the page.",
  },
  {
    q: "How do I update my email address?",
    a: "Go to Profile → Edit Profile and update the Email Address field, then tap Save.",
  },
  {
    q: "How do I update my date of birth?",
    a: "Go to Profile → Edit Profile and update the Date of Birth field.",
  },
  {
    q: "Can I add my company or tax details?",
    a: "Yes. Go to Profile → Edit Profile and fill in the Registration section with your company name and tax/VAT number.",
  },
  {
    q: "What happens if I forget my OTP?",
    a: "Tap 'Resend OTP' on the verification screen. A new OTP will be sent to your registered mobile number.",
  },
  {
    q: "Is my personal data secure?",
    a: "Yes. All your data is encrypted and stored securely. We never share your information with third parties without your consent.",
  },
  {
    q: "How do I delete my account?",
    a: "Please contact our support team to request account deletion. We will process your request within 7 business days.",
  },
];

export default function AccountHelp() {
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
          Account & Login
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
