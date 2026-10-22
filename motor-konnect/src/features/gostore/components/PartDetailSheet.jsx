// Bottom sheet with full part details, the shop's order options and buy actions.
import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../hooks/useTheme";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { formatPrice } from "../utils/price";
import { usePartsCart } from "../../../providers/PartsCartProvider";

const Badge = ({ icon, text, c, tone = "neutral" }) => {
  const color =
    tone === "good"
      ? c.success
      : tone === "muted"
        ? c.textSecondary
        : c.primary;
  const bg =
    tone === "good"
      ? c.successSoft
      : tone === "muted"
        ? c.inputBackground
        : c.primaryLight;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
};

const Row = ({ label, value, c }) =>
  value ? (
    <View style={[styles.row, { borderBottomColor: c.divider }]}>
      <Text style={[styles.rowLabel, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: c.text }]}>{value}</Text>
    </View>
  ) : null;

export default function PartDetailSheet({ part, onClose }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const slideWidth = width - 32;
  const c = theme.colors;
  const router = useRouter();
  const { add, quantityOf } = usePartsCart();
  const [qty, setQty] = useState(1);

  useEffect(() => setQty(1), [part?.inventoryId]);

  if (!part) return null;

  const v = part.vendor || {};
  const deliveryOn = v.deliveryEnabled !== false;
  const canBuy = Boolean(part.inStock && part.inventoryId);
  const inCart = quantityOf(part.inventoryId);
  const maxQty = part.stock ? Math.min(50, part.stock) : 50;

  const addToCart = () => {
    if (!add(part, qty)) return false;
    Toast.show({
      type: "success",
      text1: "Added to cart",
      text2: `${qty} × ${part.name}`,
    });
    return true;
  };
  const buyNow = () => {
    if (!add(part, qty)) return;
    onClose?.();
    router.push({
      pathname: "/parts/checkout",
      params: { vendorId: String(v.id) },
    });
  };

  const phone = part.vendor?.phone
    ? String(part.vendor.phone).replace(/[^0-9+]/g, "")
    : null;
  const enquiry = `Hi, I'm interested in "${part.name}"${
    part.partNumber ? ` (Part no. ${part.partNumber})` : ""
  } listed on Motor Konnect. Is it available?`;

  const call = () => phone && Linking.openURL(`tel:${phone}`);
  const whatsapp = () => {
    if (!phone) return;
    const intl = phone.startsWith("+")
      ? phone.slice(1)
      : phone.length === 10
        ? `91${phone}`
        : phone;
    Linking.openURL(
      `https://wa.me/${intl}?text=${encodeURIComponent(enquiry)}`,
    );
  };

  return (
    <Modal
      visible={!!part}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: c.surface, paddingBottom: insets.bottom + 12 },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: c.border }]} />
        <Pressable
          onPress={onClose}
          hitSlop={10}
          accessibilityLabel="Close"
          style={[styles.close, { backgroundColor: c.inputBackground }]}
        >
          <Ionicons name="close" size={20} color={c.text} />
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={[styles.gallery, { backgroundColor: c.primarySoft }]}
          >
            {(part.images?.length ? part.images : [null]).map((uri, i) => (
              <View
                key={uri || i}
                style={[styles.slide, { width: slideWidth }]}
              >
                {uri ? (
                  <Image
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons name="cog-outline" size={56} color={c.textMuted} />
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.content}>
            {!!part.brand && (
              <Text style={[styles.brand, { color: c.textMuted }]}>
                {part.brand}
              </Text>
            )}
            <Text style={[styles.name, { color: c.text }]}>{part.name}</Text>

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: c.text }]}>
                {formatPrice(part.price)}
              </Text>
              {part.mrp > part.price && (
                <Text style={[styles.mrp, { color: c.textMuted }]}>
                  MRP {formatPrice(part.mrp)}
                </Text>
              )}
              {part.discountPercent > 0 && (
                <Text style={[styles.off, { color: c.success }]}>
                  {part.discountPercent}% off
                </Text>
              )}
            </View>
            <Text style={[styles.taxNote, { color: c.textMuted }]}>
              {part.gstRate
                ? `Inclusive of ${part.gstRate}% GST`
                : "Inclusive of all taxes"}
            </Text>

            <View
              style={[
                styles.stockPill,
                {
                  backgroundColor: part.inStock ? c.successSoft : c.dangerSoft,
                },
              ]}
            >
              <Ionicons
                name={part.inStock ? "checkmark-circle" : "close-circle"}
                size={14}
                color={part.inStock ? c.success : c.danger}
              />
              <Text
                style={[
                  styles.stockText,
                  { color: part.inStock ? c.success : c.danger },
                ]}
              >
                {part.inStock
                  ? part.stock
                    ? `In stock · ${part.stock} ${part.unit || "units"}`
                    : "In stock"
                  : "Out of stock"}
              </Text>
            </View>

            {/* What this shop offers at checkout */}
            <View style={styles.badges}>
              {deliveryOn ? (
                <Badge
                  c={c}
                  icon="bicycle-outline"
                  text={
                    v.deliveryCharge > 0
                      ? `Delivery ${formatPrice(v.deliveryCharge)}`
                      : "Free delivery"
                  }
                />
              ) : (
                <Badge
                  c={c}
                  icon="storefront-outline"
                  text="Store pickup only"
                  tone="muted"
                />
              )}
              {deliveryOn && v.codEnabled !== false && (
                <Badge
                  c={c}
                  icon="cash-outline"
                  text="Cash on delivery"
                  tone="good"
                />
              )}
              {!deliveryOn && (
                <Badge
                  c={c}
                  icon="cash-outline"
                  text="Pay at shop"
                  tone="good"
                />
              )}
              {v.acceptsUpi && (
                <Badge c={c} icon="phone-portrait-outline" text="UPI" />
              )}
            </View>

            {!!part.description && (
              <Text style={[styles.description, { color: c.textSecondary }]}>
                {part.description}
              </Text>
            )}

            <View style={[styles.table, { borderColor: c.border }]}>
              <Row label="Category" value={part.category} c={c} />
              <Row label="Part number" value={part.partNumber} c={c} />
              <Row label="Warranty" value={part.warranty} c={c} />
              <Row
                label="Fits"
                value={
                  part.compatibleModels?.length
                    ? part.compatibleModels.join(", ")
                    : null
                }
                c={c}
              />
            </View>

            {part.vendor && (
              <View style={[styles.vendor, { borderColor: c.border }]}>
                <View
                  style={[
                    styles.vendorIcon,
                    { backgroundColor: c.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={20}
                    color={c.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.vendorName, { color: c.text }]}>
                    {part.vendor.name || "Vendor"}
                  </Text>
                  {!!(part.vendor.city || part.vendor.address) && (
                    <Text
                      numberOfLines={2}
                      style={[styles.vendorMeta, { color: c.textSecondary }]}
                    >
                      {part.vendor.address || part.vendor.city}
                    </Text>
                  )}
                </View>
                {part.vendor.verified && (
                  <Ionicons
                    name="shield-checkmark"
                    size={18}
                    color={c.success}
                  />
                )}
                {!!phone && (
                  <Pressable
                    onPress={call}
                    hitSlop={8}
                    accessibilityLabel="Call shop"
                    style={[styles.iconBtn, { borderColor: c.border }]}
                  >
                    <Ionicons name="call-outline" size={18} color={c.primary} />
                  </Pressable>
                )}
                {!!phone && (
                  <Pressable
                    onPress={whatsapp}
                    hitSlop={8}
                    accessibilityLabel="WhatsApp shop"
                    style={[styles.iconBtn, { borderColor: c.border }]}
                  >
                    <Ionicons
                      name="logo-whatsapp"
                      size={18}
                      color={c.primary}
                    />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {canBuy ? (
          <View style={styles.actions}>
            <View style={[styles.stepper, { borderColor: c.border }]}>
              <Pressable
                onPress={() => setQty((q) => Math.max(1, q - 1))}
                hitSlop={6}
                accessibilityLabel="Decrease quantity"
                style={styles.stepBtn}
              >
                <Ionicons
                  name="remove"
                  size={18}
                  color={qty > 1 ? c.text : c.textMuted}
                />
              </Pressable>
              <Text style={[styles.stepQty, { color: c.text }]}>{qty}</Text>
              <Pressable
                onPress={() => setQty((q) => Math.min(maxQty, q + 1))}
                hitSlop={6}
                accessibilityLabel="Increase quantity"
                style={styles.stepBtn}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={qty < maxQty ? c.text : c.textMuted}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={addToCart}
              style={({ pressed }) => [
                styles.btn,
                styles.btnOutline,
                { borderColor: c.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name="cart-outline" size={18} color={c.primary} />
              <Text style={[styles.btnText, { color: c.primary }]}>
                {inCart ? `Add (${inCart})` : "Add"}
              </Text>
            </Pressable>
            <Pressable
              onPress={buyNow}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.btnText, { color: c.onPrimary }]}>
                Buy now
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.noContact, { color: c.textMuted }]}>
            {part.inStock
              ? "This part can't be ordered online yet"
              : "Out of stock — check back soon"}
          </Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
  },
  stepBtn: {
    width: 36,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  stepQty: {
    minWidth: 22,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
  backdrop: { flex: 1, backgroundColor: "rgba(20,36,59,0.45)" },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  close: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gallery: {
    height: 220,
    marginHorizontal: 16,
    marginTop: 28,
    borderRadius: 14,
  },
  slide: { height: 220, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  content: { padding: 16, gap: 6 },
  brand: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  name: { fontSize: 20, fontWeight: "700", lineHeight: 26 },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  price: { fontSize: 22, fontWeight: "700" },
  mrp: { fontSize: 13, textDecorationLine: "line-through" },
  off: { fontSize: 13, fontWeight: "600" },
  taxNote: { fontSize: 12 },
  stockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },
  stockText: { fontSize: 12, fontWeight: "600" },
  description: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  table: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 13, fontWeight: "500", flex: 1, textAlign: "right" },
  vendor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  vendorIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorName: { fontSize: 15, fontWeight: "600" },
  vendorMeta: { fontSize: 12, marginTop: 2 },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnOutline: { borderWidth: 1.5 },
  btnText: { fontSize: 15, fontWeight: "600" },
  noContact: { textAlign: "center", fontSize: 13, paddingTop: 12 },
});
