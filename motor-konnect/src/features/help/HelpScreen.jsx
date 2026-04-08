import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { useRouter } from "expo-router";

import HelpSearchBar from "./components/HelpSearchBar";
import HelpCategoryGrid from "./components/HelpCategoryGrid";
import FAQAccordion from "./components/FAQAccordion";
import ContactSupportCard from "./components/ContactSupportCard";

export default function HelpScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={theme.colors.primary}
          />
          {Platform.OS === "ios" && (
            <Text style={[styles.backLabel, { color: theme.colors.primary }]}>
              Back
            </Text>
          )}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Help & Support
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Hero */}
        <View style={styles.heroWrap}>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            How can we{"\n"}help you? 👋
          </Text>
          <Text
            style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}
          >
            Search topics or browse categories below
          </Text>
        </View>

        <HelpSearchBar />
        <HelpCategoryGrid />
        <FAQAccordion />
        <ContactSupportCard />
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
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
  },
  backLabel: {
    fontSize: 16,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  headerRight: {
    minWidth: 60,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  heroWrap: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
