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
import { useTheme } from "../../../hooks/useTheme";
import { useRouter } from "expo-router";
import privacyData from "../data/privacyData";
import { safeBack } from "../../../utils/navigation";
import ScreenHeader from "../../../components/common/ScreenHeader";

export default function PrivacyScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  // ✅ SAME behavior as Support & Terms
  const handleEmail = () => {
    Linking.openURL("mailto:support@motorkonnect.com").catch(() => {});
  };

  const handleMap = () => {
    const address =
      "No 12, 13 & 12/A, Kirthan Arcade, Aditya Nagar, Bangalore 560097";

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;

    Linking.openURL(url).catch(() => {});
  };

  const renderContent = (content) => {
    return content.split("\n").map((line, i) => (
      <Text
        key={i}
        style={[styles.contentText, { color: theme.colors.textSecondary }]}
      >
        {line}
      </Text>
    ));
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["left", "right"]}
    >
      {/* Header */}
      <ScreenHeader title="Privacy Policy" onBack={() => safeBack(router)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {privacyData.map((section, index) => {
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
              {/* Section Title */}
              <View style={styles.sectionHeader}>
                <Ionicons
                  name={isContact ? "call-outline" : "document-text-outline"}
                  size={16}
                  color={theme.colors.primary}
                  style={{ marginRight: 6, marginTop: 2 }}
                />
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  {section.title}
                </Text>
              </View>

              {/* Content */}
              <View style={styles.contentWrap}>
                {renderContent(section.content)}
              </View>

              {/* ✅ NEW: Contact Buttons */}
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
  backBtn: {
    width: 40,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  contentWrap: {
    gap: 4,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 20,
  },

  // ✅ NEW styles (same as Terms/Support)
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
