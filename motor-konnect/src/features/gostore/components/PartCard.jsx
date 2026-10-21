// Product tile for the Store grid (2 columns).
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { formatPrice } from "../../../utils/price.js";

export default function PartCard({ part, onPress }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const image = part.images?.[0];

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: c.divider }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.imageWrap, { backgroundColor: c.primarySoft }]}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="cog-outline" size={34} color={c.textMuted} />
        )}
        {part.discountPercent > 0 && (
          <View style={[styles.discount, { backgroundColor: c.success }]}>
            <Text style={styles.discountText}>{part.discountPercent}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {!!part.brand && (
          <Text
            numberOfLines={1}
            style={[styles.brand, { color: c.textMuted }]}
          >
            {part.brand}
          </Text>
        )}
        <Text numberOfLines={2} style={[styles.name, { color: c.text }]}>
          {part.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: c.text }]}>
            {formatPrice(part.price)}
          </Text>
          {part.mrp > part.price && (
            <Text style={[styles.mrp, { color: c.textMuted }]}>
              {formatPrice(part.mrp)}
            </Text>
          )}
        </View>

        <Text
          numberOfLines={1}
          style={[styles.stock, { color: part.inStock ? c.success : c.danger }]}
        >
          {part.inStock ? "In stock" : "Out of stock"}
          {part.vendor?.name ? (
            <Text style={{ color: c.textMuted }}> · {part.vendor.name}</Text>
          ) : null}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageWrap: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  discount: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  body: { padding: 10, gap: 3 },
  brand: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  name: { fontSize: 14, fontWeight: "600", lineHeight: 18, minHeight: 36 },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 2,
  },
  price: { fontSize: 15, fontWeight: "700" },
  mrp: { fontSize: 12, textDecorationLine: "line-through" },
  stock: { fontSize: 11, fontWeight: "500", marginTop: 2 },
});
