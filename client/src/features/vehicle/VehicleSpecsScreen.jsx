import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
  TextInput,        // ✅ was missing — caused the crash
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "../../../src/hooks/useTheme.js";
import { setSelectedVehicle, setGuestVehicle } from "./vehicle.service";
import { useAuth } from "../../providers/AuthProvider";
import api from "../../services/apiClient";

const FUEL_CATEGORIES = [
  {
    category: "Conventional",
    color: "#0033ff",
    options: [
      { label: "Petrol", icon: "flame-outline" },
      { label: "Diesel", icon: "water-outline" },
      { label: "CNG", icon: "leaf-outline" },
      { label: "LPG", icon: "leaf-outline" },
    ],
  },
  {
    category: "Electric & Hybrid",
    color: "#27ae60",
    options: [
      { label: "Electric (BEV)", icon: "flash-outline" },
      { label: "Petrol + Electric (Full Hybrid)", icon: "battery-charging-outline" },
      { label: "Diesel + Electric (Full Hybrid)", icon: "battery-charging-outline" },
      { label: "Petrol + Mild Hybrid (MHEV)", icon: "battery-half-outline" },
      { label: "Diesel + Mild Hybrid (MHEV)", icon: "battery-half-outline" },
      { label: "Plug-in Hybrid Petrol (PHEV)", icon: "battery-charging-outline" },
      { label: "Plug-in Hybrid Diesel (PHEV)", icon: "battery-charging-outline" },
    ],
  },
  {
    category: "Bi-Fuel",
    color: "#8e44ad",
    options: [
      { label: "Petrol + CNG", icon: "git-merge-outline" },
      { label: "Petrol + LPG", icon: "git-merge-outline" },
      { label: "Diesel + CNG", icon: "git-merge-outline" },
      { label: "Diesel + LPG", icon: "git-merge-outline" },
    ],
  },
  {
    category: "Hydrogen",
    color: "#2980b9",
    options: [
      { label: "Petrol + Hydrogen", icon: "flame-outline" },
      { label: "Hydrogen (Fuel Cell)", icon: "water-outline" },
    ],
  },
];

const BIKE_FUEL_OPTIONS = [
  {
    category: "Fuel Type",
    color: "#0033ff",
    options: [
      { label: "Petrol", icon: "flame-outline" },
      { label: "Electric", icon: "flash-outline" },
      { label: "Petrol + Electric (Hybrid)", icon: "battery-charging-outline" },
    ],
  },
];

const TRANSMISSION_OPTIONS = [
  { label: "Manual", icon: "settings-outline", desc: "Gear lever & clutch" },
  { label: "Automatic", icon: "speedometer-outline", desc: "Self-shifting gears" },
  { label: "CVT", icon: "radio-button-on-outline", desc: "Continuously variable" },
  { label: "DCT / DSG", icon: "git-merge-outline", desc: "Dual-clutch" },
  { label: "AMT", icon: "construct-outline", desc: "Automated manual" },
];

const BIKE_TRANSMISSION_OPTIONS = [
  { label: "Manual", icon: "settings-outline", desc: "Clutch + gear shifting" },
  { label: "Automatic", icon: "speedometer-outline", desc: "CVT / Scooter automatic" },
  { label: "Semi-Automatic", icon: "git-branch-outline", desc: "Clutchless gear shifting" },
];

