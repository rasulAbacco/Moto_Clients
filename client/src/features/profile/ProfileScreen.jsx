// app/(tabs)/profile.jsx  (or wherever your ProfileScreen lives in app/)
import { useContext, useEffect,useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../providers/AuthProvider";
import { useTheme } from "../../hooks/useTheme";
import AppButton from "../../components/ui/AppButton";
import { useLoginSheet } from "../../providers/LoginSheetProvider";
import api from "../../services/apiClient";
import { Buffer } from "buffer";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const { user, loading, fetchProfile, logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const router = useRouter();
  const { openLoginSheet } = useLoginSheet();
  const [imageUrl, setImageUrl] = useState(null);

  // ─── Auth Guard ───────────────────────────────────────
 useEffect(() => {
   if (!loading && !user) {
     openLoginSheet();
   }
 }, [loading, user]);

  // Refresh profile every time this screen mounts
  useEffect(() => {
    if (user) fetchProfile();
  }, []);
  useEffect(() => {
  const loadImage = async () => {
    try {
      const res = await api.get("/auth/profile-image", {
        responseType: "arraybuffer",
      });

      const base64 = `data:image/jpeg;base64,${Buffer.from(res.data).toString("base64")}`;
      setImageUrl(base64);
    } catch (err) {
      setImageUrl(null);
    }
  };

  if (user) loadImage();
}, [user]);

  // ─── Loading / unauthenticated state ─────────────────
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Sub-components ───────────────────────────────────
  const InfoRow = ({ icon, label, value }) => (
    <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
      <View
        style={[
          styles.infoIconWrap,
          { backgroundColor: theme.colors.primary + "15" },
        ]}
      >
        <Ionicons name={icon} size={16} color={theme.colors.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
        <Text
          style={[styles.infoValue, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {value || "—"}
        </Text>
      </View>
    </View>
  );

  const SectionCard = ({ title, icon, children }) => (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name={icon}
          size={16}
          color={theme.colors.primary}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
        >
          {title.toUpperCase()}
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
        {children}
      </View>
    </View>
  );
const primaryVehicle = user?.vehicles?.[0] || null;
  // ─── Render ───────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
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
          Profile
        </Text>

        {/* ✅ Fixed: navigate to /edit-profile which maps to app/edit-profile.jsx */}
        <TouchableOpacity
          onPress={() => router.push("/edit-profile")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.editLabel, { color: theme.colors.primary }]}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Avatar / Hero */}
        <View style={styles.avatarSection}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 50,
            }}
          />
        ) : (
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
          >
            <Text style={[styles.avatarInitials, { color: theme.colors.primary }]}>
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "??"}
            </Text>
          </View>
        )}
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.name || "—"}
          </Text>
          <Text
            style={[styles.userEmail, { color: theme.colors.textSecondary }]}
          >
            {user?.email || user?.phone || "—"}
          </Text>
        </View>

        {/* Personal Info */}
        <SectionCard title="Personal Info" icon="person-outline">
          <InfoRow icon="person-outline" label="Full Name" value={user?.name} />
          <InfoRow
            icon="mail-outline"
            label="Email Address"
            value={user?.email}
          />
          <InfoRow
            icon="call-outline"
            label="Phone Number"
            value={user?.phone}
          />
          <InfoRow
            icon="calendar-outline"
            label="Date of Birth"
            value={user?.dob}
          />
        </SectionCard>

        {/* Address */}
        <SectionCard title="Address" icon="location-outline">
          <InfoRow
            icon="home-outline"
            label="Street Address"
            value={user?.address?.street}
          />
          <InfoRow
            icon="business-outline"
            label="City"
            value={user?.address?.city}
          />
          <InfoRow
            icon="map-outline"
            label="State / Province"
            value={user?.address?.state}
          />
          <InfoRow
            icon="earth-outline"
            label="Postal Code"
            value={user?.address?.postalCode}
          />
          <InfoRow
            icon="flag-outline"
            label="Country"
            value={user?.address?.country}
          />
        </SectionCard>

        {/* Registration Info */}
        <SectionCard title="Registration" icon="document-text-outline">
          <InfoRow
            icon="card-outline"
            label="Registration Number"
            value={primaryVehicle?.registration || user?.registrationNumber}
          />

          <InfoRow
            icon="car-outline"
            label="Vehicle Type"
            value={primaryVehicle?.vehicleType?.name || "—"}
          />

          <InfoRow
            icon="car-sport-outline"
            label="Brand"
            value={primaryVehicle?.brand?.name || "—"}
          />

          <InfoRow
            icon="construct-outline"
            label="Model"
            value={primaryVehicle?.model?.name || "—"}
          />

          <InfoRow
            icon="calendar-outline"
            label="Model Year"
            value={primaryVehicle?.modelYear?.year || "—"}
          />
        </SectionCard>

        {/* Vehicles */}
{/* Vehicles */}
      <View style={styles.sectionWrap}>
        <TouchableOpacity
          style={styles.sectionHeader}
        onPress={() => router.push("/vehicles")}
          activeOpacity={0.7}
        >
          <Ionicons name="car-outline" size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            REGISTERED VEHICLES
          </Text>
          <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <View style={[styles.card, { backgroundColor: theme.colors.card || theme.colors.surface || "#fff", borderColor: theme.colors.border }]}>
          {user?.vehicles && user.vehicles.length > 0 ? (
            user.vehicles.map((v, index) => (
              <TouchableOpacity
                key={v.id}
                onPress={() => router.push("/vehicles")}
                activeOpacity={0.7}
                style={[styles.vehicleRow, index < user.vehicles.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.colors.border }]}
              >
                <View style={[styles.vehicleIcon, { backgroundColor: theme.colors.primary + "15" }]}>
                  <Ionicons name="car-sport-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={[styles.vehicleName, { color: theme.colors.text }]}>
                    {v.brand?.name || ""} {v.model?.name || ""}
                  </Text>
                  <Text style={[styles.vehicleReg, { color: theme.colors.textSecondary }]}>
                    {v.registration}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyVehicle}>
              <Ionicons name="car-outline" size={32} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No vehicles registered yet
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/vehicle/type")}
                style={[styles.addVehicleBtn, { borderColor: theme.colors.primary }]}
              >
                <Text style={[styles.addVehicleBtnText, { color: theme.colors.primary }]}>
                  + Add Vehicle
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

        {/* Logout */}
        <View style={styles.logoutWrap}>
          <AppButton title="Logout" onPress={logout} />
        </View>

        <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
          App Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  editLabel: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 60,
    textAlign: "right",
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },

  // Avatar
  avatarSection: { alignItems: "center", paddingVertical: 28 },
  avatarCircle: {
    width: width * 0.22,
    height: width * 0.22,
    maxWidth: 90,
    maxHeight: 90,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarInitials: { fontSize: 28, fontWeight: "800" },
  userName: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  userEmail: { fontSize: 14 },

  // Sections
  sectionWrap: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  card: { borderRadius: 14, borderWidth: 0.5 },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 1,
    letterSpacing: 0.2,
  },
  infoValue: { fontSize: 14, fontWeight: "500" },

  // Vehicles
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  vehicleReg: { fontSize: 12 },
  emptyVehicle: { alignItems: "center", paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 13 },
  addVehicleBtn: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  addVehicleBtnText: { fontSize: 13, fontWeight: "600" },

  // Footer
  logoutWrap: { marginTop: 8, marginBottom: 16 },
  version: { fontSize: 12, textAlign: "center", marginBottom: 8 },
});
