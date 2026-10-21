// app/_layout.jsx

import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { palette, shadow } from "../src/theme/palette";

import { AuthProvider, useAuth } from "../src/providers/AuthProvider";
import { VehicleProvider } from "../src/providers/VehicleProvider";
import { ThemeProvider } from "../src/providers/ThemeProvider";
import { QueryProvider } from "../src/providers/QueryProvider";
import { CartProvider } from "../src/providers/CartProvider";
import { LoginSheetProvider } from "../src/providers/LoginSheetProvider";
import { getSelectedVehicle } from "../src/features/vehicle/vehicle.service";
import ChatWidget from "../src/components/chat/ChatWidget";

// ─── Custom Toast Config ──────────────────────────────────────────────────────
// Light, classic toast: white card, thin coloured edge, muted status colour.
const ToastCard = ({ text1, text2, icon, color }) => (
  <View style={[toastStyles.wrap, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={22} color={color} />
    <View style={toastStyles.textWrap}>
      {text1 ? <Text style={toastStyles.title}>{text1}</Text> : null}
      {text2 ? <Text style={toastStyles.subtitle}>{text2}</Text> : null}
    </View>
  </View>
);

const toastConfig = {
  success: (p) => (
    <ToastCard {...p} icon="checkmark-circle" color={palette.green} />
  ),
  error: (p) => <ToastCard {...p} icon="alert-circle" color={palette.red} />,
  info: (p) => (
    <ToastCard {...p} icon="information-circle" color={palette.navy800} />
  ),
};

const toastStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    gap: 12,
    width: "92%",
    maxWidth: 420,
    ...shadow.raised,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    color: palette.slate500,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
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
        <ActivityIndicator size="large" color={palette.navy800} />
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
            <VehicleProvider>
              <QueryProvider>
                <CartProvider>
                  <LoginSheetProvider>
                    <AppGuard>
                      <StatusBar style="dark" />
                      <Stack
                        screenOptions={{
                          headerShown: false,
                          // iOS: native edge swipe-back from anywhere on the screen
                          gestureEnabled: true,
                          fullScreenGestureEnabled: true,
                          // Android: standard right-to-left push; iOS keeps native push
                          animation:
                            Platform.OS === "android"
                              ? "slide_from_right"
                              : "default",
                          contentStyle: { backgroundColor: palette.slate50 },
                        }}
                      >
                        {/* Root screens: no swipe-back into the splash/auth redirect */}
                        <Stack.Screen
                          name="index"
                          options={{ gestureEnabled: false }}
                        />
                        <Stack.Screen
                          name="(tabs)"
                          options={{ gestureEnabled: false }}
                        />
                      </Stack>
                      <ChatWidget />
                    </AppGuard>
                  </LoginSheetProvider>
                </CartProvider>
              </QueryProvider>
            </VehicleProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>

      {/* Toast OUTSIDE SafeAreaProvider so it floats above modals */}
      <Toast
        config={toastConfig}
        position="top"
        topOffset={Platform.OS === "ios" ? 60 : 40}
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
    backgroundColor: palette.slate50,
  },
});
