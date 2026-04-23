import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useCart } from "../../../hooks/useCart";
import { useRouter } from "expo-router";

export default function StoreHeader() {
  const { theme } = useTheme();
  const { getCount } = useCart();
  const router = useRouter();
  const cartCount = getCount();

  return (
    <View style={styles.container}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Welcome to
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Motor Store 🛒
          </Text>
        </View>

        {/* Cart icon button */}
        <TouchableOpacity
          style={[
            styles.cartBtn,
            {
              backgroundColor: theme.colors.card || theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => router.push("/cart")}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={20} color={theme.colors.text} />
          {cartCount > 0 && (
            <View
              style={[
                styles.cartBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.cartBadgeText}>
                {cartCount > 9 ? "9+" : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Accessories, oils, tyres & more
      </Text>

      {/* Search bar (tappable → /search) */}
      {/* <TouchableOpacity
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.colors.card || theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => router.push("/store/search")}
        activeOpacity={0.8}
      >
        <Ionicons
          name="search-outline"
          size={17}
          color={theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.searchPlaceholder,
            { color: theme.colors.textSecondary },
          ]}
        >
          Search products, brands...
        </Text>
        <View
          style={[
            styles.micWrap,
            { backgroundColor: theme.colors.primary + "15" },
          ]}
        >
          <Ionicons name="mic-outline" size={15} color={theme.colors.primary} />
        </View>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    fontSize: 12,
    marginBottom: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
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
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    gap: 9,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  micWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
