import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "../../../hooks/useTheme";
import { useRouter } from "expo-router";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SOS_FAQS = [
  {
    q: "How quickly does help arrive?",
    a: "Our team aims to reach you within 30–45 minutes depending on your location and traffic conditions.",
  },
  {
    q: "Is SOS service available 24x7?",
    a: "Yes, all emergency services are available round the clock, 365 days a year.",
  },
  {
    q: "How much does SOS service cost?",
    a: "Costs vary by service type and distance. Miles Members get 2 free SOS calls per year.",
  },
  {
    q: "What information do I need to provide?",
    a: "Your current location (auto-detected), vehicle registration number, and a brief description of the issue.",
  },
];

export default function TermsSection() {
  const { theme } = useTheme();
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <View style={styles.wrapper}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          SOS FAQs
        </Text>
        <TouchableOpacity onPress={() => router.push("/help")}>
          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
            Help Centre →
          </Text>
        </TouchableOpacity>
      </View>

      {/* FAQ accordion */}
      <View
        style={[
          styles.accordionCard,
          {
            backgroundColor: theme.colors.card || "#fff",
            borderColor: theme.colors.border,
          },
        ]}
      >
        {SOS_FAQS.map((item, index) => {
          const isOpen = openIndex === index;
          const isLast = index === SOS_FAQS.length - 1;
          return (
            <View
              key={item.q}
              style={[
                styles.item,
                !isLast && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.qRow}
                onPress={() => toggle(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.qText,
                    {
                      color: isOpen ? theme.colors.primary : theme.colors.text,
                    },
                    { flex: 1 },
                  ]}
                >
                  {item.q}
                </Text>
                <Ionicons
                  name={isOpen ? "remove-circle-outline" : "add-circle-outline"}
                  size={18}
                  color={
                    isOpen ? theme.colors.primary : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
              {isOpen && (
                <Text
                  style={[styles.aText, { color: theme.colors.textSecondary }]}
                >
                  {item.a}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Terms link */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => router.push("/terms")}
      >
        <Ionicons
          name="document-text-outline"
          size={14}
          color={theme.colors.textSecondary}
        />
        <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
          View Terms & Conditions for SOS Services
        </Text>
        <Ionicons
          name="chevron-forward"
          size={13}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
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
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
  },
  accordionCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  item: {
    paddingHorizontal: 14,
  },
  qRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 10,
  },
  qText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  aText: {
    fontSize: 13,
    lineHeight: 20,
    paddingBottom: 13,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
