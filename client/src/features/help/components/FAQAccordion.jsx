import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_LIST = [
  {
    question: "How do I book a service?",
    answer:
      "Tap on any service from the Home screen, choose your preferred slot, confirm your vehicle details, and proceed to payment. You'll receive a confirmation instantly.",
  },
  {
    question: "Can I reschedule or cancel my booking?",
    answer:
      "Yes, you can reschedule or cancel up to 2 hours before your appointment from the 'Appointments' section in your account. Cancellations after that may incur a small fee.",
  },
  {
    question: "How are service prices calculated?",
    answer:
      "Prices are based on your vehicle type and model, the selected service, and any active discounts or membership benefits. Final price is shown before you confirm.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept UPI, credit/debit cards, net banking, and GoApp Wallet. You can also pay cash at the service centre if preferred.",
  },
  {
    question: "How do I track my service status?",
    answer:
      "You can track your service in real time from the 'Appointments' tab. You'll also receive push notifications at key stages of the service.",
  },
  {
    question: "How do I get a refund?",
    answer:
      "Refunds for cancelled bookings are processed within 5–7 business days back to the original payment method, or instantly to your GoApp Wallet if preferred.",
  },
];

export default function FAQAccordion() {
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Frequently Asked Questions
      </Text>

      <View
        style={[
          styles.accordionCard,
          {
            backgroundColor:
              theme.colors.card || theme.colors.surface || "#fff",
            borderColor: theme.colors.border,
          },
        ]}
      >
        {FAQ_LIST.map((item, index) => {
          const isOpen = openIndex === index;
          const isLast = index === FAQ_LIST.length - 1;

          return (
            <View
              key={item.question}
              style={[
                styles.itemWrap,
                !isLast && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => toggle(index)}
                style={styles.questionRow}
                activeOpacity={0.7}
              >
                {/* Number badge */}
                <View
                  style={[
                    styles.numBadge,
                    {
                      backgroundColor: isOpen
                        ? theme.colors.primary
                        : theme.colors.primary + "15",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.numText,
                      { color: isOpen ? "#fff" : theme.colors.primary },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.question,
                    {
                      color: isOpen ? theme.colors.primary : theme.colors.text,
                      flex: 1,
                    },
                  ]}
                >
                  {item.question}
                </Text>

                <Ionicons
                  name={isOpen ? "remove-circle-outline" : "add-circle-outline"}
                  size={20}
                  color={
                    isOpen ? theme.colors.primary : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.answerWrap}>
                  <Text
                    style={[
                      styles.answer,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {item.answer}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
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
  accordionCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemWrap: {
    paddingHorizontal: 14,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  numBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  numText: {
    fontSize: 11,
    fontWeight: "800",
  },
  question: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  answerWrap: {
    paddingBottom: 14,
    paddingLeft: 38,
  },
  answer: {
    fontSize: 13,
    lineHeight: 20,
  },
});
