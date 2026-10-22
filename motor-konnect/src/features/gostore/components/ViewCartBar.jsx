// Sticky "View cart" bar at the bottom of the Store tab, shown once the
// parts cart has something in it. Tapping it opens the cart (→ checkout).
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../../hooks/useTheme";
import { usePartsCart } from "../../../providers/PartsCartProvider";
import { formatPrice } from "../utils/price";

export const VIEW_CART_BAR_HEIGHT = 64;

export default function ViewCartBar() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const { count, groups } = usePartsCart();

  if (!count) return null;

  const total = groups.reduce((s, g) => s + g.subtotal, 0);
  const shops = groups.length;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={() => router.push("/parts/cart")}
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${count} items, ${formatPrice(total)}`}
        style={({ pressed }) => [
          styles.bar,
          { backgroundColor: c.primary, opacity: pressed ? 0.92 : 1 },
          theme.shadow.raised,
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: "rgba(255,255,255,0.15)" },
          ]}
        >
          <Ionicons name="cart" size={20} color={c.onPrimary} />
          <View style={[styles.badge, { backgroundColor: c.surface }]}>
            <Text style={[styles.badgeText, { color: c.primary }]}>
              {count > 99 ? "99+" : count}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.total, { color: c.onPrimary }]}>
            {formatPrice(total)}
          </Text>
          <Text style={[styles.sub, { color: c.onPrimary }]} numberOfLines={1}>
            {count} {count === 1 ? "item" : "items"}
            {shops > 1 ? ` · ${shops} shops` : ""} · incl. GST
          </Text>
        </View>
        <Text style={[styles.cta, { color: c.onPrimary }]}>View cart</Text>
        <Ionicons name="chevron-forward" size={18} color={c.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  bar: {
    height: VIEW_CART_BAR_HEIGHT - 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "800" },
  total: { fontSize: 16, fontWeight: "800" },
  sub: { fontSize: 11, opacity: 0.85, marginTop: 1 },
  cta: { fontSize: 15, fontWeight: "700" },
});
