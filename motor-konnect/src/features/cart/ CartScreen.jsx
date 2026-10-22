import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../hooks/useCart";
import { useTheme } from "../../hooks/useTheme";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { useLoginSheet } from "../../providers/LoginSheetProvider";
import { safeBack } from "../../utils/navigation";
import ScreenHeader from "../../components/common/ScreenHeader";

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
        Add services or products to get started
      </Text>
      <TouchableOpacity
        style={[emptyStyles.btn, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.replace("/(tabs)/home")}
        activeOpacity={0.88}
      >
        <Ionicons name="home-outline" size={16} color="#fff" />
        <Text style={emptyStyles.btnText}>Browse Services</Text>
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
  // Labor items (Services/Packages) do not use quantity multipliers in UI
  const isLabor = item.source === "service" || item.source === "package";
  const subtotal = isLabor ? item.price : item.price * item.quantity;

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
            name={isLabor ? "construct-outline" : "cube-outline"}
            size={26}
            color={theme.colors.textSecondary}
          />
        )}
      </View>
      <View style={itemStyles.info}>
        <Text
          style={[itemStyles.name, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {item.title || item.name}
        </Text>

        {isLabor && item.garageName && (
          <Text
            style={{
              fontSize: 11,
              color: theme.colors.textSecondary,
              marginTop: 2,
            }}
          >
            {item.garageName}
          </Text>
        )}

        <Text style={[itemStyles.subtotal, { color: theme.colors.primary }]}>
          ₹{subtotal.toLocaleString("en-IN")}
        </Text>

        {!isLabor && (
          <View style={itemStyles.qtyRow}>
            <TouchableOpacity
              style={[
                itemStyles.qtyBtn,
                { backgroundColor: theme.colors.primary + "15" },
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
          </View>
        )}
      </View>
      <TouchableOpacity
        style={itemStyles.deleteBtn}
        onPress={() => onDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={16} color="#B3261E" />
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
    elevation: 2,
  },
  imageWrap: {
    width: 76,
    height: 76,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%", borderRadius: 12 },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontWeight: "600", lineHeight: 19 },
  subtotal: { fontSize: 16, fontWeight: "800", marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: { fontSize: 14, fontWeight: "700", minWidth: 18, textAlign: "center" },
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

  const [isPendingCheckout, setIsPendingCheckout] = useState(false);

  const total = getTotal();
  // ✅ Check for both service and package sources
  const isLaborCart = cartItems.some(
    (i) => i.source === "service" || i.source === "package",
  );
  const cartType = isLaborCart ? "service" : "store";
  const itemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const deliveryFee = cartType === "service" ? 0 : total > 499 ? 0 : 49;
  const grandTotal = total + deliveryFee;

  // Inside proceedToNextStep in CartScreen.jsx
  const proceedToNextStep = () => {
    const laborItem = cartItems.find(
      (i) => i.source === "service" || i.source === "package",
    );

    if (laborItem) {
      // ✅ Check for both garageId and the metadata object
      if (!laborItem.garageId || !laborItem.garage) {
        console.log("❌ DEBUG CART ITEM:", laborItem); // This helps you see the data in terminal
        Alert.alert(
          "Missing Information",
          "Garage metadata is missing. Please clear the cart and add the package again.",
        );
        return;
      }

      router.push({
        pathname: "/service-confirm",
        params: {
          garageId: laborItem.garageId,
          name: laborItem.garageName,
          garage:
            typeof laborItem.garage === "string"
              ? laborItem.garage
              : JSON.stringify(laborItem.garage),
        },
      });
    } else {
      router.push("/checkout");
    }
  };

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

  const renderHeader = () => (
    <ScreenHeader
      title="My Cart"
      onBack={() => safeBack(router)}
      right={
        cartItems.length > 0 ? (
          <TouchableOpacity onPress={clearCart} hitSlop={10}>
            <Text style={{ color: theme.colors.danger, fontWeight: "600" }}>
              Clear
            </Text>
          </TouchableOpacity>
        ) : null
      }
    />
  );

  const renderFooter = () => {
    if (!cartItems.length) return null;
    return (
      <View style={styles.footer}>
        {cartType === "store" && (
          <View
            style={[
              styles.nudgeBanner,
              { backgroundColor: deliveryFee > 0 ? "#F7F0E1" : "#E7F2EC" },
            ]}
          >
            <Ionicons
              name={deliveryFee > 0 ? "bicycle-outline" : "checkmark-circle"}
              size={16}
              color={deliveryFee > 0 ? "#B8862B" : "#2E7D5B"}
            />
            <Text style={styles.nudgeText}>
              {deliveryFee > 0
                ? `Add ₹${500 - total} for FREE delivery`
                : "Free delivery unlocked"}
            </Text>
          </View>
        )}

        <View
          style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}
        >
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
            Order Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={{ color: theme.colors.textSecondary }}>
              Subtotal ({itemCount} items)
            </Text>
            <Text style={{ color: theme.colors.text }}>
              ₹{total.toLocaleString("en-IN")}
            </Text>
          </View>
          {cartType === "store" && (
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.textSecondary }}>
                Delivery Fee
              </Text>
              <Text style={{ color: theme.colors.text }}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </Text>
            </View>
          )}
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>
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
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["left", "right"]}
    >
      {renderHeader()}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<EmptyCart theme={theme} router={router} />}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            theme={theme}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            onDelete={removeFromCart}
          />
        )}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  footer: { padding: 16, gap: 14 },
  nudgeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  nudgeText: { fontSize: 13, fontWeight: "600" },
  summaryCard: { borderRadius: 16, borderWidth: 0.5, padding: 16, gap: 10 },
  summaryTitle: { fontSize: 15, fontWeight: "700" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: { height: 0.5, marginVertical: 2 },
  totalLabel: { fontSize: 15, fontWeight: "700" },
  totalValue: { fontSize: 20, fontWeight: "800", color: "#1E3A5F" },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 16,
  },
  checkoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
