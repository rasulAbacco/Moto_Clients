import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import StoreHeader from "./components/StoreHeader";
import CartBar from "./components/CartBar";

const { height } = Dimensions.get("window");

export default function GoStoreScreen() {
  const { theme } = useTheme();
  const [isStoreLive] = React.useState(false);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
      >
        <StoreHeader />

        {!isStoreLive && (
          <View style={styles.heroContainer}>
            {/* Ambient Background Glow */}
            <View
              style={[
                styles.glow,
                { backgroundColor: theme.colors.primary, opacity: 0.12 },
              ]}
            />

            <View style={styles.content}>
              {/* Store Badge */}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="bag-handle"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  CURATING PREMIUM INVENTORY
                </Text>
              </View>

              {/* Hero Text */}
              <Text style={[styles.title, { color: theme.colors.text }]}>
                A New Way to{"\n"}
                <Text style={{ color: theme.colors.primary }}>
                  Shop Genuine
                </Text>
              </Text>

              <Text
                style={[
                  styles.description,
                  { color: theme.colors.textSecondary },
                ]}
              >
                We are hand-picking the finest parts, accessories, and
                maintenance essentials for your vehicle. Our digital storefront
                will open shortly.
              </Text>

              {/* Modern Progress Tracking */}
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <View style={styles.statusRow}>
                    <View style={styles.liveDot} />
                    <Text
                      style={[
                        styles.statusLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Inventory Setup in Progress
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.percentText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    85%
                  </Text>
                </View>

                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: theme.colors.border },
                  ]}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primary + "90"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: "85%" }]}
                  />
                </View>

                <Text style={styles.footerHint}>
                  Expected Launch:{" "}
                  <Text style={{ fontWeight: "700" }}>Coming Soon</Text>
                </Text>
              </View>

              {/* Support Icon */}
              <View style={styles.footerIcon}>
                <Ionicons
                  name="construct-outline"
                  size={40}
                  color={theme.colors.textSecondary + "40"}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {isStoreLive && <CartBar />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  heroContainer: {
    height: height * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  content: { width: "100%", alignItems: "center" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1,
    marginBottom: 28,
    gap: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },

  title: {
    fontSize: 40,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 46,
    letterSpacing: -1.8,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 25,
    marginBottom: 44,
    paddingHorizontal: 10,
    opacity: 0.8,
  },

  progressCard: {
    width: "100%",
    paddingHorizontal: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: { fontSize: 13, fontWeight: "600" },
  percentText: { fontSize: 16, fontWeight: "900" },

  progressTrack: { height: 12, borderRadius: 6, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 6 },

  footerHint: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    letterSpacing: 0.3,
  },

  footerIcon: {
    marginTop: 60,
    opacity: 0.5,
  },
});








// import { View, ScrollView, StyleSheet } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useTheme } from "../../hooks/useTheme";

// import StoreHeader from "./components/StoreHeader";
// import CategoryCarousel from "./components/CategoryCarousel";
// import ProductGrid from "./components/ProductGrid";
// import OfferBanner from "./components/OfferBanner";
// import SectionHeader from "./components/SectionHeader";
// import CartBar from "./components/CartBar";

// export default function GoStoreScreen() {
//   const { theme } = useTheme();

//   return (
//     <SafeAreaView
//       style={{ flex: 1, backgroundColor: theme.colors.background }}
//       edges={["top"]}
//     >
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.container}
//       >
//         <StoreHeader />
//         <CategoryCarousel />

//         <SectionHeader title="Featured Products" seeAllPath="/store/featured" />
//         <ProductGrid />

//         <OfferBanner />

//         <SectionHeader
//           title="Recommended For You"
//           seeAllPath="/store/recommended"
//         />
//         <ProductGrid />
//       </ScrollView>

//       <CartBar />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: 16,
//     paddingBottom: 160,
//   },
// });
