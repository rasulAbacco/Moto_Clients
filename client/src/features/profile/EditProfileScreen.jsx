// app/edit-profile.jsx
import { useContext, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../providers/AuthProvider";
import { useTheme } from "../../hooks/useTheme";

// ─────────────────────────────────────────────────────────
// ✅ Moved OUTSIDE the screen component so they are never
//    recreated on re-render → cursor / focus stays in place
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
    </View>
    <TextInput
      style={[
        styles.input,
        {
          color: editable ? theme.colors.text : theme.colors.textSecondary,
          borderColor: theme.colors.border,
          backgroundColor: editable
            ? theme.colors.inputBackground || theme.colors.surface || "#f5f5f5"
            : theme.colors.border + "40",
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
  const { user, updateProfile } = useContext(AuthContext);
  const { theme } = useTheme();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Personal
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [dob, setDob] = useState(user?.dob || "");

  // Address
  const [street, setStreet] = useState(user?.address?.street || "");
  const [city, setCity] = useState(user?.address?.city || "");
  const [state, setState] = useState(user?.address?.state || "");
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || "");
  const [country, setCountry] = useState(user?.address?.country || "");

  // Registration
  const [registrationNumber, setRegistrationNumber] = useState(
    user?.registrationNumber || "",
  );
  const [company, setCompany] = useState(user?.company || "");
  const [taxNumber, setTaxNumber] = useState(user?.taxNumber || "");

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name,
        email,
        dob,
        address: { street, city, state, postalCode, country },
        registrationNumber,
        company,
        taxNumber,
      });
      router.back();
    } catch (err) {
      Alert.alert(
        "Save Failed",
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
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
            <Text style={[styles.backLabel, { color: theme.colors.primary }]}>
              Back
            </Text>
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
            <Text style={[styles.saveLabel, { color: theme.colors.primary }]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Personal Info */}
          <SectionCard
            title="Personal Info"
            icon="person-outline"
            theme={theme}
          >
            <Field
              label="Full Name"
              value={name}
              onChangeText={setName}
              icon="person-outline"
              theme={theme}
            />
            <Field
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="mail-outline"
              theme={theme}
            />
            <Field
              label="Phone Number"
              value={user?.phone || ""}
              onChangeText={() => {}}
              keyboardType="phone-pad"
              icon="call-outline"
              editable={false}
              theme={theme}
            />
            <Field
              label="Date of Birth"
              value={dob}
              onChangeText={setDob}
              placeholder="DD/MM/YYYY"
              icon="calendar-outline"
              theme={theme}
            />
          </SectionCard>

          {/* Address */}
          <SectionCard title="Address" icon="location-outline" theme={theme}>
            <Field
              label="Street Address"
              value={street}
              onChangeText={setStreet}
              multiline
              icon="home-outline"
              theme={theme}
            />
            <Field
              label="City"
              value={city}
              onChangeText={setCity}
              icon="business-outline"
              theme={theme}
            />
            <Field
              label="State / Province"
              value={state}
              onChangeText={setState}
              icon="map-outline"
              theme={theme}
            />
            <Field
              label="Postal Code"
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="numeric"
              icon="mail-outline"
              theme={theme}
            />
            <Field
              label="Country"
              value={country}
              onChangeText={setCountry}
              icon="flag-outline"
              theme={theme}
            />
          </SectionCard>

          {/* Registration */}
          <SectionCard
            title="Registration"
            icon="document-text-outline"
            theme={theme}
          >
            <Field
              label="Registration Number"
              value={registrationNumber}
              onChangeText={setRegistrationNumber}
              placeholder="e.g. AB-1234-CD"
              icon="card-outline"
              theme={theme}
            />
            <Field
              label="Company / Organisation"
              value={company}
              onChangeText={setCompany}
              icon="business-outline"
              theme={theme}
            />
            <Field
              label="Tax / VAT Number"
              value={taxNumber}
              onChangeText={setTaxNumber}
              icon="barcode-outline"
              theme={theme}
            />
          </SectionCard>

          {/* Save button at bottom */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: theme.colors.primary },
              saving && { opacity: 0.7 },
            ]}
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
  saveLabel: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 60,
    textAlign: "right",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    paddingTop: 8,
  },
  sectionWrap: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: "hidden",
    paddingHorizontal: 14,
  },
  fieldWrap: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  fieldLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
  },
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
