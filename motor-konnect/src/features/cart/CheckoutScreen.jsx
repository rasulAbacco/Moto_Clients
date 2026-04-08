import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { useTheme } from "../../hooks/useTheme";
import { useRouter } from "expo-router";

const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI",
    icon: "flash-outline",
    sub: "PhonePe, GPay, Paytm",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    icon: "card-outline",
    sub: "Visa, Mastercard, RuPay",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    icon: "business-outline",
    sub: "All major banks",
  },
  {
    id: "wallet",
    label: "GoApp Wallet",
    icon: "wallet-outline",
    sub: "Balance: ₹4,550",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    icon: "cash-outline",
    sub: "Pay when delivered",
  },
];

function SectionCard({ title, icon, children, theme }) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name={icon}
          size={15}
          color={theme.colors.primary}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
        >
          {title.toUpperCase()}
        </Text>
      </View>
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: theme.colors.card || "#fff",
            borderColor: theme.colors.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default function CheckoutScreen() {
  const { cartItems, getTotal, clearCart } = useCart();
  const { theme } = useTheme();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [placing, setPlacing] = useState(false);

  const subtotal = getTotal();
  const hasService = cartItems.some((i) => i.source === "service");
  const cartType = hasService ? "service" : "store";
  const deliveryFee = subtotal > 499 ? 0 : 49;
  const grandTotal = subtotal + deliveryFee;
  const itemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    clearCart();
    setPlacing(false);
    Alert.alert(
      "Order Placed! 🎉",
      "Your order has been confirmed. You'll receive a notification when it's shipped.",
      [
        {
          text: "Continue Shopping",
          onPress: () => router.replace("/(tabs)/gostore"),
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={theme.colors.primary}
          />
          {Platform.OS === "ios" && (
            <Text style={[styles.backLabel, { color: theme.colors.primary }]}>
              Back
            </Text>
          )}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Checkout
        </Text>
        <View style={{ minWidth: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Delivery Address */}
        <SectionCard
          title="Delivery Address"
          icon="location-outline"
          theme={theme}
        >
          <View style={styles.addressRow}>
            <View
              style={[
                styles.addressIcon,
                { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Ionicons
                name="home-outline"
                size={18}
                color={theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.addressName, { color: theme.colors.text }]}>
                Home
              </Text>
              <Text
                style={[
                  styles.addressText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                123, MG Road, Bengaluru, Karnataka – 560001
              </Text>
            </View>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.changeBtn, { color: theme.colors.primary }]}>
                Change
              </Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* Order Items */}
        <SectionCard
          title={`Order Items (${itemCount})`}
          icon="cube-outline"
          theme={theme}
        >
          {cartItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.orderItem,
                index < cartItems.length - 1 && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.orderItemDot,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Ionicons
                  name="cube-outline"
                  size={14}
                  color={theme.colors.primary}
                />
              </View>
              <Text
                style={[styles.orderItemName, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.title || item.name}
              </Text>
              <Text
                style={[
                  styles.orderItemQty,
                  { color: theme.colors.textSecondary },
                ]}
              >
                ×{item.quantity}
              </Text>
              <Text
                style={[styles.orderItemPrice, { color: theme.colors.text }]}
              >
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </Text>
            </View>
          ))}
        </SectionCard>

        {/* Payment Method */}
        <SectionCard title="Payment Method" icon="card-outline" theme={theme}>
          {PAYMENT_METHODS.map((m, index) => {
            const isSelected = paymentMethod === m.id;
            const isLast = index === PAYMENT_METHODS.length - 1;
            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.paymentRow,
                  !isLast && {
                    borderBottomWidth: 0.5,
                    borderBottomColor: theme.colors.border,
                  },
                  isSelected && {
                    backgroundColor: theme.colors.primary + "08",
                  },
                ]}
                onPress={() => setPaymentMethod(m.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.payIcon,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primary + "20"
                        : theme.colors.background,
                    },
                  ]}
                >
                  <Ionicons
                    name={m.icon}
                    size={18}
                    color={
                      isSelected
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.payLabel,
                      {
                        color: isSelected
                          ? theme.colors.primary
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {m.label}
                  </Text>
                  <Text
                    style={[
                      styles.paySub,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {m.sub}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </SectionCard>

        {/* Price Summary */}
        <SectionCard title="Price Summary" icon="receipt-outline" theme={theme}>
          <View style={styles.priceRow}>
            <Text
              style={[styles.priceLabel, { color: theme.colors.textSecondary }]}
            >
              Subtotal ({itemCount} items)
            </Text>
            <Text style={[styles.priceVal, { color: theme.colors.text }]}>
              ₹{subtotal.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text
              style={[styles.priceLabel, { color: theme.colors.textSecondary }]}
            >
              {cartType === "service" ? "Service Charge" : "Delivery Fee"}
            </Text>
            {deliveryFee === 0 ? (
              <Text style={styles.freeText}>FREE</Text>
            ) : (
              <Text style={[styles.priceVal, { color: theme.colors.text }]}>
                ₹{deliveryFee}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.priceDivider,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              Total Payable
            </Text>
            <Text style={[styles.totalVal, { color: theme.colors.primary }]}>
              ₹{grandTotal.toLocaleString("en-IN")}
            </Text>
          </View>
        </SectionCard>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
            paddingBottom: Platform.OS === "ios" ? 30 : 16,
          },
        ]}
      >
        <View style={styles.footerAmount}>
          <Text
            style={[styles.footerLabel, { color: theme.colors.textSecondary }]}
          >
            Total Payable
          </Text>
          <Text style={[styles.footerTotal, { color: theme.colors.text }]}>
            ₹{grandTotal.toLocaleString("en-IN")}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.placeBtn,
            { backgroundColor: theme.colors.primary },
            placing && { opacity: 0.8 },
          ]}
          onPress={handlePlaceOrder}
          disabled={placing}
          activeOpacity={0.88}
        >
          {placing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.placeBtnText}>Place Order</Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#fff"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: { flexDirection: "row", alignItems: "center", minWidth: 60 },
  backLabel: { fontSize: 16, marginLeft: 2 },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  scroll: { paddingHorizontal: 16, paddingBottom: 8, paddingTop: 8 },

  sectionWrap: { marginBottom: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  // Address
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  addressName: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  addressText: { fontSize: 13, lineHeight: 18 },
  changeBtn: { fontSize: 13, fontWeight: "600" },

  // Order items
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  orderItemDot: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  orderItemName: { flex: 1, fontSize: 13, fontWeight: "500" },
  orderItemQty: { fontSize: 12 },
  orderItemPrice: { fontSize: 13, fontWeight: "700" },

  // Payment
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  payIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  payLabel: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  paySub: { fontSize: 11 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 9, height: 9, borderRadius: 5 },

  // Price
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  priceLabel: { fontSize: 13 },
  priceVal: { fontSize: 13, fontWeight: "600" },
  freeText: { color: "#16a34a", fontSize: 12, fontWeight: "800" },
  priceDivider: { height: 0.5, marginHorizontal: 14 },
  totalLabel: { fontSize: 15, fontWeight: "700" },
  totalVal: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 0.5,
  },
  footerAmount: { gap: 2 },
  footerLabel: { fontSize: 11 },
  footerTotal: { fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  placeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 160,
    justifyContent: "center",
  },
  placeBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
