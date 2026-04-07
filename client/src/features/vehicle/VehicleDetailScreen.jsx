import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import api from "../../services/apiClient";

const InfoRow = ({ icon, label, value, theme }) => (
  <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
    <View
      style={[
        styles.infoIconWrap,
        { backgroundColor: theme.colors.primary + "15" },
      ]}
    >
      <Ionicons name={icon} size={15} color={theme.colors.primary} />
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>
        {value || "—"}
      </Text>
    </View>
  </View>
);

export default function VehicleDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const res = await api.get(`/auth/vehicles/${id}`);
      setVehicle(res.data?.data);
    } catch (err) {
      console.log("Vehicle detail error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        edges={["top"]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        edges={["top"]}
      >
        <View style={styles.centered}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Vehicle not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          Vehicle Details
        </Text>
        <View style={{ minWidth: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.primary + "12",
              borderColor: theme.colors.primary + "25",
            },
          ]}
        >
          <View
            style={[
              styles.heroIconWrap,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
          >
            <Ionicons
              name="car-sport-outline"
              size={48}
              color={theme.colors.primary}
            />
          </View>
          <Text style={[styles.heroName, { color: theme.colors.text }]}>
            {vehicle.brand?.name} {vehicle.model?.name}
          </Text>
          <Text style={[styles.heroYear, { color: theme.colors.textSecondary }]}>
            {vehicle.modelYear?.year || "—"} · {vehicle.vehicleType?.name || "—"}
          </Text>
          {vehicle.registration && (
            <View
              style={[
                styles.regBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.regBadgeText}>{vehicle.registration}</Text>
            </View>
          )}
        </View>

        {/* Specs Section */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color={theme.colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              SPECIFICATIONS
            </Text>
          </View>
          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.colors.card || theme.colors.surface || "#fff",
                borderColor: theme.colors.border,
              },
            ]}
          >
            <InfoRow
              icon="car-outline"
              label="Vehicle Type"
              value={vehicle.vehicleType?.name}
              theme={theme}
            />
            <InfoRow
              icon="car-sport-outline"
              label="Brand"
              value={vehicle.brand?.name}
              theme={theme}
            />
            <InfoRow
              icon="construct-outline"
              label="Model"
              value={vehicle.model?.name}
              theme={theme}
            />
            <InfoRow
              icon="calendar-outline"
              label="Model Year"
              value={vehicle.modelYear?.year?.toString()}
              theme={theme}
            />
            <InfoRow
              icon="flame-outline"
              label="Fuel Type"
              value={vehicle.fuelType}
              theme={theme}
            />
            <InfoRow
              icon="card-outline"
              label="Registration"
              value={vehicle.registration}
              theme={theme}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="flash-outline"
              size={15}
              color={theme.colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              QUICK ACTIONS
            </Text>
          </View>
          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.colors.card || theme.colors.surface || "#fff",
                borderColor: theme.colors.border,
              },
            ]}
          >
            {[
              {
                icon: "time-outline",
                title: "Service History",
                path: "/service-history",
              },
              {
                icon: "calendar-outline",
                title: "Book Appointment",
                path: "/appointments",
              },
            ].map((action, index, arr) => (
              <TouchableOpacity
                key={action.title}
                style={[
                  styles.actionRow,
                  index < arr.length - 1 && {
                    borderBottomWidth: 0.5,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
                onPress={() => router.push(action.path)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: theme.colors.primary + "15" },
                  ]}
                >
                  <Ionicons
                    name={action.icon}
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
                <Text
                  style={[styles.actionTitle, { color: theme.colors.text }]}
                >
                  {action.title}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  backBtn: { flexDirection: "row", alignItems: "center", minWidth: 60 },
  backLabel: { fontSize: 16, marginLeft: 2 },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  errorText: { fontSize: 16, fontWeight: "600" },

  scroll: { padding: 16, paddingBottom: 48 },

  heroCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  heroIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroName: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  heroYear: { fontSize: 14 },
  regBadge: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  regBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },

  sectionWrap: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  card: { borderRadius: 14, borderWidth: 0.5, overflow: "hidden" },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: "500", marginBottom: 1 },
  infoValue: { fontSize: 14, fontWeight: "600" },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { flex: 1, fontSize: 15, fontWeight: "500" },
});