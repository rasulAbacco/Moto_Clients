// src/components/ServiceCard.jsx
//
// The one card component used everywhere a bookable service is shown:
// Home's default listing, Home's search results, and a garage's full
// active-services list. Two independent tap targets:
//   - Card body -> navigates to /sub-service/[id] (full detail page)
//   - "Add"/"Added" button -> adds/removes from cart in place, no nav

import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useAppStore from "../store/useAppStore";
import { getServicePrice } from "../utils/pricing";
import { useAddToCart } from "../hooks/useAddToCart";

const PRIMARY_BLUE = "#007AFF";

/**
 * @param {object} item - a flattened row from search.service.js
 *   (flattenGarage/flattenGarageMatches/flattenAllGarageServices):
 *   { serviceId, serviceName, garageId, garageName, garageRating,
 *     garageVerified, pricing?/price?, image?, slug? }
 * @param {object} [garage] - full cached garage object (from
 *   useAppStore.getGarageById), attached to the cart item so checkout's
 *   "missing garage metadata" gate passes. Pass null if unavailable —
 *   the add-to-cart will still work, just without that field.
 */
export default function ServiceCard({ item, garage }) {
  const router = useRouter();
  const activeVehicleType = useAppStore((s) => s.activeVehicleType);
  const { addServiceToCart, isInCart, removeFromCart } = useAddToCart();

  const serviceId = item.serviceId ?? item.id;
  const added = isInCart(serviceId);
  const { final, original } = getServicePrice(item, activeVehicleType);
  const hasDiscount = original > final;

  const handleCardPress = () => {
    router.push({
      pathname: "/sub-service/[id]",
      params: { id: serviceId, garageId: item.garageId },
    });
  };

  const handleButtonPress = (e) => {
    // Defensive: prevent this tap from also bubbling into the card's own
    // onPress (which navigates to the detail page) — if that happened,
    // you'd get silently navigated away right after adding, which looks
    // exactly like "nothing happened" on Home.
    e?.stopPropagation?.();

    if (added) {
      removeFromCart(serviceId);
      return;
    }
    addServiceToCart({
      id: serviceId,
      title: item.serviceName ?? item.name,
      price: final,
      carType: activeVehicleType,
      image: item.image || null,
      source: "service",
      slug: item.slug,
      garageId: item.garageId,
      garageName: item.garageName,
      garage: garage || null,
    });
  };

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.85}
      onPress={handleCardPress}
    >
      <View style={styles.imageWrap}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="construct-outline" size={22} color="#B0B0B8" />
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {item.serviceName ?? item.name}
          </Text>
          {item.garageVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={10}
                color={PRIMARY_BLUE}
              />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.garageLine}>
          <Ionicons name="storefront-outline" size={11} color="#8E8E93" />
          <Text style={styles.garageName} numberOfLines={1}>
            {item.garageName ?? "Unknown Garage"}
          </Text>
          <Ionicons
            name="star"
            size={11}
            color="#FFB800"
            style={{ marginLeft: 6 }}
          />
          <Text style={styles.rating}>
            {Number(item.garageRating ?? 4.5).toFixed(1)}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{final}</Text>
          {hasDiscount && <Text style={styles.originalPrice}>₹{original}</Text>}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.addBtn, added && styles.addedBtn]}
        onPress={handleButtonPress}
        activeOpacity={0.85}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name={added ? "checkmark" : "add"} size={14} color="#fff" />
        <Text style={styles.addBtnText}>{added ? "Added" : "Add"}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    gap: 10,
  },
  imageWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  info: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  serviceName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    flexShrink: 1,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: { fontSize: 9, fontWeight: "800", color: PRIMARY_BLUE },
  garageLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  garageName: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "500",
    flexShrink: 1,
  },
  rating: { fontSize: 11, color: "#1a1a1a", fontWeight: "600" },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  price: { fontSize: 15, fontWeight: "800", color: PRIMARY_BLUE },
  originalPrice: {
    fontSize: 12,
    color: "#B0B0B8",
    textDecorationLine: "line-through",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addedBtn: { backgroundColor: "#22C55E" },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
