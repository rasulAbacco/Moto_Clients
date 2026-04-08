import { KeyboardAvoidingView, Platform } from "react-native";

export default function KeyboardWrapper({ children }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
