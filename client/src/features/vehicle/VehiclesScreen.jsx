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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import api from "../../services/apiClient.js";

export default function VehiclesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/auth/vehicles");
      setVehicles(res.data?.data || []);
    } catch (err) {
      console.log("Vehicles fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
      <View style={[styles.infoIconWrap, { backgroundColor: theme.colors.primary + "15" }]}>
        <Ionicons name={icon} size={14} color={theme.colors.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value || "—"}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
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
            <Text style={[styles.backLabel, { color: theme.colors.primary }]}>Back</Text>
          )}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Vehicles</Text>
        <TouchableOpacity
          onPress={() => router.push("/vehicle/type")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : vehicles.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="car-outline" size={52} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No vehicles yet</Text>
          <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
            Add your first vehicle to get started
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push("/vehicle/type")}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {vehicles.map((vehicle, index) => (
            <View
              key={vehicle.id}
              style={[styles.vehicleCard, { backgroundColor: theme.colors.card || theme.colors.surface || "#fff", borderColor: theme.colors.border }]}
            >
              {/* Vehicle Hero */}
              <View style={[styles.heroCard, { backgroundColor: theme.colors.primary + "12", borderColor: theme.colors.primary + "25" }]}>
                <View style={[styles.heroIconWrap, { backgroundColor: theme.colors.primary + "20" }]}>
                  <Ionicons name="car-sport-outline" size={36} color={theme.colors.primary} />
                </View>
                <View style={styles.heroText}>
                  <Text style={[styles.heroName, { color: theme.colors.text }]}>
                    {vehicle.brand?.name || "—"} {vehicle.model?.name || "—"}
                  </Text>
                  <Text style={[styles.heroSub, { color: theme.colors.textSecondary }]}>
                    {vehicle.vehicleType?.name || "—"} · {vehicle.modelYear?.year || "—"}
                  </Text>
                </View>
                {vehicle.registration && (
                  <View style={[styles.regBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.regBadgeText}>{vehicle.registration}</Text>
                  </View>
                )}
              </View>

              {/* Specs */}
              <View style={styles.specsWrap}>
                <InfoRow icon="car-outline" label="Vehicle Type" value={vehicle.vehicleType?.name} />
                <InfoRow icon="car-sport-outline" label="Brand" value={vehicle.brand?.name} />
                <InfoRow icon="construct-outline" label="Model" value={vehicle.model?.name} />
                <InfoRow icon="calendar-outline" label="Model Year" value={vehicle.modelYear?.year?.toString()} />
                <InfoRow icon="flame-outline" label="Fuel Type" value={vehicle.fuelType} />
                <InfoRow icon="card-outline" label="Registration" value={vehicle.registration} />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14 },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  scroll: { padding: 16, paddingBottom: 48, gap: 16 },
  vehicleCard: { borderRadius: 16, borderWidth: 0.5, overflow: "hidden" },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  heroIconWrap: { width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  heroText: { flex: 1 },
  heroName: { fontSize: 15, fontWeight: "700" },
  heroSub: { fontSize: 12, marginTop: 2 },
  regBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  regBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  specsWrap: {},
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    gap: 10,
  },
  infoIconWrap: { width: 28, height: 28, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: "500", marginBottom: 1 },
  infoValue: { fontSize: 13, fontWeight: "600" },
});