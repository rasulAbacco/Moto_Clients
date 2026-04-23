// CartScreen.jsx
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../hooks/useCart";
import { useTheme } from "../../hooks/useTheme";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { useLoginSheet } from "../../providers/LoginSheetProvider";

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyCart({ theme, router }) {
  return (
    <View style={emptyStyles.wrap}>
      <View
        style={[emptyStyles.iconWrap, { backgroundColor: theme.colors.card }]}
      >
        <Ionicons
          name="cart-outline"
          size={52}
          color={theme.colors.textSecondary}
        />
      </View>
      <Text style={[emptyStyles.title, { color: theme.colors.text }]}>
        Your cart is empty
      </Text>
      <Text style={[emptyStyles.sub, { color: theme.colors.textSecondary }]}>
        Add products from GoStore to get started
      </Text>
      <TouchableOpacity
        style={[emptyStyles.btn, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)/gostore");
          }
        }}
        activeOpacity={0.88}
      >
        <Ionicons name="storefront-outline" size={16} color="#fff" />
        <Text style={emptyStyles.btnText}>Browse Store</Text>
      </TouchableOpacity>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  iconWrap: {
    width: 90,
    height: 90,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  sub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});

// ── Cart item row ─────────────────────────────────────────────────────────────
function CartItem({ item, theme, addToCart, removeFromCart, onDelete }) {
  const subtotal =
    item.source === "service" ? item.price : item.price * item.quantity;
  return (
    <View
      style={[
        itemStyles.card,
        {
          backgroundColor: theme.colors.card || "#fff",
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          itemStyles.imageWrap,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={itemStyles.image}
            resizeMode="cover"
          />
        ) : (
          <Ionicons
            name="cube-outline"
            size={26}
            color={theme.colors.textSecondary}
          />
        )}
      </View>
      <View style={itemStyles.info}>
        {item.brand && (
          <Text
            style={[itemStyles.brand, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.brand}
          </Text>
        )}
        <Text
          style={[itemStyles.name, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {item.title || item.name}
        </Text>
        <Text style={[itemStyles.subtotal, { color: theme.colors.primary }]}>
          ₹{subtotal.toLocaleString("en-IN")}
        </Text>
        {item.source !== "service" && (
          <View style={itemStyles.qtyRow}>
            <TouchableOpacity
              style={[
                itemStyles.qtyBtn,
                {
                  backgroundColor: theme.colors.primary + "15",
                  borderColor: theme.colors.primary + "30",
                },
              ]}
              onPress={() => removeFromCart(item.id)}
            >
              <Ionicons name="remove" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={[itemStyles.qty, { color: theme.colors.text }]}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              style={[
                itemStyles.qtyBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => addToCart(item)}
            >
              <Ionicons name="add" size={14} color="#fff" />
            </TouchableOpacity>
            <Text
              style={[
                itemStyles.unitPrice,
                { color: theme.colors.textSecondary },
              ]}
            >
              ₹{item.price} each
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={itemStyles.deleteBtn}
        onPress={() => onDelete(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={16} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

const itemStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrap: {
    width: 76,
    height: 76,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  image: { width: "100%", height: "100%", borderRadius: 12 },
  info: { flex: 1, gap: 3 },
  brand: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  name: { fontSize: 14, fontWeight: "600", lineHeight: 19 },
  subtotal: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: 2,
  },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: { fontSize: 14, fontWeight: "700", minWidth: 18, textAlign: "center" },
  unitPrice: { fontSize: 11, marginLeft: 4 },
  deleteBtn: { justifyContent: "flex-start", paddingTop: 2 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function CartScreen() {
  const { cartItems, addToCart, removeFromCart, clearCart, getTotal } =
    useCart();
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { openLoginSheet } = useLoginSheet();

  // Flag to handle automatic navigation after login
  const [isPendingCheckout, setIsPendingCheckout] = useState(false);

  const total = getTotal();
  const hasService = cartItems.some((i) => i.source === "service");
  const cartType = hasService ? "service" : "store";
  const itemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const deliveryFee = cartType === "service" ? 0 : total > 499 ? 0 : 49;
  const grandTotal = total + deliveryFee;

  // Function to handle the actual navigation logic
  const proceedToNextStep = () => {
    if (cartType === "service") {
      const serviceItem = cartItems.find((i) => i.source === "service");

      if (!serviceItem?.garageId) {
        console.warn("No garage found in cart");
        return;
      }

      router.push({
        pathname: "/service-confirm",
        params: {
          garageId: serviceItem.garageId,
          name: serviceItem.garageName,
        },
      });
    } else {
      router.push("/checkout");
    }
  };

  // 🔄 Automatic navigation effect
  useEffect(() => {
    if (user && isPendingCheckout) {
      setIsPendingCheckout(false);
      proceedToNextStep();
    }
  }, [user, isPendingCheckout]);

  const handleCheckoutPress = () => {
    if (!user) {
      setIsPendingCheckout(true);
      openLoginSheet();
    } else {
      proceedToNextStep();
    }
  };

  const handleDeleteItem = (id) => {
    setTimeout(() => {
      removeFromCart(id);
    }, 0);
  };

  const renderHeader = () => (
    <View>
      <View
        style={[styles.pageHeader, { borderBottomColor: theme.colors.border }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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
          My Cart
        </Text>
        {cartItems.length > 0 ? (
          <TouchableOpacity
            onPress={clearCart}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.clearText, { color: "#ef4444" }]}>Clear</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ minWidth: 48 }} />
        )}
      </View>
      {cartItems.length > 0 && (
        <Text
          style={[styles.countLabel, { color: theme.colors.textSecondary }]}
        >
          {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
        </Text>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!cartItems.length) return null;
    return (
      <View style={styles.footer}>
        {cartType === "store" && (
          <View
            style={[
              styles.nudgeBanner,
              {
                backgroundColor: deliveryFee > 0 ? "#fef3c7" : "#dcfce7",
                borderColor: deliveryFee > 0 ? "#fde68a" : "#bbf7d0",
              },
            ]}
          >
            <Ionicons
              name={deliveryFee > 0 ? "bicycle-outline" : "checkmark-circle"}
              size={16}
              color={deliveryFee > 0 ? "#d97706" : "#16a34a"}
            />
            <Text
              style={[
                styles.nudgeText,
                deliveryFee === 0 && { color: "#16a34a" },
              ]}
            >
              {deliveryFee > 0
                ? `Add ₹${(500 - total).toLocaleString("en-IN")} more for FREE delivery`
                : "🎉 You've unlocked FREE delivery!"}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.card || "#fff",
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
            Order Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Subtotal ({itemCount} items)
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              ₹{total.toLocaleString("en-IN")}
            </Text>
          </View>
          {cartType === "store" && (
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Delivery Fee
              </Text>
              {deliveryFee === 0 ? (
                <View style={styles.freeRow}>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        textDecorationLine: "line-through",
                        color: theme.colors.textSecondary,
                        fontSize: 12,
                      },
                    ]}
                  >
                    ₹49
                  </Text>
                  <Text style={styles.freeText}>FREE</Text>
                </View>
              ) : (
                <Text
                  style={[styles.summaryValue, { color: theme.colors.text }]}
                >
                  ₹{deliveryFee}
                </Text>
              )}
            </View>
          )}
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
              ₹{grandTotal.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleCheckoutPress}
          activeOpacity={0.88}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Text
          style={[styles.secureText, { color: theme.colors.textSecondary }]}
        >
          🔒 Secure checkout · Easy returns
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, !cartItems.length && { flex: 1 }]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<EmptyCart theme={theme} router={router} />}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            theme={theme}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            onDelete={handleDeleteItem}
          />
        )}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 40 },
  pageHeader: {
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
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    minWidth: 48,
    textAlign: "right",
  },
  countLabel: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  footer: { paddingHorizontal: 16, gap: 14, marginTop: 8 },
  nudgeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  nudgeText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#92400e" },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: "600" },
  freeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  freeText: { color: "#16a34a", fontSize: 12, fontWeight: "800" },
  divider: { height: 0.5, marginVertical: 2 },
  totalLabel: { fontSize: 15, fontWeight: "700" },
  totalValue: { fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 16,
  },
  checkoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secureText: { fontSize: 12, textAlign: "center" },
});
