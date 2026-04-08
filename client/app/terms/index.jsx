import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";
import { useRouter } from "expo-router";

const termsData = [
  {
    title: "Introduction",
    content: `Motor Konnect Terms & Conditions

Effective Date: 1-Apr-2026

By using Motor Konnect, you agree to the following terms:`,
  },
  {
    title: "1. Eligibility",
    content: `• Users must own a car or bike
• Must provide accurate vehicle details for registration`,
  },
  {
    title: "2. Membership",
    content: `• First 5,000 users receive free membership
• After that, membership costs ₹200 per year
• Membership grants access to app features and offers`,
  },
  {
    title: "3. User Responsibilities",
    content: `Users agree to:
• Provide accurate and updated information
• Use the app only for lawful purposes
• Not misuse or attempt to hack the platform`,
  },
  {
    title: "4. Services Provided",
    content: `MotorKonnect:
• Connects users with garages
• Shows offers and service options
• Suggests garages based on location and insurance

We do not directly provide repair services.`,
  },
  {
    title: "5. Payments & Refunds",
    content: `• Membership fees are non-refundable unless stated otherwise
• Payments are processed securely via third-party providers`,
  },
  {
    title: "6. Limitation of Liability",
    content: `MotorKonnect is not responsible for:
• Quality of service provided by garages
• Delays, damages, or disputes between users and garages`,
  },
  {
    title: "7. Third-Party Services",
    content: `Garages and service providers are independent entities.`,
  },
  {
    title: "8. Account Suspension",
    content: `We reserve the right to:
• Suspend or terminate accounts for misuse or violation of terms`,
  },
  {
    title: "9. Intellectual Property",
    content: `All content belongs to MotorKonnect.`,
  },
  {
    title: "10. Privacy",
    content: `Use of the app is also governed by our Privacy Policy.`,
  },
  {
    title: "11. Changes to Terms",
    content: `We may update these Terms at any time.`,
  },
  {
    title: "12. Governing Law",
    content: `These terms are governed by the laws of India.`,
  },
  {
    title: "13. Contact",
    content: `📧 support@motorkonnect.com
📍 No 12, 13 & 12/A, Kirthan Arcade, 3rd Floor, Aditya Nagar,
Sandeep Unnikrishnan Road, Bangalore - 560097`,
  },
];

export default function TermsPage() {
  const { theme } = useTheme();
  const router = useRouter();

  // ✅ SAME as Support screen
  const handleEmail = () => {
    Linking.openURL("mailto:support@motorkonnect.com").catch(() => {});
  };

  const handleMap = () => {
    const address =
      "No 12, 13 & 12/A, Kirthan Arcade, Aditya Nagar, Bangalore 560097";

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;

    Linking.openURL(url).catch(() => {});
  };

  const renderContent = (content) =>
    content.split("\n").map((line, i) => (
      <Text
        key={i}
        style={[styles.contentText, { color: theme.colors.textSecondary }]}
      >
        {line}
      </Text>
    ));

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Terms & Conditions
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {termsData.map((section, index) => {
          const isContact = section.title.includes("Contact");

          return (
            <View
              key={index}
              style={[
                styles.card,
                {
                  backgroundColor:
                    theme.colors.card || theme.colors.surface || "#fff",
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* SECTION HEADER */}
              <View style={styles.sectionHeader}>
                <Ionicons
                  name={
                    isContact ? "call-outline" : "document-text-outline"
                  }
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  {section.title}
                </Text>
              </View>

              {/* CONTENT */}
              <View style={styles.contentWrap}>
                {renderContent(section.content)}
              </View>

              {/* ✅ UPDATED CONTACT ACTIONS */}
              {isContact && (
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={[
                      styles.contactBtn,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={handleEmail}
                  >
                    <Ionicons name="mail" size={14} color="#fff" />
                    <Text style={styles.contactBtnText}>Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.contactBtnOutline,
                      { borderColor: theme.colors.primary },
                    ]}
                    onPress={handleMap}
                  >
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.contactBtnOutlineText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      View Map
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
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

  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  contentWrap: { gap: 4 },

  contentText: {
    fontSize: 13,
    lineHeight: 20,
  },

  contactActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  contactBtnText: {
    color: "#fff",
    fontWeight: "600",
  },

  contactBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },

  contactBtnOutlineText: {
    fontWeight: "600",
  },
});