// app/_layout.jsx

import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import Toast from "react-native-toast-message";

import { AuthProvider, useAuth } from "../src/providers/AuthProvider";
import { ThemeProvider } from "../src/providers/ThemeProvider";
import { QueryProvider } from "../src/providers/QueryProvider";
import { CartProvider } from "../src/providers/CartProvider";
import { LoginSheetProvider } from "../src/providers/LoginSheetProvider";
import { getSelectedVehicle } from "../src/features/vehicle/vehicle.service";
import ChatWidget from "../src/components/chat/ChatWidget";

// ─── Custom Toast Config ──────────────────────────────────────────────────────
const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={toastStyles.wrap}>
      <View style={[toastStyles.iconWrap, { backgroundColor: "#22c55e20" }]}>
        <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
      </View>
      <View style={toastStyles.textWrap}>
        {text1 ? <Text style={toastStyles.title}>{text1}</Text> : null}
        {text2 ? <Text style={toastStyles.subtitle}>{text2}</Text> : null}
      </View>
    </View>
  ),

  error: ({ text1, text2 }) => (
    <View style={toastStyles.wrap}>
      <View style={[toastStyles.iconWrap, { backgroundColor: "#ef444420" }]}>
        <Ionicons name="close-circle" size={20} color="#ef4444" />
      </View>
      <View style={toastStyles.textWrap}>
        {text1 ? <Text style={toastStyles.title}>{text1}</Text> : null}
        {text2 ? <Text style={toastStyles.subtitle}>{text2}</Text> : null}
      </View>
    </View>
  ),

  info: ({ text1, text2 }) => (
    <View style={toastStyles.wrap}>
      <View style={[toastStyles.iconWrap, { backgroundColor: "#3b82f620" }]}>
        <Ionicons name="information-circle" size={20} color="#3b82f6" />
      </View>
      <View style={toastStyles.textWrap}>
        {text1 ? <Text style={toastStyles.title}>{text1}</Text> : null}
        {text2 ? <Text style={toastStyles.subtitle}>{text2}</Text> : null}
      </View>
    </View>
  ),
};

const toastStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 20,
    minWidth: 260,
    maxWidth: 340,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: "#ffffff99",
    fontSize: 12,
    marginTop: 1,
    lineHeight: 16,
  },
});

// ─── Auth + Vehicle Guard ─────────────────────────────────────────────────────
function AppGuard({ children }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait until AuthProvider finishes reading the token from SecureStore
    if (authLoading) return;

    const checkAccess = async () => {
      const inVehicleFlow = segments[0] === "vehicle";

      if (user && !inVehicleFlow) {
        try {
          const vehicle = await getSelectedVehicle();
          if (!vehicle) {
            router.replace("/vehicle/brand");
            return; // Don't set isReady — navigation in progress
          }
        } catch (e) {
          console.warn("Vehicle check failed:", e.message);
          // Non-fatal: let user through
        }
      }

      setIsReady(true);
    };

    checkAccess();
  }, [user, authLoading, segments]);

  // Block render until auth restore + vehicle check completes.
  // Prevents the login screen flash on cold start with a valid token.
  if (!isReady) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return <>{children}</>;
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              <CartProvider>
                <LoginSheetProvider>
                  <AppGuard>
                    <Stack screenOptions={{ headerShown: false }} />
                    <ChatWidget />
                  </AppGuard>
                </LoginSheetProvider>
              </CartProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>

      {/* Toast OUTSIDE SafeAreaProvider so it floats above modals */}
      <Toast
        config={toastConfig}
        position="top"
        topOffset={60}
        visibilityTime={3000}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
