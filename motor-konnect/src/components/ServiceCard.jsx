// src/components/ServiceCard.jsx
//
// The one card component used everywhere a bookable service is shown:
// Home's default listing, Home's search results, and a garage's full
// active-services list. Two independent tap targets:
//   - Card body -> navigates to /sub-service/[id] (full detail page)
//   - "Add"/"Added" button -> adds/removes from cart in place, no nav
//
// ✅ Grid layout: rendered 2-per-row (see ServiceCardList numColumns=2).

import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useAppStore from "../store/useAppStore";
import { getServicePrice } from "../utils/pricing";
import { useAddToCart } from "../hooks/useAddToCart";

const PRIMARY_BLUE = "#1E3A5F";

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
    // onPress (which navigates to the detail page).
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
      style={styles.card}
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
          <Ionicons name="construct-outline" size={26} color="#8A919C" />
        )}

        {item.garageVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={10} color={PRIMARY_BLUE} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.serviceName} numberOfLines={2}>
          {item.serviceName ?? item.name}
        </Text>

        <View style={styles.garageLine}>
          <Ionicons name="storefront-outline" size={10} color="#8A919C" />
          <Text style={styles.garageName} numberOfLines={1}>
            {item.garageName ?? "Unknown Garage"}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color="#B8862B" />
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
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E3E6EB",
  },
  imageWrap: {
    width: "100%",
    height: 90,
    borderRadius: 12,
    backgroundColor: "#F6F7F9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 10,
  },
  image: { width: "100%", height: "100%" },
  verifiedBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: { fontSize: 8, fontWeight: "800", color: PRIMARY_BLUE },
  info: { marginBottom: 10 },
  serviceName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D23",
    minHeight: 34, // keeps 2-line names aligned across the row
  },
  garageLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  garageName: { fontSize: 11, color: "#8A919C", fontWeight: "500", flex: 1 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  rating: { fontSize: 11, color: "#1A1D23", fontWeight: "600" },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 5,
  },
  price: { fontSize: 15, fontWeight: "800", color: PRIMARY_BLUE },
  originalPrice: {
    fontSize: 11,
    color: "#8A919C",
    textDecorationLine: "line-through",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addedBtn: { backgroundColor: "#2E7D5B" },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
