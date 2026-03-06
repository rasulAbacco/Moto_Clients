import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCart } from "../../../hooks/useCart";
import { useRouter } from "expo-router";

export default function CartBar() {
  const { getTotal, getCount } = useCart();
  const router = useRouter();

  const count = getCount();
  const total = getTotal();

  if (count === 0) return null;

  return (
    <View
      style={[styles.wrapper, { bottom: Platform.OS === "ios" ? 100 : 86 }]}
    >
      <LinearGradient
        colors={["#111827", "#1f2937"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bar}
      >
        {/* Left: cart icon + item count */}
        <View style={styles.left}>
          <View style={styles.cartIconWrap}>
            <Ionicons name="cart" size={18} color="#fff" />
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {count > 9 ? "9+" : count}
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.itemsText}>
              {count} item{count !== 1 ? "s" : ""} in cart
            </Text>
            <Text style={styles.totalText}>
              ₹ {total.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Right: CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push("/cart")}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaText}>View Cart</Text>
          <Ionicons name="arrow-forward" size={14} color="#111827" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cartIconWrap: {
    position: "relative",
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#1f2937",
  },
  countBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800",
  },
  itemsText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "500",
  },
  totalText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  ctaText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 13,
  },
});
