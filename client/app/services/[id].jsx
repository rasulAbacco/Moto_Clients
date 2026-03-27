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
import { useTheme } from "../../src/hooks/useTheme";
import { useCart } from "../../src/hooks/useCart";
// or correct relative path

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#FFFFFF",
  pageBg: "#F5F6FA",
  card: "#FFFFFF",
  cardBorder: "#EBEBF0",
  cardShadow: "#00000010",
  accent: "#0062ff",
  accentLight: "#FFF3EC",
  green: "#16A34A",
  greenLight: "#F0FDF4",
  text: "#111118",
  textSub: "#6B6B80",
  textMuted: "#ABABC0",
  sectionBg: "#F5F6FA",
  divider: "#F0F0F5",
  priceColor: "#006fff",
  oldPriceColor: "#ABABC0",
};

// ─── Price Display ─────────────────────────────────────────────────────────────
function PriceDisplay({
  finalPrice,
  originalPrice,
  hasDiscount,
  discountLabel,
}) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.finalPrice}>₹{finalPrice}</Text>

      {originalPrice && originalPrice !== finalPrice && (
        <Text style={styles.oldPrice}>₹{originalPrice}</Text>
      )}

      {hasDiscount && discountLabel && (
        <View style={styles.saveBadge}>
          <Text style={styles.saveBadgeText}>{discountLabel}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ service, onPress, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { addToCart, cartItems } = useCart();

  const isAdded = cartItems.some((item) => item.id === service.id);
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
      toValue: 0.975,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 7,
      useNativeDriver: true,
    }).start();

  const hasDiscount = !!(service.discountType && service.discountValue);

  const finalPrice = (() => {
    if (!hasDiscount) return service.price;
    if (service.discountType === "PERCENTAGE")
      return Math.round(
        service.price - (service.price * service.discountValue) / 100,
      );
    if (service.discountType === "FLAT")
      return Math.max(service.price - service.discountValue, 0);
    return service.price;
  })();

  const originalPrice =
    service.originalPrice || (hasDiscount ? service.price : null);

  const discountLabel = hasDiscount
    ? service.discountType === "PERCENTAGE"
      ? `${service.discountValue}% off`
      : `₹${service.discountValue} off`
    : null;

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

          <PriceDisplay
            finalPrice={finalPrice}
            originalPrice={originalPrice}
            hasDiscount={hasDiscount}
            discountLabel={discountLabel}
          />

          {/* ✅ ADD TO CART BUTTON */}
          <TouchableOpacity
            onPress={() =>
              addToCart({
                id: service.id,
                title: service.name,
                price: finalPrice,
                image: service.image || null,
                source: "service", // ✅ IMPORTANT
              })
            }
            style={[styles.addBtn, isAdded && styles.addedBtn]}
          >
            <Text style={styles.addBtnText}>
              {isAdded ? "Added" : "Add to Cart"}
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

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ section, sectionIndex, router }) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{section.name}</Text>
        <Text style={styles.sectionCount}>
          {section.services?.length ?? 0} services
        </Text>
      </View>

      {section.services.map((service, idx) => (
        <ServiceCard
          key={service.id}
          service={service}
          index={sectionIndex * 8 + idx}
          onPress={() => router.push(`/sub-service/${service.id}`)}
        />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { cartItems } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      const res = await api.get(`/services/${id}`);
      setData(res.data);
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
    } catch (e) {
      console.log("Error fetching service details", e.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.centerScreen} edges={["top"]}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // ─── Render Error ─────────────────────────────────────────────────────────
  if (!data) {
    return (
      <SafeAreaView style={styles.centerScreen} edges={["top"]}>
        <Ionicons name="alert-circle-outline" size={44} color={C.textMuted} />
        <Text style={styles.notFoundText}>Service not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: C.divider }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={C.accent}
          />
          {Platform.OS === "ios" && (
            <Text style={[styles.backLabel, { color: C.accent }]}>Back</Text>
          )}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.text }]}>Services</Text>
        <View style={styles.headerRight} />
      </View>

      {/* ─── Content ───────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Animated.View
          style={[
            styles.pageHeader,
            { opacity: titleFade, transform: [{ translateY: titleSlide }] },
          ]}
        >
          <Text style={styles.pageTitle}>{data.name}</Text>
          <Text style={styles.pageSubtitle}>
            {data.sections?.reduce(
              (acc, s) => acc + (s.services?.length ?? 0),
              0,
            )}{" "}
            services available
          </Text>
        </Animated.View>

        {/* Sections */}
        {data.sections.map((section, si) => (
          <Section
            key={section.id}
            section={section}
            sectionIndex={si}
            router={router}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
      {cartItems.length > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartCount}>
              {cartItems.length} items in cart
            </Text>
            <Text style={styles.cartTotal}>₹{total}</Text>
          </View>

          <TouchableOpacity
            style={styles.viewCartBtn}
            onPress={() => router.push("/cart")}
          >
            <Text style={styles.viewCartText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.pageBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 10, // Reduced top padding since header exists now
  },
  centerScreen: {
    flex: 1,
    backgroundColor: C.pageBg,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: C.textSub,
    fontSize: 14,
    marginTop: 6,
  },
  notFoundText: {
    color: C.textMuted,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 6,
  },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    backgroundColor: C.bg,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
  },
  backLabel: {
    fontSize: 16,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  headerRight: {
    minWidth: 60,
  },

  // ── Page header
  pageHeader: {
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: C.textSub,
    fontWeight: "500",
  },

  // ── Section
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 12,
    color: C.textSub,
    fontWeight: "500",
  },

  // ── Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
    lineHeight: 20,
  },
  arrowWrap: {
    marginLeft: 10,
  },

  // ── Price row
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: C.priceColor,
    letterSpacing: -0.3,
  },
  oldPrice: {
    fontSize: 13,
    fontWeight: "500",
    color: C.oldPriceColor,
    textDecorationLine: "line-through",
    textDecorationColor: C.oldPriceColor,
  },
  saveBadge: {
    backgroundColor: C.greenLight,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  saveBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.green,
  },
  addBtn: {
    marginTop: 8,
    backgroundColor: "#0062ff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  addedBtn: {
    backgroundColor: "#16A34A",
  },

  addBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cartBar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },

  cartCount: {
    color: "#fff",
    fontSize: 12,
  },

  cartTotal: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  viewCartBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  viewCartText: {
    fontWeight: "600",
  },
});
