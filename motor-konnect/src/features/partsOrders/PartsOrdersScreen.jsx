// "My parts orders" — orders placed from the Store tab.
import { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import ScreenHeader from "../../components/common/ScreenHeader";
import { useTheme } from "../../hooks/useTheme";
import { AuthContext } from "../../providers/AuthProvider";
import { useLoginSheet } from "../../providers/LoginSheetProvider";
import {
  getMyPartsOrders,
  orderErrorMessage,
  paymentLabel,
  statusLabel,
} from "../../services/spareParts.service";
import { formatPrice } from "../gostore/utils/price";
import { Card, PrimaryButton, StatusPill } from "./ui";

export const toneFor = (o) =>
  o.status === "CANCELLED"
    ? "bad"
    : o.status === "DELIVERED"
      ? "good"
      : o.status === "AWAITING_PAYMENT"
        ? "warn"
        : "neutral";

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export default function PartsOrdersScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { openLoginSheet } = useLoginSheet();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!user) {
        setLoading(false);
        return;
      }
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        setOrders(await getMyPartsOrders());
      } catch (err) {
        setError(orderErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  // Reload whenever the screen is shown (status changes made by the shop)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const renderItem = ({ item: o }) => {
    const first = o.items?.[0];
    const more = (o.items?.length || 0) - 1;
    return (
      <Pressable
        onPress={() => router.push(`/parts/orders/${o.id}`)}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <Card>
          <View style={styles.top}>
            <Text style={[styles.shop, { color: c.text }]} numberOfLines={1}>
              {o.vendor?.shopName || "Shop"}
            </Text>
            <StatusPill text={statusLabel(o)} tone={toneFor(o)} />
          </View>
          <Text
            style={[styles.items, { color: c.textSecondary }]}
            numberOfLines={1}
          >
            {first ? `${first.productName} × ${first.quantity}` : ""}
            {more > 0 ? ` + ${more} more` : ""}
          </Text>
          <View style={styles.bottom}>
            <View style={styles.meta}>
              <Ionicons
                name={
                  o.fulfilment === "PICKUP"
                    ? "storefront-outline"
                    : "bicycle-outline"
                }
                size={13}
                color={c.textMuted}
              />
              <Text style={[styles.metaText, { color: c.textMuted }]}>
                {o.fulfilment === "PICKUP" ? "Pickup" : "Delivery"} ·{" "}
                {paymentLabel(o)} · {fmtDate(o.createdAt)}
              </Text>
            </View>
            <Text style={[styles.total, { color: c.text }]}>
              {formatPrice(o.grandTotal)}
            </Text>
          </View>
          {o.status === "AWAITING_PAYMENT" && (
            <Text style={[styles.action, { color: c.primary }]}>
              Complete UPI payment →
            </Text>
          )}
        </Card>
      </Pressable>
    );
  };

  let body;
  if (!user) {
    body = (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={40} color={c.textMuted} />
        <Text style={[styles.centerText, { color: c.textSecondary }]}>
          Log in to see your parts orders
        </Text>
        <PrimaryButton title="Log in" onPress={openLoginSheet} />
      </View>
    );
  } else if (loading) {
    body = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  } else if (error) {
    body = (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={36} color={c.textMuted} />
        <Text style={[styles.centerText, { color: c.textSecondary }]}>
          {error}
        </Text>
        <PrimaryButton title="Try again" onPress={() => load()} />
      </View>
    );
  } else {
    body = (
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="receipt-outline" size={36} color={c.textMuted} />
            <Text style={[styles.centerText, { color: c.textSecondary }]}>
              No parts orders yet
            </Text>
            <PrimaryButton
              title="Browse parts"
              onPress={() => router.navigate("/(tabs)/gostore")}
            />
          </View>
        }
      />
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c.background }}
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader title="My parts orders" />
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  shop: { flex: 1, fontSize: 15, fontWeight: "700" },
  items: { fontSize: 13, marginTop: 4 },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  metaText: { fontSize: 12 },
  total: { fontSize: 16, fontWeight: "700" },
  action: { fontSize: 13, fontWeight: "700", marginTop: 8 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  centerText: { fontSize: 14, textAlign: "center" },
});
