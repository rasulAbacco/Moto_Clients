// Checkout for ONE shop's parts. Only the options that shop allows are shown:
//   Delivery (if the shop delivers) → address + Cash on delivery (if allowed) / UPI
//   Store pickup (always)           → name + phone + Pay at shop / UPI
import { useContext, useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import ScreenHeader from "../../components/common/ScreenHeader";
import { useTheme } from "../../hooks/useTheme";
import { AuthContext } from "../../providers/AuthProvider";
import { useLoginSheet } from "../../providers/LoginSheetProvider";
import { usePartsCart } from "../../providers/PartsCartProvider";
import {
  getCheckoutProfile,
  orderErrorMessage,
  placePartsOrder,
  validatePartsCart,
} from "../../services/spareParts.service";
import { formatPrice } from "../gostore/utils/price";
import {
  Card,
  Field,
  Line,
  OptionRow,
  PrimaryButton,
  QtyStepper,
  SectionTitle,
  StatusPill,
} from "./ui";

const PHONE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;
const emptyAddress = {
  name: "",
  phone: "",
  line1: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

export default function PartsCheckoutScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { vendorId } = useLocalSearchParams();
  const { user } = useContext(AuthContext);
  const { openLoginSheet } = useLoginSheet();
  const { groups, applyValidation, clearVendor, setQty, remove } =
    usePartsCart();

  const group = groups.find((g) => g.vendor.id === String(vendorId));
  const vendor = group?.vendor;

  const deliveryPossible = Boolean(
    vendor?.deliveryEnabled && (vendor?.codEnabled || vendor?.acceptsUpi),
  );
  const [fulfilment, setFulfilment] = useState(null);
  const [payment, setPayment] = useState(null);
  const [address, setAddress] = useState(emptyAddress);
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);

  // Default choices once the shop is known
  useEffect(() => {
    if (vendor && !fulfilment)
      setFulfilment(deliveryPossible ? "DELIVERY" : "PICKUP");
  }, [vendor, deliveryPossible, fulfilment]);

  const paymentOptions = useMemo(() => {
    if (!vendor || !fulfilment) return [];
    const opts = [];
    if (fulfilment === "PICKUP") {
      opts.push({
        value: "COD",
        icon: "storefront-outline",
        title: "Pay at shop",
        subtitle: "Pay cash or UPI when you collect the parts",
      });
    } else if (vendor.codEnabled) {
      opts.push({
        value: "COD",
        icon: "cash-outline",
        title: "Cash on delivery",
        subtitle: "Pay when the parts are delivered",
      });
    }
    if (vendor.acceptsUpi) {
      opts.push({
        value: "UPI",
        icon: "phone-portrait-outline",
        title: "Pay now by UPI",
        subtitle:
          "Google Pay, PhonePe, Paytm or any UPI app — paid directly to the shop",
      });
    }
    return opts;
  }, [vendor, fulfilment]);

  useEffect(() => {
    if (
      paymentOptions.length &&
      !paymentOptions.some((o) => o.value === payment)
    )
      setPayment(paymentOptions[0].value);
  }, [paymentOptions, payment]);

  // Fresh price / stock / options, and prefill from profile
  useEffect(() => {
    if (!group) return;
    validatePartsCart(group.items)
      .then(applyValidation)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  useEffect(() => {
    if (!user) return;
    getCheckoutProfile()
      .then((p) => {
        if (!p) return;
        setAddress((a) => ({
          ...a,
          name: a.name || p.name || "",
          phone: a.phone || p.phone || "",
          line1: a.line1 || p.address?.line1 || "",
          city: a.city || p.address?.city || "",
          state: a.state || p.address?.state || "",
          pincode: a.pincode || p.address?.pincode || "",
        }));
      })
      .catch(() => {});
  }, [user]);

  if (!group) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <ScreenHeader title="Checkout" />
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={36} color={c.textMuted} />
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            Nothing to check out from this shop.
          </Text>
          <PrimaryButton
            title="Go to cart"
            onPress={() => router.replace("/parts/cart")}
          />
        </View>
      </View>
    );
  }

  const deliveryCharge = fulfilment === "DELIVERY" ? vendor.deliveryCharge : 0;
  const total = group.subtotal + deliveryCharge;
  const unavailable = group.items.some((i) => i.available === false);

  const set = (key) => (value) => setAddress((a) => ({ ...a, [key]: value }));

  const validate = () => {
    const e = {};
    if (address.name.trim().length < 2) e.name = "Enter your name";
    if (!PHONE_RE.test(address.phone.replace(/\D/g, "").slice(-10)))
      e.phone = "Enter a 10-digit mobile number";
    if (fulfilment === "DELIVERY") {
      if (address.line1.trim().length < 3) e.line1 = "Enter house / street";
      if (address.city.trim().length < 2) e.city = "Enter city";
      if (address.state.trim().length < 2) e.state = "Enter state";
      if (!PIN_RE.test(address.pincode.trim())) e.pincode = "6-digit pincode";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    if (!user) {
      Toast.show({ type: "info", text1: "Log in to place your order" });
      openLoginSheet();
      return;
    }
    if (!payment || !validate()) return;

    const phone = address.phone.replace(/\D/g, "").slice(-10);
    const shippingAddress =
      fulfilment === "PICKUP"
        ? { name: address.name.trim(), phone }
        : {
            name: address.name.trim(),
            phone,
            line1: address.line1.trim(),
            ...(address.landmark.trim() && {
              landmark: address.landmark.trim(),
            }),
            city: address.city.trim(),
            state: address.state.trim(),
            pincode: address.pincode.trim(),
          };

    setPlacing(true);
    try {
      const result = await placePartsOrder({
        items: group.items,
        fulfilment,
        paymentMode: payment,
        shippingAddress,
      });
      const order = result?.orders?.[0];
      if (payment === "UPI" && order) {
        router.replace(`/parts/pay/${order.id}`);
      } else {
        Toast.show({
          type: "success",
          text1: "Order placed",
          text2: `${vendor.name} will confirm it shortly`,
        });
        router.replace(order ? `/parts/orders/${order.id}` : "/parts/orders");
      }
      // Leave the screen first so it doesn't flash "nothing to check out"
      setTimeout(() => clearVendor(vendor.id), 400);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Couldn't place order",
        text2: orderErrorMessage(err),
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c.background }}
      edges={["left", "right"]}
    >
      <ScreenHeader title="Checkout" subtitle={vendor.name} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Items — change quantity or remove before placing the order */}
          <SectionTitle
            right={
              <Pressable
                onPress={() => router.navigate("/(tabs)/gostore")}
                hitSlop={8}
              >
                <Text style={[styles.link, { color: c.primary }]}>
                  + Add more
                </Text>
              </Pressable>
            }
          >
            {`Items (${group.count})`}
          </SectionTitle>
          <Card style={styles.itemsCard}>
            {group.items.map((i, idx) => (
              <View
                key={i.inventoryId}
                style={[
                  styles.itemRow,
                  idx > 0 && { borderTopWidth: 1, borderTopColor: c.divider },
                ]}
              >
                <View
                  style={[styles.thumb, { backgroundColor: c.primarySoft }]}
                >
                  {i.image ? (
                    <Image
                      source={{ uri: i.image }}
                      style={styles.thumbImg}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons
                      name="cog-outline"
                      size={20}
                      color={c.textMuted}
                    />
                  )}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    numberOfLines={2}
                    style={[styles.itemName, { color: c.text }]}
                  >
                    {i.name}
                  </Text>
                  <Text style={[styles.itemUnit, { color: c.textMuted }]}>
                    {formatPrice(i.price)} each
                  </Text>
                  <Text style={[styles.itemTotal, { color: c.text }]}>
                    {formatPrice(i.price * i.quantity)}
                  </Text>
                  {i.available === false && (
                    <StatusPill text="No longer available" tone="bad" />
                  )}
                </View>
                <View style={styles.itemActions}>
                  <QtyStepper
                    value={i.quantity}
                    max={i.maxQty || 50}
                    onChange={(q) => setQty(i.inventoryId, q)}
                  />
                  <Pressable onPress={() => remove(i.inventoryId)} hitSlop={8}>
                    <Text style={[styles.removeText, { color: c.danger }]}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </Card>

          <SectionTitle>How do you want it?</SectionTitle>
          <OptionRow
            icon="bicycle-outline"
            title="Deliver to me"
            subtitle={
              !vendor.deliveryEnabled
                ? "This shop doesn't deliver"
                : !deliveryPossible
                  ? "Not available — the shop doesn't take payment for deliveries yet"
                  : vendor.deliveryCharge > 0
                    ? `Delivery charge ${formatPrice(vendor.deliveryCharge)}`
                    : "Free delivery"
            }
            selected={fulfilment === "DELIVERY"}
            disabled={!deliveryPossible}
            onPress={() => setFulfilment("DELIVERY")}
          />
          <OptionRow
            icon="storefront-outline"
            title="Pick up from shop"
            subtitle={`Collect from ${vendor.name}${vendor.city ? `, ${vendor.city}` : ""}`}
            selected={fulfilment === "PICKUP"}
            onPress={() => setFulfilment("PICKUP")}
          />

          <SectionTitle>
            {fulfilment === "DELIVERY"
              ? "Delivery address"
              : "Who will collect?"}
          </SectionTitle>
          <Card>
            <Field
              label="Full name"
              value={address.name}
              onChangeText={set("name")}
              error={errors.name}
              autoComplete="name"
            />
            <Field
              label="Mobile number"
              value={address.phone}
              onChangeText={set("phone")}
              error={errors.phone}
              keyboardType="phone-pad"
              maxLength={13}
              autoComplete="tel"
            />
            {fulfilment === "DELIVERY" && (
              <>
                <Field
                  label="House / street / area"
                  value={address.line1}
                  onChangeText={set("line1")}
                  error={errors.line1}
                  autoComplete="street-address"
                />
                <Field
                  label="Landmark (optional)"
                  value={address.landmark}
                  onChangeText={set("landmark")}
                />
                <View style={styles.twoCol}>
                  <Field
                    label="City"
                    value={address.city}
                    onChangeText={set("city")}
                    error={errors.city}
                    style={{ flex: 1 }}
                  />
                  <Field
                    label="Pincode"
                    value={address.pincode}
                    onChangeText={set("pincode")}
                    error={errors.pincode}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={{ width: 110 }}
                  />
                </View>
                <Field
                  label="State"
                  value={address.state}
                  onChangeText={set("state")}
                  error={errors.state}
                  style={{ marginBottom: 0 }}
                />
              </>
            )}
          </Card>

          <SectionTitle>Payment</SectionTitle>
          {paymentOptions.map((o) => (
            <OptionRow
              key={o.value}
              icon={o.icon}
              title={o.title}
              subtitle={o.subtitle}
              selected={payment === o.value}
              onPress={() => setPayment(o.value)}
            />
          ))}

          <SectionTitle>Order summary</SectionTitle>
          <Card>
            <Line
              label="Parts (incl. GST)"
              value={formatPrice(group.subtotal)}
              muted
            />
            {fulfilment === "DELIVERY" && (
              <Line
                label="Delivery"
                value={
                  deliveryCharge > 0 ? formatPrice(deliveryCharge) : "Free"
                }
                muted
              />
            )}
            <Line label="Total" value={formatPrice(total)} bold />
            <Text style={[styles.note, { color: c.textMuted }]}>
              The shop confirms the final GST invoice amount.
            </Text>
          </Card>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: c.surface,
              borderTopColor: c.border,
              paddingBottom: insets.bottom + 10,
            },
          ]}
        >
          <View>
            <Text style={[styles.footLabel, { color: c.textSecondary }]}>
              Total
            </Text>
            <Text style={[styles.footTotal, { color: c.text }]}>
              {formatPrice(total)}
            </Text>
          </View>
          <PrimaryButton
            title={payment === "UPI" ? "Continue to pay" : "Place order"}
            icon={payment === "UPI" ? "arrow-forward" : "checkmark"}
            loading={placing}
            disabled={unavailable || !payment}
            onPress={placeOrder}
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemsCard: { paddingVertical: 4 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImg: { width: "100%", height: "100%" },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemUnit: { fontSize: 12 },
  itemTotal: { fontSize: 14, fontWeight: "700" },
  itemActions: { alignItems: "center", gap: 6 },
  removeText: { fontSize: 12, fontWeight: "600" },
  link: { fontSize: 13, fontWeight: "700" },
  content: { padding: 16, paddingTop: 0, paddingBottom: 24 },
  twoCol: { flexDirection: "row", gap: 10 },
  divider: { height: 1, marginVertical: 8 },
  note: { fontSize: 11, marginTop: 6 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footLabel: { fontSize: 12 },
  footTotal: { fontSize: 20, fontWeight: "700" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  emptyText: { fontSize: 14 },
});
