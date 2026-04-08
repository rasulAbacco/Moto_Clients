import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../hooks/useTheme";
import { useState } from "react";
import { sendSupportMessage } from "../api/supportApi";

export default function SupportScreen() {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter your issue");
      return;
    }

    try {
      setLoading(true);
      await sendSupportMessage(message);
      Alert.alert("Success", "Message sent!");
      setMessage("");
    } catch (err) {
      Alert.alert("Error", "Failed to send");
    } finally {
      setLoading(false);
    }
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
        {/* HEADER */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Contact Support
        </Text>

        {/* INPUT */}
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Enter your issue..."
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

        {/* BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[
            styles.button,
            {
              backgroundColor: loading
                ? theme.colors.border
                : theme.colors.primary,
            },
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10, // 👈 small spacing (important)
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
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