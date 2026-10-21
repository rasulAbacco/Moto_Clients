// app/(tabs)/_layout.jsx
//
// Classic docked tab bar. React Navigation sizes it from the safe area, so it
// sits correctly above the iPhone home indicator and Android's gesture /
// 3-button navigation bar (Expo 54 is edge-to-edge on Android).
import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";
import { useCart } from "../../src/hooks/useCart";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  { name: "home", title: "Home", icon: "home-outline", iconActive: "home" },
  {
    name: "gostore",
    title: "Store",
    icon: "bag-handle-outline",
    iconActive: "bag-handle",
    hasCart: true,
  },
  {
    name: "sos",
    title: "SOS",
    icon: "warning-outline",
    iconActive: "warning",
    isSOS: true,
  },
  {
    name: "help",
    title: "Support",
    icon: "chatbubble-ellipses-outline",
    iconActive: "chatbubble-ellipses",
  },
  {
    name: "account",
    title: "Account",
    icon: "person-circle-outline",
    iconActive: "person-circle",
  },
];

function TabIcon({ tab, focused, color, cartCount, theme }) {
  const c = theme.colors;
  return (
    <View style={styles.iconWrap}>
      {/* Thin indicator above the active tab */}
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: focused
              ? tab.isSOS
                ? c.danger
                : c.primary
              : "transparent",
          },
        ]}
      />
      <Ionicons
        name={focused ? tab.iconActive : tab.icon}
        size={22}
        color={tab.isSOS ? c.danger : color}
      />
      {tab.hasCart && cartCount > 0 && (
        <View
          style={[
            styles.badge,
            { backgroundColor: c.danger, borderColor: c.surface },
          ]}
        >
          <Text style={styles.badgeText}>
            {cartCount > 9 ? "9+" : cartCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { theme } = useTheme();
  const { getCount } = useCart();
  const cartCount = getCount();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          shadowOpacity: 0,
          // Breathing room for labels when there is no bottom inset
          // (Android 3-button navigation, web)
          ...(Platform.OS !== "ios" && {
            height: 60 + insets.bottom,
            paddingBottom: 4 + insets.bottom,
          }),
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
            // Per-tab label colour (tint options apply to the whole bar)
            tabBarLabel: ({ focused, color }) => (
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color: tab.isSOS ? c.danger : color,
                    fontWeight: focused ? "600" : "500",
                  },
                ]}
              >
                {tab.title}
              </Text>
            ),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                tab={tab}
                focused={focused}
                color={color}
                cartCount={cartCount}
                theme={theme}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 24,
  },
  label: {
    fontSize: 11,
  },
  indicator: {
    position: "absolute",
    top: -7,
    width: 28,
    height: 3,
    borderRadius: 2,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: 4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});
