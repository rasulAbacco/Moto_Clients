// One parts order: progress, items, totals, delivery / pickup info, payment, actions.
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import ScreenHeader from "../../components/common/ScreenHeader";
import { useTheme } from "../../hooks/useTheme";
import {
  cancelPartsOrder,
  getPartsOrder,
  orderErrorMessage,
  paymentLabel,
  statusLabel,
} from "../../services/spareParts.service";
import { formatPrice } from "../gostore/utils/price";
import OrderTracker from "./OrderTracker";
import { toneFor } from "./PartsOrdersScreen";
import { Card, Line, PrimaryButton, SectionTitle, StatusPill } from "./ui";

export default function PartsOrderDetailScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        setOrder(await getPartsOrder(id));
      } catch (err) {
        setError(orderErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const cancel = () =>
    Alert.alert(
      "Cancel this order?",
      "The shop will be told and the parts released.",
      [
        { text: "Keep order", style: "cancel" },
        {
          text: "Cancel order",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              setOrder(await cancelPartsOrder(id));
              Toast.show({ type: "info", text1: "Order cancelled" });
            } catch (err) {
              Toast.show({
                type: "error",
                text1: "Couldn't cancel",
                text2: orderErrorMessage(err),
              });
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <ScreenHeader
          title="Order"
          onBack={() => router.replace("/parts/orders")}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </View>
    );
  }
  if (error || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <ScreenHeader
          title="Order"
          onBack={() => router.replace("/parts/orders")}
        />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={36} color={c.textMuted} />
          <Text style={[styles.centerText, { color: c.textSecondary }]}>
            {error || "Order not found"}
          </Text>
          <PrimaryButton title="Try again" onPress={() => load()} />
        </View>
      </View>
    );
  }

  const pickup = order.fulfilment === "PICKUP";
  const a = order.shippingAddress || {};
  const awaitingUpi =
    order.status === "AWAITING_PAYMENT" && order.paymentMode === "UPI";
  const canCancel =
    (order.status === "PENDING" &&
      !(order.paymentMode === "UPI" && order.paymentStatus === "PAID")) ||
    awaitingUpi;
  const shopPhone = order.vendor?.phone
    ? String(order.vendor.phone).replace(/[^0-9+]/g, "")
    : null;
  const deliveryCharge = Number(order.deliveryCharge) || 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c.background }}
      edges={["left", "right", "bottom"]}
    >
      {/* Back goes to the orders list, not back into checkout */}
      <ScreenHeader
        title={`Order #${order.orderNumber}`}
        onBack={() => router.replace("/parts/orders")}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
      >
        <Card>
          <View style={styles.statusRow}>
            <Text style={[styles.shop, { color: c.text }]}>
              {order.vendor?.shopName}
            </Text>
            <StatusPill text={statusLabel(order)} tone={toneFor(order)} />
          </View>
          <View style={{ marginTop: 14 }}>
            <OrderTracker status={order.status} fulfilment={order.fulfilment} />
          </View>
          {awaitingUpi && (
            <PrimaryButton
              title="Complete UPI payment"
              icon="phone-portrait-outline"
              onPress={() => router.push(`/parts/pay/${order.id}`)}
              style={{ marginTop: 14 }}
            />
          )}
          {order.status === "PENDING" &&
            order.paymentMode === "UPI" &&
            order.paymentStatus !== "PAID" && (
              <Text style={[styles.note, { color: c.textSecondary }]}>
                Payment submitted{order.upiRef ? ` (ref ${order.upiRef})` : ""}.
                The shop will confirm it reached their account.
              </Text>
            )}
        </Card>

        <SectionTitle>
          {pickup ? "Store pickup" : "Delivery address"}
        </SectionTitle>
        <Card>
          {pickup ? (
            <>
              <View style={styles.iconLine}>
                <Ionicons
                  name="storefront-outline"
                  size={18}
                  color={c.primary}
                />
                <Text style={[styles.body, { color: c.text }]}>
                  Collect from{" "}
                  <Text style={{ fontWeight: "700" }}>
                    {order.vendor?.shopName}
                  </Text>
                  {order.vendor?.city ? `, ${order.vendor.city}` : ""}
                </Text>
              </View>
              <Text style={[styles.sub, { color: c.textSecondary }]}>
                {order.status === "PACKED"
                  ? "Your parts are ready — you can collect them now."
                  : "We'll let you know when it's ready to collect."}
              </Text>
              <Text style={[styles.sub, { color: c.textSecondary }]}>
                Pickup by {a.name} · {a.phone}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.body, { color: c.text, fontWeight: "600" }]}>
                {a.name} · {a.phone}
              </Text>
              <Text style={[styles.sub, { color: c.textSecondary }]}>
                {[
                  a.line1,
                  a.landmark && `near ${a.landmark}`,
                  a.city,
                  a.state,
                  a.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </>
          )}
          {!!shopPhone && (
            <PrimaryButton
              title="Call shop"
              icon="call-outline"
              variant="outline"
              onPress={() => Linking.openURL(`tel:${shopPhone}`)}
              style={{ marginTop: 12 }}
            />
          )}
        </Card>

        <SectionTitle>Items</SectionTitle>
        <Card>
          {order.items.map((i) => (
            <Line
              key={i.id}
              label={`${i.productName} × ${i.quantity}`}
              value={formatPrice(i.lineTotal)}
            />
          ))}
          <View style={[styles.divider, { backgroundColor: c.divider }]} />
          <Line
            label="GST included"
            value={formatPrice(order.taxTotal)}
            muted
          />
          {!pickup && (
            <Line
              label="Delivery"
              value={deliveryCharge > 0 ? formatPrice(deliveryCharge) : "Free"}
              muted
            />
          )}
          <Line label="Total" value={formatPrice(order.grandTotal)} bold />
          <Line label="Payment" value={paymentLabel(order)} muted />
          {order.invoice?.invoiceNumber && (
            <Line label="Invoice" value={order.invoice.invoiceNumber} muted />
          )}
        </Card>

        {canCancel && (
          <PrimaryButton
            title="Cancel order"
            variant="danger"
            loading={cancelling}
            onPress={cancel}
            style={{ marginTop: 18 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  centerText: { fontSize: 14, textAlign: "center" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  shop: { flex: 1, fontSize: 16, fontWeight: "700" },
  note: { fontSize: 13, marginTop: 12, lineHeight: 18 },
  iconLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  body: { fontSize: 14, flex: 1 },
  sub: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  divider: { height: 1, marginVertical: 8 },
});
