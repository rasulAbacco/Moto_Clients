// app/(tab)/_layout.jsx
import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";
import { useCart } from "../../src/hooks/useCart";

const TABS = [
  { name: "home", title: "Home", icon: "home-outline", iconActive: "home" },
  {
    name: "help",
    title: "Support",
    icon: "help-circle-outline",
    iconActive: "help-circle",
  },
  {
    name: "gostore",
    title: "Store",
    icon: "cart-outline",
    iconActive: "cart",
    hasCart: true,
  },
  {
    name: "sos",
    title: "SOS",
    icon: "alert-circle-outline",
    iconActive: "alert-circle",
    isSOS: true,
  },
  {
    name: "account",
    title: "Profile",
    icon: "person-outline",
    iconActive: "person",
  },
];

function TabIcon({
  name,
  icon,
  iconActive,
  focused,
  color,
  isSOS,
  hasCart,
  cartCount,
  theme,
}) {
  // ── SOS special pill ──────────────────────────────────────────────────────
  if (isSOS) {
    return (
      <View
        style={[
          styles.sosBtn,
          { backgroundColor: focused ? "#ef4444" : "#ef444420" },
        ]}
      >
        <Ionicons
          name={focused ? iconActive : icon}
          size={20}
          color={focused ? "#fff" : "#ef4444"}
        />
      </View>
    );
  }

  // ── Cart badge ────────────────────────────────────────────────────────────
  if (hasCart) {
    return (
      <View>
        <Ionicons name={focused ? iconActive : icon} size={22} color={color} />
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>
              {cartCount > 9 ? "9+" : cartCount}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // ── Default ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.iconWrap}>
      {focused && (
        <View
          style={[
            styles.activeBlob,
            { backgroundColor: theme.colors.primary + "18" },
          ]}
        />
      )}
      <Ionicons name={focused ? iconActive : icon} size={22} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const { theme } = useTheme();
  const { getCount } = useCart();
  const cartCount = getCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary || "#9CA3AF",
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 24 : 16,
          left: 16,
          right: 16,
          height: Platform.OS === "ios" ? 76 : 68,
          borderRadius: 26,
          backgroundColor: theme.colors.card,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginBottom: Platform.OS === "ios" ? 10 : 8,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingTop: 8,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={tab.name}
                icon={tab.icon}
                iconActive={tab.iconActive}
                focused={focused}
                color={color}
                isSOS={tab.isSOS}
                hasCart={tab.hasCart}
                cartCount={cartCount}
                theme={theme}
              />
            ),
            // SOS label styled red
            tabBarActiveTintColor: tab.isSOS ? "#ef4444" : theme.colors.primary,
            tabBarInactiveTintColor: tab.isSOS
              ? "#ef444480"
              : theme.colors.textSecondary || "#9CA3AF",
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Default icon wrapper with active blob
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 32,
  },
  activeBlob: {
    position: "absolute",
    width: 40,
    height: 28,
    borderRadius: 10,
  },

  // SOS pill button
  sosBtn: {
    width: 42,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Cart badge
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800",
    lineHeight: 11,
  },
});
