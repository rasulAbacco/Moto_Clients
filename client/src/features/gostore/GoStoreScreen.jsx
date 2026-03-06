import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

import StoreHeader from "./components/StoreHeader";
import CategoryCarousel from "./components/CategoryCarousel";
import ProductGrid from "./components/ProductGrid";
import OfferBanner from "./components/OfferBanner";
import SectionHeader from "./components/SectionHeader";
import CartBar from "./components/CartBar";

export default function GoStoreScreen() {
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
        <StoreHeader />
        <CategoryCarousel />

        <SectionHeader title="Featured Products" seeAllPath="/store/featured" />
        <ProductGrid />

        <OfferBanner />

        <SectionHeader
          title="Recommended For You"
          seeAllPath="/store/recommended"
        />
        <ProductGrid />
      </ScrollView>

      <CartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
});
