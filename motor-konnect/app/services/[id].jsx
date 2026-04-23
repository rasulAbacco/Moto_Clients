// app/services/[id].jsx

import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../../src/services/apiClient";
import { useCart } from "../../src/hooks/useCart";

// ─── Tokens ─────────────────────────────────────────────
const C = {
  bg: "#FFFFFF",
  pageBg: "#F5F6FA",
  card: "#FFFFFF",
  cardBorder: "#EBEBF0",
  accent: "#0062ff",
  green: "#16A34A",
  greenLight: "#F0FDF4",
  text: "#111118",
  textSub: "#6B6B80",
  textMuted: "#ABABC0",
  divider: "#F0F0F5",
  priceColor: "#006fff",
  oldPriceColor: "#ABABC0",
};

// ─── Price Helper ───────────────────────────────────────
const getServicePrice = (service) => {
  if (service.price !== undefined && service.price !== null) {
    const hasDiscount = !!(service.discountType && service.discountValue);
    if (!hasDiscount) return service.price;
    if (service.discountType === "PERCENTAGE") {
      return Math.round(
        service.price - (service.price * service.discountValue) / 100,
      );
    }
    if (service.discountType === "FLAT") {
      return Math.max(service.price - service.discountValue, 0);
    }
    return service.price;
  }
  if (service.pricing && service.pricing.length > 0) {
    const prices = service.pricing.map((p) => p.price - (p.discount || 0));
    return Math.min(...prices);
  }
  return 0;
};

// ─── Service Card ───────────────────────────────────────
function ServiceCard({
  service,
  index,
  onPress,
  garageId,
  garageName,
  garage, // This is a string from params
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ✅ Added removeFromCart
  const { addToCart, removeFromCart, cartItems } = useCart();

  const isAdded = cartItems.find(
    (item) => String(item.id) === String(service.id),
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 55,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const finalPrice = getServicePrice(service);
  const hasDiscount = !!(service.discountType && service.discountValue);
  const originalPrice = hasDiscount ? service.price : null;
  const discountLabel = hasDiscount
    ? service.discountType === "PERCENTAGE"
      ? `${service.discountValue}% off`
      : `₹${service.discountValue} off`
    : null;

  // ✅ Toggle logic for Add/Remove
  const handleCartAction = () => {
    if (isAdded) {
      removeFromCart(service.id);
    } else {
      // Parse full garage object to store in cart
      let garageObject = {};
      try {
        garageObject = typeof garage === "string" ? JSON.parse(garage) : garage;
      } catch (e) {
        console.log("Error parsing garage context", e);
      }

      addToCart({
        id: service.id,
        title: service.name,
        price: finalPrice,
        image: service.image || null,
        source: "service",
        slug: service.slug,
        garageId,
        garageName,
        // ✅ Storing the full object so Confirm screen can see address/phone
        garage: garageObject,
      });
    }
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        marginBottom: 10,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={styles.card}
      >
        <View style={styles.cardBody}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.finalPrice}>₹{finalPrice}</Text>
            {originalPrice && originalPrice !== finalPrice && (
              <Text style={styles.oldPrice}>₹{originalPrice}</Text>
            )}
            {discountLabel && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{discountLabel}</Text>
              </View>
            )}
          </View>

          {/* ✅ UPDATED BUTTON: Supports both Adding and Removing */}
          <TouchableOpacity
            onPress={handleCartAction}
            style={[styles.addBtn, isAdded && styles.addedBtn]}
          >
            <Text style={styles.addBtnText}>
              {isAdded ? "Remove from Cart" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.arrowWrap}>
          <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Section ────────────────────────────────────────────
function Section({
  section,
  sectionIndex,
  router,
  garageId,
  garageName,
  garage,
}) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{section.name}</Text>
        <Text style={styles.sectionCount}>
          {section.services?.length ?? 0} services
        </Text>
      </View>
      {section.services?.map((service, idx) => (
        <ServiceCard
          key={service.id}
          service={service}
          index={sectionIndex * 8 + idx}
          garageId={garageId}
          garageName={garageName}
          garage={garage}
          onPress={() =>
            router.push({
              pathname: "/sub-service/[id]",
              params: { id: service.id, externalServiceId: service.slug },
            })
          }
        />
      ))}
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────
export default function ServiceDetailsScreen() {
  const { id, mainService, garageId, garageName, garage } =
    useLocalSearchParams();
  const router = useRouter();
  const { cartItems } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    if (mainService) {
      try {
        const parsed = JSON.parse(mainService);
        setData(parsed);
        setLoading(false);
        Animated.parallel([
          Animated.timing(titleFade, {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
          }),
          Animated.timing(titleSlide, {
            toValue: 0,
            duration: 380,
            useNativeDriver: true,
          }),
        ]).start();
      } catch {
        loadService();
      }
    } else if (id) {
      loadService();
    }
  }, [id, mainService]);

  const loadService = async () => {
    try {
      const res = await api.get(`/services/${id}`);
      setData(res.data);
    } catch (e) {
      console.log("Error fetching service details", e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <Text>Service not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={C.accent}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.name}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <Animated.View
          style={{
            opacity: titleFade,
            transform: [{ translateY: titleSlide }],
          }}
        >
          <Text style={styles.pageTitle}>{data.name}</Text>
        </Animated.View>

        {data.sections?.map((section, si) => (
          <Section
            key={section.id}
            section={section}
            sectionIndex={si}
            router={router}
            garageId={garageId}
            garageName={garageName}
            garage={garage}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartCount}>{cartItems.length} items</Text>
            <Text style={styles.cartTotal}>₹{total}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/cart")}>
            <Text style={styles.viewCartText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.pageBg },
  scrollView: { flex: 1 },
  centerScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", marginLeft: 10 },
  pageTitle: { fontSize: 22, fontWeight: "800", marginVertical: 16 },
  sectionBlock: { marginBottom: 24 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  sectionCount: { fontSize: 12, color: "#666" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  cardBody: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: "600" },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  finalPrice: { fontSize: 16, fontWeight: "700", color: "#006fff" },
  oldPrice: { textDecorationLine: "line-through", color: "#999", fontSize: 13 },
  saveBadge: {
    backgroundColor: "#e6f7ed",
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  saveBadgeText: { color: "#16A34A", fontSize: 11, fontWeight: "600" },
  addBtn: {
    marginTop: 8,
    backgroundColor: "#0062ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addedBtn: { backgroundColor: "#ef4444" }, // Red for "Remove"
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  arrowWrap: { justifyContent: "center", paddingLeft: 8 },
  cartBar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartCount: { color: "#9CA3AF", fontSize: 12 },
  cartTotal: { color: "#fff", fontWeight: "700", fontSize: 16 },
  viewCartText: { color: "#60A5FA", fontWeight: "700" },
});
