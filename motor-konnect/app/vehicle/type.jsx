import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
// 1. Import useNavigation to check history
import { useNavigation } from "@react-navigation/native";
// 2. Import useSafeAreaInsets for precise positioning
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const VEHICLES = [
  {
    id: "car",
    label: "Car",
    subtitle: "Sedan, SUV, Hatchback & more",
    icon: "car-outline",
    iconSelected: "car",
    accent: "#2563EB",
    lightBg: "#EFF6FF",
    border: "#BFDBFE",
    badge: "Popular",
  },
  {
    id: "bike",
    label: "Bike",
    subtitle: "Motorcycle, Scooter & more",
    icon: "bicycle-outline",
    iconSelected: "bicycle",
    accent: "#EA580C",
    lightBg: "#FFF7ED",
    border: "#FED7AA",
    badge: "Efficient",
  },
];

export default function VehicleTypeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  // 3. Get insets to handle Notch/Status Bar safely
  const insets = useSafeAreaInsets();

  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push({ pathname: "/vehicle/brand", params: { type: selected } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F3F7" />

      {/* 4. Conditionally render Back Button with Safe Positioning */}
      {navigation.canGoBack() && (
        <TouchableOpacity
          style={[
            styles.backButton,
            { top: insets.top + 10 }, // Pushes it down safely below the notch
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={24}
            color="#374151"
          />
        </TouchableOpacity>
      )}

      <View style={styles.container}>
        {/* Step Tracker */}
        <View style={styles.stepRow}>
          <View style={[styles.pip, styles.pipActive]} />
          <View style={[styles.pip, styles.pipInactive]} />
          <View style={[styles.pip, styles.pipInactive]} />
          <Text style={styles.stepLabel}>Step 1 of 3</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDash} />
            <Text style={styles.eyebrowText}>VEHICLE TYPE</Text>
          </View>

          <Text style={styles.heading}>
            Select your{"\n"}
            <Text style={styles.headingAccent}>vehicle type</Text>
          </Text>

          <Text style={styles.subText}>
            Tell us what you drive to personalize{"\n"}your registration
            experience.
          </Text>
        </View>

        {/* Cards */}
        <View style={styles.cards}>
          {VEHICLES.map((v) => {
            const isSel = selected === v.id;
            return (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.card,
                  isSel && {
                    borderColor: v.accent,
                    backgroundColor: v.lightBg,
                    ...Platform.select({
                      ios: {
                        shadowColor: v.accent,
                        shadowOpacity: 0.18,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 8 },
                      },
                      android: { elevation: 6 },
                    }),
                  },
                ]}
                onPress={() => setSelected(v.id)}
                activeOpacity={0.82}
              >
                {/* Icon Box */}
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isSel ? v.border + "88" : v.lightBg,
                      borderColor: isSel ? v.border : "#EAEBF0",
                    },
                  ]}
                >
                  <Ionicons
                    name={isSel ? v.iconSelected : v.icon}
                    size={34}
                    color={v.accent}
                  />
                </View>

                {/* Text */}
                <View style={styles.cardBody}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{v.label}</Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: v.lightBg, borderColor: v.border },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: v.accent }]}>
                        {v.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardSub}>{v.subtitle}</Text>
                </View>

                {/* Indicator */}
                <View
                  style={[
                    styles.indicator,
                    isSel && { backgroundColor: "transparent" },
                  ]}
                >
                  <Ionicons
                    name={isSel ? "checkmark-circle" : "chevron-forward"}
                    size={22}
                    color={isSel ? v.accent : "#D1D5DB"}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.btn, !selected && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.88}
        >
          <Text style={[styles.btnText, !selected && styles.btnTextDisabled]}>
            {selected
              ? `Continue with ${selected === "car" ? "Car" : "Bike"}`
              : "Select a vehicle to continue"}
          </Text>
          {selected && (
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="lock-closed-outline" size={12} color="#C4C4CC" />
          <Text style={styles.footerText}>
            Your data is encrypted and secure
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F2F3F7",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
    paddingBottom: 32,
    justifyContent: "center",
  },

  // Back Button Style
  backButton: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    // Shadow for the floating button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // Step tracker
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 40,
  },
  pip: {
    height: 4,
    borderRadius: 4,
  },
  pipActive: {
    width: 28,
    backgroundColor: "#0A0A14",
  },
  pipInactive: {
    width: 12,
    backgroundColor: "#D1D5DB",
  },
  stepLabel: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.4,
  },

  // Header
  header: { marginBottom: 36 },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  eyebrowDash: {
    width: 22,
    height: 2.5,
    backgroundColor: "#0A0A14",
    borderRadius: 2,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: "#374151",
  },
  heading: {
    fontSize: 38,
    fontWeight: "800",
    color: "#0A0A14",
    lineHeight: 44,
    letterSpacing: -1,
    marginBottom: 12,
  },
  headingAccent: {
    color: "#2563EB",
  },
  subText: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 22,
    fontWeight: "400",
  },

  // Cards
  cards: { gap: 12, marginBottom: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#EAEBF0",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
    }),
  },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0A0A14",
    letterSpacing: -0.5,
  },
  badge: {
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardSub: {
    fontSize: 12.5,
    color: "#9CA3AF",
    fontWeight: "400",
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Button
  btn: {
    backgroundColor: "#0A0A14",
    borderRadius: 16,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0A0A14",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
  btnDisabled: {
    backgroundColor: "#EAEBF0",
    elevation: 0,
    shadowOpacity: 0,
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  btnTextDisabled: { color: "#ACACBC" },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#C4C4CC",
    fontWeight: "500",
  },
});
