import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import api from "../../services/apiClient.js";

// Segment badge color map
const SEGMENT_COLOR = {
  HATCHBACK:    { bg: "#e0f2fe", text: "#0369a1" },
  SEDAN:        { bg: "#f0fdf4", text: "#15803d" },
  SUV:          { bg: "#fef9c3", text: "#a16207" },
  LUXURY:       { bg: "#f3e8ff", text: "#7e22ce" },
  SUPER_LUXURY: { bg: "#fce7f3", text: "#be185d" },
  PICKUP:       { bg: "#ffedd5", text: "#c2410c" },
  VAN:          { bg: "#f1f5f9", text: "#475569" },
};

const SegmentBadge = ({ segment }) => {
  if (!segment) return null;
  const colors = SEGMENT_COLOR[segment] || { bg: "#f1f5f9", text: "#475569" };
  const label = segment.replace("_", " ");
  return (
    <View style={[styles.segmentBadge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.segmentText, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

export default function VehiclesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Primary setting state
  const [settingPrimary, setSettingPrimary] = useState(null); // vehicle id

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

  const handleSetPrimary = async (vehicleId) => {
    setSettingPrimary(vehicleId);
    try {
      await api.patch(`/auth/vehicles/${vehicleId}/primary`);
      // Update local state — unset all, set this one
      setVehicles((prev) =>
        prev.map((v) => ({ ...v, isPrimary: v.id === vehicleId }))
      );
    } catch (err) {
      console.log("Set primary error:", err.response?.data || err.message);
    } finally {
      setSettingPrimary(null);
    }
  };

  const confirmDelete = (vehicle) => {
    setDeleteTarget({
      id: vehicle.id,
      name: `${vehicle.brand?.name || ""} ${vehicle.model?.name || ""}`.trim(),
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/auth/vehicles/${deleteTarget.id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.log("Delete error:", err.response?.data || err.message);
    } finally {
      setDeleting(false);
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
          {vehicles.map((vehicle) => (
            <View
              key={vehicle.id}
              style={[
                styles.vehicleCard,
                {
                  backgroundColor: theme.colors.card || theme.colors.surface || "#fff",
                  borderColor: vehicle.isPrimary
                    ? theme.colors.primary
                    : theme.colors.border,
                  borderWidth: vehicle.isPrimary ? 1.5 : 0.5,
                },
              ]}
            >
              {/* Primary Badge */}
              {vehicle.isPrimary && (
                <View style={[styles.primaryBanner, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="star" size={11} color="#fff" />
                  <Text style={styles.primaryBannerText}>Primary Vehicle</Text>
                </View>
              )}

              {/* Vehicle Hero */}
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
                  <Ionicons name="car-sport-outline" size={36} color={theme.colors.primary} />
                </View>
                <View style={styles.heroText}>
                  <View style={styles.heroNameRow}>
                    <Text style={[styles.heroName, { color: theme.colors.text }]}>
                      {vehicle.brand?.name || "—"} {vehicle.model?.name || "—"}
                    </Text>
                  </View>
                  <Text style={[styles.heroSub, { color: theme.colors.textSecondary }]}>
                    {vehicle.vehicleType?.name || "—"} · {vehicle.modelYear?.year || "—"}
                  </Text>
                  {/* Segment Badge */}
                  <SegmentBadge segment={vehicle.model?.segment} />
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
                <InfoRow
                  icon="albums-outline"
                  label="Segment"
                  value={vehicle.model?.segment?.replace("_", " ") || "—"}
                />
                <InfoRow
                  icon="calendar-outline"
                  label="Model Year"
                  value={vehicle.modelYear?.year?.toString()}
                />
                <InfoRow icon="flame-outline" label="Fuel Type" value={vehicle.fuelType} />
                <InfoRow icon="card-outline" label="Registration" value={vehicle.registration} />
              </View>

              {/* Actions Row */}
              <View style={[styles.actionsRow, { borderTopColor: theme.colors.border }]}>
                {/* Set as Primary */}
                {!vehicle.isPrimary && (
                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      { borderColor: theme.colors.primary, flex: 1 },
                    ]}
                    onPress={() => handleSetPrimary(vehicle.id)}
                    disabled={settingPrimary === vehicle.id}
                    activeOpacity={0.7}
                  >
                    {settingPrimary === vehicle.id ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="star-outline" size={15} color={theme.colors.primary} />
                        <Text style={[styles.primaryBtnText, { color: theme.colors.primary }]}>
                          Set as Primary
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {vehicle.isPrimary && (
                  <View style={[styles.primaryActivePill, { flex: 1 }]}>
                    <Ionicons name="star" size={14} color={theme.colors.primary} />
                    <Text style={[styles.primaryActiveText, { color: theme.colors.primary }]}>
                      Primary
                    </Text>
                  </View>
                )}

                {/* Divider */}
                <View style={[styles.actionDivider, { backgroundColor: theme.colors.border }]} />

                {/* Delete */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmDelete(vehicle)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={15} color="#ef4444" />
                  <Text style={styles.deleteBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setDeleteTarget(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !deleting && setDeleteTarget(null)}
        >
          <Pressable style={[styles.modalSheet, { backgroundColor: theme.colors.card || theme.colors.surface || "#fff" }]}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="trash-outline" size={28} color="#ef4444" />
            </View>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Remove Vehicle?
            </Text>
            <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
              Are you sure you want to remove{"\n"}
              <Text style={{ fontWeight: "700", color: theme.colors.text }}>
                {deleteTarget?.name}
              </Text>
              {" "}from your account? This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.background },
                ]}
                onPress={() => setDeleteTarget(null)}
                disabled={deleting}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteBtn, deleting && { opacity: 0.6 }]}
                onPress={handleDelete}
                disabled={deleting}
                activeOpacity={0.8}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={styles.modalDeleteText}>Remove</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  scroll: { padding: 16, paddingBottom: 48, gap: 16 },

  vehicleCard: { borderRadius: 16, overflow: "hidden" },

  // Primary banner strip at top of card
  primaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  primaryBannerText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroText: { flex: 1, gap: 4 },
  heroNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroName: { fontSize: 15, fontWeight: "700" },
  heroSub: { fontSize: 12 },

  // Segment badge
  segmentBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  segmentText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase" },

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

  // Bottom actions row
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 0.5,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderWidth: 0,
  },
  primaryBtnText: { fontSize: 13, fontWeight: "600" },
  primaryActivePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 13,
  },
  primaryActiveText: { fontSize: 13, fontWeight: "600" },
  actionDivider: { width: 0.5, height: 36 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  deleteBtnText: { fontSize: 13, fontWeight: "600", color: "#ef4444" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    alignItems: "center",
    gap: 12,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#ef444415",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  modalSub: { fontSize: 14, lineHeight: 22, textAlign: "center", paddingHorizontal: 8 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8, width: "100%" },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "600" },
  modalDeleteBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  modalDeleteText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});