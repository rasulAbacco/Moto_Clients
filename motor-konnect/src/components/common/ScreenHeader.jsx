// src/components/common/ScreenHeader.jsx
//
// One header for every stack screen, on both platforms:
//  • Sits below the notch / Dynamic Island / Android status bar (safe-area aware)
//  • iOS: "‹ chevron" + centred title, like native UINavigationBar
//  • Android: "← arrow" + left-aligned title, like Material top app bar
//  • 44×44 touch target (Apple HIG) / 48dp ripple (Material)
//  • If there is no screen to go back to (deep link, cold start, replace()),
//    it falls back to the Home tab instead of doing nothing.

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { safeBack } from "../../utils/navigation";

const IS_IOS = Platform.OS === "ios";

export function useGoBack(fallback = "/(tabs)/home") {
  const router = useRouter();
  return () => safeBack(router, fallback);
}

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  right = null,
  transparent = false,
  safeArea = true,
  border = true,
  style,
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const goBack = useGoBack();
  const c = theme.colors;

  const handleBack = onBack || goBack;
  const topPad = safeArea ? insets.top : 0;

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: topPad,
          backgroundColor: transparent ? "transparent" : c.surface,
          borderBottomColor: border && !transparent ? c.border : "transparent",
        },
        style,
      ]}
    >
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      <View style={styles.bar}>
        <View
          style={[styles.side, !showBack && !IS_IOS && styles.sideCollapsed]}
        >
          {showBack && (
            <Pressable
              onPress={handleBack}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              android_ripple={{ color: c.border, borderless: true, radius: 22 }}
              style={({ pressed }) => [
                styles.backBtn,
                transparent && {
                  backgroundColor: c.surface,
                  ...theme.shadow.card,
                },
                IS_IOS && pressed && { opacity: 0.5 },
              ]}
            >
              <Ionicons
                name={IS_IOS ? "chevron-back" : "arrow-back"}
                size={IS_IOS ? 26 : 22}
                color={c.text}
              />
            </Pressable>
          )}
        </View>

        <View
          style={[
            styles.titleWrap,
            IS_IOS ? styles.titleCenter : styles.titleLeft,
          ]}
        >
          {!!title && (
            <Text numberOfLines={1} style={[styles.title, { color: c.text }]}>
              {title}
            </Text>
          )}
          {!!subtitle && (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: c.textSecondary }]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  bar: {
    height: IS_IOS ? 48 : 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  side: {
    minWidth: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideCollapsed: {
    minWidth: 12,
  },
  sideRight: {
    alignItems: "flex-end",
    paddingRight: 6,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    justifyContent: "center",
  },
  titleCenter: { alignItems: "center" },
  titleLeft: { alignItems: "flex-start", paddingLeft: 4 },
  title: {
    fontSize: IS_IOS ? 17 : 19,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
});