export default function VehicleSpecsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const { type, brandId, brandData, model } = useLocalSearchParams();

  const modelObj = JSON.parse(model);
  const brandObj = brandData ? JSON.parse(brandData) : null;

  const [fuel, setFuel] = useState(null);
  const [transmission, setTransmission] = useState(null);
  const [year, setYear] = useState("");
  const [saving, setSaving] = useState(false);

  const fuelCategories = type === "bike" ? BIKE_FUEL_OPTIONS : FUEL_CATEGORIES;
  const transmissionOptions = type === "bike" ? BIKE_TRANSMISSION_OPTIONS : TRANSMISSION_OPTIONS;

  const isDark = theme.dark;
  const surface = isDark ? "#1c1c1e" : "#ffffff";
  const textPrimary = isDark ? "#f5f5f5" : "#111111";
  const textSecondary = isDark ? "#8e8e93" : "#6b6b6b";
  const border = isDark ? "#3a3a3c" : "#e8e8e8";
  const accent = "#0037ff";
  const cardBg = isDark ? "#2c2c2e" : "#f7f7f7";

  const isContinueDisabled = !fuel || !transmission || saving;

  // ─────────────────────────────────────────────────────────
  // handleContinue
  //
  // FLOW for logged-in users:
  //   1. POST /auth/vehicles  →  backend creates a NEW ModelYear row
  //      (modelId + year)  →  copies its id into Vehicle.modelYearId
  //   2. No upsert, no lookup — always a fresh ModelYear per save
  //
  // FLOW for guests:
  //   1. Save locally only, no API call
  // ─────────────────────────────────────────────────────────
  const handleContinue = async () => {
    if (isContinueDisabled) return;
    setSaving(true);

    try {
      // Always save locally so home screen can read the vehicle
      const vehicleData = {
        brand: {
          name: brandObj?.name ?? "",
          logoUrl: brandObj?.logoUrl ?? null,
        },
        model: {
          name: modelObj.name,
          thumbnailUrl: modelObj.thumbnailUrl ?? null,
        },
        fuelType: fuel,
        transmission,
        modelYear: year || null,
      };

      await setSelectedVehicle(vehicleData);

      // Guest flow — stop here
      if (!user) {
        await setGuestVehicle(vehicleData);
        router.replace("/(tabs)/home");
        return;
      }

      // Logged-in flow
      // Backend will:
      //   1. Find brand by name
      //   2. Find model by name + brandId
      //   3. CREATE a new ModelYear { modelId, year }  ← always new
      //   4. Copy new ModelYear.id → Vehicle.modelYearId
      const payload = {
        vehicleType: type ?? "car",
        brandName: brandObj?.name,
        modelName: modelObj.name,
        modelYear: year || null,   // e.g. "2023"
        fuelType: fuel,
        transmission,
      };

      await api.post("/auth/vehicles", payload);

      router.replace("/(tabs)/home");
    } catch (e) {
      console.warn("Vehicle save failed:", e.response?.data || e.message);
    } finally {
      setSaving(false);
    }
  };

  const previewImage = modelObj.thumbnailUrl ?? brandObj?.logoUrl ?? null;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={accent}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          Vehicle Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.heroWrap}>
          <Text style={[styles.heroEyebrow, { color: accent }]}>STEP 3 OF 3</Text>
          <Text style={[styles.heroTitle, { color: textPrimary }]}>Almost done! 🎉</Text>
          <Text style={[styles.heroSub, { color: textSecondary }]}>
            Tell us a bit more about your {type === "bike" ? "bike" : "car"}
          </Text>
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={[styles.summaryIconWrap, { backgroundColor: accent + "12" }]}>
            {previewImage ? (
              <Image
                source={{ uri: previewImage }}
                style={styles.summaryImage}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="car-sport-outline" size={22} color={accent} />
            )}
          </View>
          <View style={styles.summaryBody}>
            <Text style={[styles.summaryName, { color: textPrimary }]}>
              {brandObj?.name ? `${brandObj.name} ${modelObj.name}` : modelObj.name}
            </Text>
            <Text style={[styles.summaryMeta, { color: textSecondary }]}>
              {fuel ?? "No fuel type selected"}
              {transmission ? ` · ${transmission}` : ""}
              {year ? ` · ${year}` : ""}
            </Text>
          </View>
          {fuel && transmission && (
            <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
          )}
        </View>

        {/* ── Model Year ── */}
        <View style={[styles.section, { marginBottom: 28 }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Model Year</Text>
          <Text style={[styles.sectionSub, { color: textSecondary }]}>
            What year is your {type === "bike" ? "bike" : "car"}? (optional)
          </Text>
          <TextInput
            value={year}
            onChangeText={(v) => {
              // Only allow digits, max 4
              const clean = v.replace(/[^0-9]/g, "").slice(0, 4);
              setYear(clean);
            }}
            placeholder="e.g. 2023"
            keyboardType="numeric"
            maxLength={4}
            returnKeyType="done"
            style={[
              styles.yearInput,
              {
                borderColor: year.length === 4 ? accent : border,
                backgroundColor: surface,
                color: textPrimary,
              },
            ]}
            placeholderTextColor={textSecondary + "90"}
          />
          {year.length > 0 && year.length < 4 && (
            <Text style={[styles.yearHint, { color: "#e74c3c" }]}>
              Enter a valid 4-digit year
            </Text>
          )}
        </View>

        {/* ── Fuel Type ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Fuel Type</Text>
          <Text style={[styles.sectionSub, { color: textSecondary }]}>
            Select the fuel your {type === "bike" ? "bike" : "car"} runs on
          </Text>
          {fuelCategories.map((cat) => (
            <View key={cat.category} style={styles.categoryBlock}>
              <View style={styles.catHeader}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.catLabel, { color: textSecondary }]}>
                  {cat.category}
                </Text>
              </View>
              <View style={[styles.fuelGroup, { backgroundColor: surface, borderColor: border }]}>
                {cat.options.map((opt, idx) => {
                  const isSelected = fuel === opt.label;
                  const isLast = idx === cat.options.length - 1;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      style={[
                        styles.fuelRow,
                        !isLast && {
                          borderBottomColor: border,
                          borderBottomWidth: StyleSheet.hairlineWidth,
                        },
                        isSelected && { backgroundColor: accent + "0d" },
                      ]}
                      onPress={() => setFuel(opt.label)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.fuelIconWrap,
                          { backgroundColor: isSelected ? accent + "20" : cardBg },
                        ]}
                      >
                        <Ionicons
                          name={opt.icon}
                          size={16}
                          color={isSelected ? accent : textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.fuelLabel,
                          { color: textPrimary, fontWeight: isSelected ? "700" : "500" },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={18} color={accent} />
                      ) : (
                        <View style={[styles.radioEmpty, { borderColor: border }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* ── Transmission ── */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Transmission</Text>
          <Text style={[styles.sectionSub, { color: textSecondary }]}>
            How does your {type === "bike" ? "bike" : "car"} change gears?
          </Text>
          <View style={[styles.fuelGroup, { backgroundColor: surface, borderColor: border }]}>
            {transmissionOptions.map((opt, idx) => {
              const isSelected = transmission === opt.label;
              const isLast = idx === transmissionOptions.length - 1;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.fuelRow,
                    !isLast && {
                      borderBottomColor: border,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                    isSelected && { backgroundColor: accent + "0d" },
                  ]}
                  onPress={() => setTransmission(opt.label)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.fuelIconWrap,
                      { backgroundColor: isSelected ? accent + "20" : cardBg },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={16}
                      color={isSelected ? accent : textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.fuelLabel,
                        { color: textPrimary, fontWeight: isSelected ? "700" : "500" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={[styles.transDesc, { color: textSecondary }]}>
                      {opt.desc}
                    </Text>
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={18} color={accent} />
                  ) : (
                    <View style={[styles.radioEmpty, { borderColor: border }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.colors.background, borderTopColor: border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: isContinueDisabled ? accent + "50" : accent },
          ]}
          disabled={isContinueDisabled}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.continueBtnText}>Save & Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { minWidth: 44 },
  headerTitle: { fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  headerRight: { minWidth: 44 },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  heroWrap: { paddingTop: 22, paddingBottom: 16 },
  heroEyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 2, marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4, marginBottom: 5 },
  heroSub: { fontSize: 14 },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIconWrap: {
    width: 54,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  summaryImage: { width: 54, height: 40 },
  summaryBody: { flex: 1 },
  summaryName: { fontSize: 15, fontWeight: "700" },
  summaryMeta: { fontSize: 12, marginTop: 2 },

  // Year input
  yearInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
  },
  yearHint: { fontSize: 11, marginTop: 6, marginLeft: 4 },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: "800", letterSpacing: -0.2, marginBottom: 3 },
  sectionSub: { fontSize: 12, marginBottom: 14 },
  categoryBlock: { marginBottom: 14 },
  catHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 7 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" },
  fuelGroup: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  fuelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  fuelIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fuelLabel: { flex: 1, fontSize: 14 },
  transDesc: { fontSize: 11, marginTop: 1 },
  radioEmpty: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  continueBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  continueBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
});