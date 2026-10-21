// Bottom sheet with full part details and vendor contact.
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
import { formatPrice } from "../../../utils/price.js";

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

  if (!part) return null;

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
              </View>
            )}
          </View>
        </ScrollView>

        {phone ? (
          <View style={styles.actions}>
            <Pressable
              onPress={whatsapp}
              style={[
                styles.btn,
                styles.btnOutline,
                { borderColor: c.primary },
              ]}
            >
              <Ionicons name="logo-whatsapp" size={18} color={c.primary} />
              <Text style={[styles.btnText, { color: c.primary }]}>
                Enquire
              </Text>
            </Pressable>
            <Pressable
              onPress={call}
              style={[styles.btn, { backgroundColor: c.primary }]}
            >
              <Ionicons name="call" size={17} color={c.onPrimary} />
              <Text style={[styles.btnText, { color: c.onPrimary }]}>
                Call vendor
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.noContact, { color: c.textMuted }]}>
            Vendor contact not available for this part
          </Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
