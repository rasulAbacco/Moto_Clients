// app/edit-profile.jsx
import { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../../providers/AuthProvider";
import { useTheme } from "../../hooks/useTheme";
import api from "../../services/apiClient.js";

// ─────────────────────────────────────────────────────────
// Field — defined OUTSIDE component so it never remounts
// ─────────────────────────────────────────────────────────
const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  icon,
  multiline = false,
  editable = true,
  theme,
}) => (
  <View style={[styles.fieldWrap, { borderBottomColor: theme.colors.border }]}>
    <View style={styles.fieldLabelRow}>
      {icon && (
        <Ionicons
          name={icon}
          size={13}
          color={theme.colors.textSecondary}
          style={{ marginRight: 5 }}
        />
      )}
      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      {/* Lock badge for read-only fields */}
      {!editable && (
        <Ionicons
          name="lock-closed-outline"
          size={11}
          color={theme.colors.textSecondary + "80"}
          style={{ marginLeft: 4 }}
        />
      )}
    </View>
    <TextInput
      style={[
        styles.input,
        {
          color: editable ? theme.colors.text : theme.colors.textSecondary,
          borderColor: editable ? theme.colors.border : "transparent",
          backgroundColor: editable
            ? theme.colors.inputBackground || theme.colors.surface || "#f5f5f5"
            : theme.colors.border + "30",
        },
        multiline && { height: 80, textAlignVertical: "top" },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      placeholderTextColor={theme.colors.textSecondary + "80"}
      keyboardType={keyboardType}
      multiline={multiline}
      autoCorrect={false}
      autoCapitalize="none"
      editable={editable}
    />
  </View>
);

const SectionCard = ({ title, icon, children, theme }) => (
  <View style={styles.sectionWrap}>
    <View style={styles.sectionHeader}>
      <Ionicons
        name={icon}
        size={15}
        color={theme.colors.primary}
        style={{ marginRight: 6 }}
      />
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        {title.toUpperCase()}
      </Text>
    </View>
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card || theme.colors.surface || "#fff",
          borderColor: theme.colors.border,
        },
      ]}
    >
      {children}
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────
export default function EditProfileScreen() {
  const { user, updateProfile, fetchProfile, updateVehicle } = useContext(AuthContext);
  const { theme } = useTheme();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);
  const [profileImage, setProfileImage] = useState(null);

  const vehicles = user?.vehicles || [];
  const selectedVehicle = vehicles[selectedVehicleIndex] || null;

  // ── Personal ──────────────────────────────────────────
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [dob, setDob] = useState(user?.dob || "");

  // ── Address ───────────────────────────────────────────
  const [street, setStreet] = useState(user?.address?.street || "");
  const [city, setCity] = useState(user?.address?.city || "");
  const [state, setState] = useState(user?.address?.state || "");
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || "");
  const [country, setCountry] = useState(user?.address?.country || "");

  // ── Vehicle (editable fields only) ───────────────────
  // These two the user can change:
  const [registrationNumber, setRegistrationNumber] = useState(
    selectedVehicle?.registration || ""
  );
  const [modelYear, setModelYear] = useState(
    selectedVehicle?.modelYear?.year?.toString() || ""
  );

  // ── Sync vehicle fields when switching between vehicles ──
  // Brand / Model / VehicleType come straight from the DB
  // (selected during the Brand → Model → Specs flow).
  // They are READ-ONLY here — we just display them.
  //
  // ✅ FIX: Prisma returns vehicle.brand.name  (direct relation)
  //         NOT  vehicle.model.brand.name  (that was the bug)
  useEffect(() => {
    if (!selectedVehicle) return;
    setRegistrationNumber(selectedVehicle.registration || "");
    setModelYear(selectedVehicle.modelYear?.year?.toString() || "");
  }, [selectedVehicleIndex, selectedVehicle]);

  // ── Derived display values (read-only, from DB) ──────
  const displayVehicleType = selectedVehicle?.vehicleType?.name || "—";
  const displayBrand       = selectedVehicle?.brand?.name  || "—";   // ✅ correct path
  const displayModel       = selectedVehicle?.model?.name  || "—";

  // ── Image picker ─────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!profileImage) return;
    const formData = new FormData();
    formData.append("image", { uri: profileImage, name: "profile.jpg", type: "image/jpeg" });
    try {
      await api.put("/auth/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.log("Upload error ❌", err);
    }
  };

  // ── Save ─────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update personal info + address
      await updateProfile({
        name,
        email,
        dob,
        address: { street, city, state, postalCode, country },
      });

      // 2. Update vehicle — only registration + modelYear are editable.
      //    Brand / model / vehicleType are already stored; we pass them
      //    so the backend can resolve relations, but they won't change.
      if (selectedVehicle?.id) {
        await updateVehicle(selectedVehicle.id, {
          registration: registrationNumber,
          vehicleType:  selectedVehicle?.vehicleType?.name,
          brandName:    selectedVehicle?.brand?.name,   // ✅ correct path
          modelName:    selectedVehicle?.model?.name,
          modelYear:    modelYear,
        });
      }

      // 3. Upload profile image if changed
      await uploadImage();

      // 4. Refresh and go back
      await fetchProfile();
      router.back();
    } catch (err) {
      Alert.alert("Save Failed", err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

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
            <Text style={[styles.backLabel, { color: theme.colors.primary }]}>Back</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Edit Profile
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={[styles.saveLabel, { color: theme.colors.primary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Image */}
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Text style={[styles.avatarInitials, { color: theme.colors.primary }]}>
                  {user?.name
                    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    : "??"}
                </Text>
              </View>
            )}
            <View style={[styles.camerabadge, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Personal Info */}
          <SectionCard title="Personal Info" icon="person-outline" theme={theme}>
            <Field label="Full Name" value={name} onChangeText={setName} icon="person-outline" theme={theme} />
            <Field label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" icon="mail-outline" theme={theme} />
            <Field label="Phone Number" value={user?.phone || ""} onChangeText={() => {}} keyboardType="phone-pad" icon="call-outline" editable={false} theme={theme} />
            <Field label="Date of Birth" value={dob} onChangeText={setDob} placeholder="DD/MM/YYYY" icon="calendar-outline" theme={theme} />
          </SectionCard>

          {/* Address */}
          <SectionCard title="Address" icon="location-outline" theme={theme}>
            <Field label="Street Address" value={street} onChangeText={setStreet} multiline icon="home-outline" theme={theme} />
            <Field label="City" value={city} onChangeText={setCity} icon="business-outline" theme={theme} />
            <Field label="State / Province" value={state} onChangeText={setState} icon="map-outline" theme={theme} />
            <Field label="Postal Code" value={postalCode} onChangeText={setPostalCode} keyboardType="numeric" icon="mail-outline" theme={theme} />
            <Field label="Country" value={country} onChangeText={setCountry} icon="flag-outline" theme={theme} />
          </SectionCard>

          {/* Vehicle tab switcher — only shown if user has multiple vehicles */}
          {vehicles.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
            >
              {vehicles.map((v, index) => (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => setSelectedVehicleIndex(index)}
                  style={[
                    styles.vehicleTab,
                    {
                      borderColor:
                        selectedVehicleIndex === index
                          ? theme.colors.primary
                          : theme.colors.border,
                      backgroundColor:
                        selectedVehicleIndex === index
                          ? theme.colors.primary + "12"
                          : "transparent",
                    },
                  ]}
                >
                  <Ionicons
                    name="car-sport-outline"
                    size={14}
                    color={
                      selectedVehicleIndex === index
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color:
                        selectedVehicleIndex === index
                          ? theme.colors.primary
                          : theme.colors.text,
                    }}
                  >
                    {/* ✅ correct path: v.brand.name, not v.model.brand.name */}
                    {v.brand?.name || ""} {v.model?.name || ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Registration / Vehicle Info */}
          <SectionCard title="Registration" icon="document-text-outline" theme={theme}>

            {/* READ-ONLY: pre-filled from DB selection, user cannot change these here */}
            <Field
              label="Vehicle Type"
              value={displayVehicleType}
              onChangeText={() => {}}
              icon="car-outline"
              editable={false}
              theme={theme}
            />
            <Field
              label="Brand"
              value={displayBrand}
              onChangeText={() => {}}
              icon="car-sport-outline"
              editable={false}
              theme={theme}
            />
            <Field
              label="Model"
              value={displayModel}
              onChangeText={() => {}}
              icon="construct-outline"
              editable={false}
              theme={theme}
            />

            {/* EDITABLE: user can update these */}
            <Field
              label="Model Year"
              value={modelYear}
              onChangeText={(v) => setModelYear(v.replace(/[^0-9]/g, "").slice(0, 4))}
              keyboardType="numeric"
              placeholder="e.g. 2023"
              icon="calendar-outline"
              theme={theme}
            />
            <Field
              label="Registration Number"
              value={registrationNumber}
              onChangeText={setRegistrationNumber}
              icon="card-outline"
              theme={theme}
            />
          </SectionCard>

          {/* Save button at bottom */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
  saveLabel: { fontSize: 15, fontWeight: "600", minWidth: 60, textAlign: "right" },

  scroll: { paddingHorizontal: 16, paddingBottom: 48, paddingTop: 8 },

  // Avatar
  avatarWrap: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontSize: 28, fontWeight: "800" },
  camerabage: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  camerabage: {}, // overridden below
  // (defining the real one properly:)
  camerabage: {
    position: "absolute",
    bottom: 2,
    right: "30%",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  // Sections
  sectionWrap: { marginBottom: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, marginLeft: 4 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  card: { borderRadius: 14, borderWidth: 0.5, overflow: "hidden", paddingHorizontal: 14 },

  // Fields
  fieldWrap: { paddingVertical: 12, borderBottomWidth: 0.5 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  fieldLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
  },

  // Vehicle tabs
  vehicleTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },

  // Save
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});