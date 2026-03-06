import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

import AccountHeader from "./components/AccountHeader";
import AccountQuickActions from "./components/AccountQuickActions";
import WalletCard from "./components/WalletCard";
import MembershipCard from "./components/MembershipCard";
import AccountMenuList from "./components/AccountMenuList";
import AccountFooter from "./components/AccountFooter";

export default function AccountScreen() {
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
        <AccountHeader />
        <AccountQuickActions />
        <WalletCard />
        <MembershipCard />
        <AccountMenuList />
        <AccountFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
