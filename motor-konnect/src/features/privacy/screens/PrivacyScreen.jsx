import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../hooks/useTheme";
import privacyData from "../data/privacyData";

export default function PrivacyScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Privacy Policy
        </Text>

        {privacyData.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.text }]}
            >
              {section.title}
            </Text>

            <Text
              style={[
                styles.sectionContent,
                { color: theme.colors.textSecondary },
              ]}
            >
              {section.content}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 13,
    lineHeight: 20,
  },
});