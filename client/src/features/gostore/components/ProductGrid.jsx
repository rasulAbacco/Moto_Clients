import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "../../../hooks/useTheme";
import { useCart } from "../../../hooks/useCart";
import { useRouter } from "expo-router";
import { STORE_PRODUCTS } from "../data/gostore.data";

const { width } = Dimensions.get("window");
const CARD_W = (width - 32 - 12) / 2;

export default function ProductGrid({ products }) {
  const { theme } = useTheme();
  const { addToCart, removeFromCart, getItemCount } = useCart();
  const router = useRouter();
  const [wishlist, setWishlist] = useState({});

  const data = products || STORE_PRODUCTS;

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={styles.grid}>
      {data.map((item) => {
        const qty = getItemCount?.(item.id) || 0;
        const isWishlisted = wishlist[item.id];
        const discount = item.originalPrice
          ? Math.round(
              ((item.originalPrice - item.price) / item.originalPrice) * 100,
            )
          : null;

        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.colors.card || theme.colors.surface || "#fff",
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.push(`/store/product/${item.id}`)}
            activeOpacity={0.9}
          >
            {/* Image */}
            <View style={styles.imageWrap}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.imagePlaceholder,
                    { backgroundColor: theme.colors.background },
                  ]}
                >
                  <Ionicons
                    name="cube-outline"
                    size={28}
                    color={theme.colors.textSecondary}
                  />
                </View>
              )}

              {/* Discount badge */}
              {discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discount}% OFF</Text>
                </View>
              )}

              {/* Wishlist */}
              <TouchableOpacity
                style={[
                  styles.wishlistBtn,
                  { backgroundColor: theme.colors.background + "cc" },
                ]}
                onPress={() => toggleWishlist(item.id)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons
                  name={isWishlisted ? "heart" : "heart-outline"}
                  size={15}
                  color={isWishlisted ? "#ef4444" : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.info}>
              {item.brand && (
                <Text
                  style={[
                    styles.brandText,
                    { color: theme.colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {item.brand}
                </Text>
              )}
              <Text
                style={[styles.productName, { color: theme.colors.text }]}
                numberOfLines={2}
              >
                {item.title || item.name}
              </Text>

              {/* Rating */}
              {item.rating && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={11} color="#f59e0b" />
                  <Text
                    style={[
                      styles.ratingText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {item.rating} ({item.reviewCount || 0})
                  </Text>
                </View>
              )}

              {/* Price row */}
              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: theme.colors.primary }]}>
                  ₹{item.price}
                </Text>
                {item.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ₹{item.originalPrice}
                  </Text>
                )}
              </View>
            </View>

            {/* Add / Qty controls */}
            {qty === 0 ? (
              <TouchableOpacity
                style={[
                  styles.addBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => addToCart(item)}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={14} color="#fff" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.qtyRow,
                  { borderColor: theme.colors.primary + "40" },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    { backgroundColor: theme.colors.primary + "15" },
                  ]}
                  onPress={() => removeFromCart(item.id)}
                >
                  <Ionicons
                    name="remove"
                    size={14}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                <Text style={[styles.qtyCount, { color: theme.colors.text }]}>
                  {qty}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => addToCart(item)}
                >
                  <Ionicons name="add" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: CARD_W,
    borderRadius: 18,
    borderWidth: 0.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  imageWrap: {
    position: "relative",
    height: 120,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#16a34a",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  wishlistBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: 10,
    gap: 3,
  },
  brandText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  originalPrice: {
    fontSize: 11,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  // Add button
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  // Qty controls
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  qtyBtn: {
    width: 34,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyCount: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
});
