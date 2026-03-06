import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

import SOSMapHeader from "./components/SOSMapHeader";
import EmergencyGrid from "./components/EmergencyGrid";
import MembershipStrip from "./components/MembershipStrip";
import TermsSection from "./components/TermsSection";
import SafetyBanner from "./components/SafetyBanner";

export default function SOSScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <SOSMapHeader />
        <EmergencyGrid />
        <MembershipStrip />
        <TermsSection />
        <SafetyBanner />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 80,
  },
});
