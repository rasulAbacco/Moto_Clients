// Spare parts cart — grouped by shop. Each shop is checked out separately because
// each has its own delivery / COD options.
import { useEffect } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenHeader from "../../components/common/ScreenHeader";
import { useTheme } from "../../hooks/useTheme";
import { usePartsCart } from "../../providers/PartsCartProvider";
import { validatePartsCart } from "../../services/spareParts.service";
import { formatPrice } from "../gostore/utils/price";
import { Card, PrimaryButton, QtyStepper, StatusPill } from "./ui";

function ShopOptions({ vendor }) {
  const parts = [];
  if (vendor.deliveryEnabled)
    parts.push(
      vendor.deliveryCharge > 0
        ? `Delivery ${formatPrice(vendor.deliveryCharge)}`
        : "Free delivery",
    );
  parts.push("Store pickup");
  if (vendor.deliveryEnabled && vendor.codEnabled) parts.push("COD");
  if (vendor.acceptsUpi) parts.push("UPI");
  return parts.join(" · ");
}

export default function PartsCartScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const { items, groups, setQty, applyValidation, ready } = usePartsCart();

  // Refresh price / stock / shop options when the cart opens
  useEffect(() => {
    if (!ready || !items.length) return;
    validatePartsCart(items)
      .then(applyValidation)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const renderGroup = ({ item: g }) => {
    const unavailable = g.items.some((i) => i.available === false);
    return (
      <Card style={styles.group}>
        <View style={styles.shopRow}>
          <View style={[styles.shopIcon, { backgroundColor: c.primaryLight }]}>
            <Ionicons name="storefront-outline" size={18} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.shopName, { color: c.text }]}>
              {g.vendor.name}
            </Text>
            <Text
              style={[styles.shopMeta, { color: c.textSecondary }]}
              numberOfLines={1}
            >
              <ShopOptions vendor={g.vendor} />
            </Text>
          </View>
        </View>

        {g.items.map((i) => (
          <View
            key={i.inventoryId}
            style={[styles.item, { borderTopColor: c.divider }]}
          >
            <View style={[styles.thumb, { backgroundColor: c.primarySoft }]}>
              {i.image ? (
                <Image
                  source={{ uri: i.image }}
                  style={styles.thumbImg}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="cog-outline" size={22} color={c.textMuted} />
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                numberOfLines={2}
                style={[styles.itemName, { color: c.text }]}
              >
                {i.name}
              </Text>
              {!!i.brand && (
                <Text style={[styles.itemMeta, { color: c.textMuted }]}>
                  {i.brand}
                </Text>
              )}
              <Text style={[styles.itemPrice, { color: c.text }]}>
                {formatPrice(i.price * i.quantity)}
              </Text>
              {i.available === false && (
                <StatusPill text="No longer available" tone="bad" />
              )}
              {i.available !== false &&
                i.maxQty > 0 &&
                i.quantity > i.maxQty && (
                  <StatusPill text={`Only ${i.maxQty} left`} tone="warn" />
                )}
            </View>
            <QtyStepper
              value={i.quantity}
              max={i.maxQty || 50}
              onChange={(q) => setQty(i.inventoryId, q)}
            />
          </View>
        ))}

        <View style={[styles.groupFoot, { borderTopColor: c.divider }]}>
          <View>
            <Text style={[styles.itemMeta, { color: c.textSecondary }]}>
              {g.count} {g.count === 1 ? "item" : "items"} · incl. GST
            </Text>
            <Text style={[styles.subtotal, { color: c.text }]}>
              {formatPrice(g.subtotal)}
            </Text>
          </View>
          <PrimaryButton
            title="Checkout"
            icon="arrow-forward"
            disabled={unavailable}
            onPress={() =>
              router.push({
                pathname: "/parts/checkout",
                params: { vendorId: g.vendor.id },
              })
            }
            style={{ paddingHorizontal: 22 }}
          />
        </View>
        {unavailable && (
          <Text style={[styles.warn, { color: c.danger }]}>
            Remove unavailable parts to check out from this shop.
          </Text>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c.background }}
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        title="Parts cart"
        subtitle={
          groups.length > 1
            ? `${groups.length} shops · each is a separate order`
            : undefined
        }
      />
      <FlatList
        data={groups}
        keyExtractor={(g) => g.vendor.id}
        renderItem={renderGroup}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View
              style={[styles.emptyIcon, { backgroundColor: c.primaryLight }]}
            >
              <Ionicons name="cart-outline" size={34} color={c.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              Your parts cart is empty
            </Text>
            <Text style={[styles.emptySub, { color: c.textSecondary }]}>
              Browse genuine spare parts for your vehicle.
            </Text>
            <PrimaryButton
              title="Browse parts"
              icon="bag-handle-outline"
              onPress={() => router.navigate("/(tabs)/gostore")}
              style={{ marginTop: 8 }}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 14, flexGrow: 1 },
  group: { padding: 0, overflow: "hidden" },
  shopRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  shopIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  shopName: { fontSize: 15, fontWeight: "700" },
  shopMeta: { fontSize: 12, marginTop: 2 },
  item: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderTopWidth: 1,
    alignItems: "center",
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImg: { width: "100%", height: "100%" },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemMeta: { fontSize: 12 },
  itemPrice: { fontSize: 14, fontWeight: "700" },
  groupFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderTopWidth: 1,
  },
  subtotal: { fontSize: 18, fontWeight: "700" },
  warn: { fontSize: 12, paddingHorizontal: 14, paddingBottom: 12 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14, textAlign: "center" },
});
