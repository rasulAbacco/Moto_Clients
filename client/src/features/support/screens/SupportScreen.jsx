import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useState } from "react";
import { useRouter } from "expo-router"; // ✅ added

export default function SupportScreen() {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // ✅ added

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter your issue");
      return;
    }

    const email = "support@motorkonnect.com";
    const subject = "Support Request";
    const body = message;

    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open mail app");
    });
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@motorkonnect.com").catch(() => {});
  };

  const handleMap = () => {
    const address =
      "No 12, 13 & 12/A, Kirthan Arcade, Aditya Nagar, Bangalore 560097";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER WITH BACK BUTTON */}
      {/* HEADER (same as Privacy) */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons
                  name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>

              <Text style={[styles.title, { color: theme.colors.text }]}>
                Contact Us
              </Text>

              <View style={{ width: 40 }} />
            </View>

        {/* CONTACT CARD */}
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
          <View style={styles.row}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.infoText, { color: theme.colors.text }]}
              onPress={handleEmail}
            >
              support@motorkonnect.com
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.infoText,
                { color: theme.colors.textSecondary },
              ]}
            >
              No 12, 13 & 12/A, Kirthan Arcade, 3rd Floor, Aditya Nagar,
              Sandeep Unnikrishnan Road, Bangalore - 560097
            </Text>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleEmail}
            >
              <Ionicons name="mail" size={14} color="#fff" />
              <Text style={styles.primaryText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.outlineBtn,
                { borderColor: theme.colors.primary },
              ]}
              onPress={handleMap}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.outlineText,
                  { color: theme.colors.primary },
                ]}
              >
                View Map
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MESSAGE INPUT */}
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your issue..."
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.input,
            {
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          multiline
        />

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.buttonText}>Send Message</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // ✅ NEW STYLE (added only)
header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 0.5,
},

backBtn: {
  width: 40,
},

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 18,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  primaryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  outlineText: {
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    height: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});