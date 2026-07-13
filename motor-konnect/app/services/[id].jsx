// app/services/[id].jsx
//
// FIXED from the previous draft: cart actions now go through your real
// `useCart()` hook (CartContext / CartProvider.jsx, AsyncStorage-backed)
// instead of useAppStore — that was the bug that made "Add to Cart" look
// like it silently did nothing (items went into a store nothing else read).
//
// CartProvider.addToCart() doesn't have built-in "different garage"
// conflict detection — that check has to happen here, same as your
// original file did it: inspect cartItems for an existing service/package
// from a different garage before adding, and prompt to clear if so.
//
// Data resolution (garage cache -> Prisma catalog fallback) is unchanged
// from the last version and still stands as-is.

import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../../src/services/apiClient";
import useAppStore from "../../src/store/useAppStore";
import { useCart } from "../../src/hooks/useCart";
import { getServicePrice } from "../../src/utils/pricing";

const C = {
  bg: "#FFFFFF",
  pageBg: "#F5F6FA",
  accent: "#0062ff",
  text: "#111118",
  textSub: "#6B6B80",
  textMuted: "#ABABC0",
};

function ServiceCard({
  service,
  index,
  onPress,
  garageId,
  garageName,
  garage,
  selectedCarType,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ✅ Real cart — same source CartScreen/CartBar read from
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();

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

  const { final: finalPrice, original: originalPrice } = getServicePrice(
    service,
    selectedCarType,
  );

  const executeAddToCart = () => {
    addToCart({
      id: service.id,
      title: service.name,
      price: finalPrice,
      carType: selectedCarType,
      image: service.image || null,
      source: "service",
      slug: service.slug,
      garageId,
      garageName,
      // ✅ FIX: CartScreen.proceedToNextStep() requires laborItem.garage
      // (the full object) in addition to garageId — without it, checkout
      // always shows "Missing Information."
      garage,
    });
  };

  const handleCartAction = () => {
    if (isAdded) {
      removeFromCart(service.id);
      return;
    }

    // ✅ Restored from your original file: CartProvider doesn't know about
    // "one garage at a time" — check it ourselves before adding.
    const existingLaborItem = cartItems.find(
      (i) => i.source === "service" || i.source === "package",
    );

    if (
      existingLaborItem &&
      String(existingLaborItem.garageId) !== String(garageId)
    ) {
      Alert.alert(
        "Replace Cart Items?",
        `Your cart contains services from "${existingLaborItem.garageName}". You can only select services from one garage at a time.\n\nClear your cart and add this service from "${garageName}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => {
              clearCart();
              executeAddToCart();
            },
          },
        ],
      );
      return;
    }

    executeAddToCart();
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
            {originalPrice > finalPrice && (
              <Text style={styles.oldPrice}>₹{originalPrice}</Text>
            )}
            <View style={styles.vehicleTypeTag}>
              <Text style={styles.vehicleTypeText}>{selectedCarType}</Text>
            </View>
          </View>

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

function Section({
  section,
  sectionIndex,
  router,
  garageId,
  garageName,
  garage,
  selectedCarType,
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
          key={`${service.id}-${idx}`}
          service={service}
          index={sectionIndex * 8 + idx}
          garageId={garageId}
          garageName={garageName}
          garage={garage}
          selectedCarType={selectedCarType}
          onPress={() =>
            router.push({
              pathname: "/sub-service/[id]",
              params: { id: service.id, garageId },
            })
          }
        />
      ))}
    </View>
  );
}

export default function ServiceDetailsScreen() {
  const { id, garageId, vehicleType } = useLocalSearchParams();
  const router = useRouter();

  const activeVehicleType = useAppStore((s) => s.activeVehicleType);
  const getGarageById = useAppStore((s) => s.getGarageById);
  const { cartItems, getTotal } = useCart(); // ✅ real cart for the bottom bar

  const [data, setData] = useState(null);
  const [garage, setGarage] = useState(null);
  const [garageName, setGarageName] = useState(null);
  const [loading, setLoading] = useState(true);
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    init();
  }, [id, garageId]);

  const init = async () => {
    setLoading(true);
    try {
      const cachedGarage = getGarageById(garageId);
      const mainService = cachedGarage?.services?.find(
        (m) => String(m.id) === String(id),
      );

      if (mainService) {
        setData(mainService);
        setGarage(cachedGarage);
        setGarageName(cachedGarage.companyName || cachedGarage.name);
      } else if (id) {
        // Confirmed-working route: GET /services/:id?vehicleType=
        // Taken when there's no garageId (Home's plain category browsing).
        const res = await api.get(`/services/${id}`, {
          params: { vehicleType: vehicleType || activeVehicleType },
        });
        setData(res.data);
      }

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

  if (loading) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!data)
    return (
      <SafeAreaView style={styles.centerScreen}>
        <Text>Service not found</Text>
      </SafeAreaView>
    );

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
          <View style={styles.infoBanner}>
            <Ionicons name="car-outline" size={16} color={C.accent} />
            <Text style={styles.infoBannerText}>
              Showing prices for {activeVehicleType}
            </Text>
          </View>
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
            selectedCarType={activeVehicleType}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartCount}>{cartItems.length} items</Text>
            <Text style={styles.cartTotal}>₹{getTotal()}</Text>
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
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 4,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#eef2ff",
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  infoBannerText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: C.accent,
  },
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
  vehicleTypeTag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vehicleTypeText: { fontSize: 10, color: "#6b7280", fontWeight: "700" },
  addBtn: {
    marginTop: 8,
    backgroundColor: "#0062ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addedBtn: { backgroundColor: "#ef4444" },
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
