// app/sub-service/[id].jsx
//
// Reached by tapping a ServiceCard's body (not its Add button). Full
// detail view: image, description, price. Cart logic now goes through
// the shared useAddToCart hook instead of a copy-pasted Alert — same
// "different garage" conflict behavior as ServiceCard everywhere else.

import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../../src/services/apiClient";
import { useTheme } from "../../src/hooks/useTheme";
import useAppStore from "../../src/store/useAppStore";
import { useAddToCart } from "../../src/hooks/useAddToCart";
import { getServicePrice } from "../../src/utils/pricing";

const PRIMARY_BLUE = "#0062ff";

export default function SubServiceDetails() {
  const { id, garageId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const activeVehicleType = useAppStore((s) => s.activeVehicleType);
  const getGarageById = useAppStore((s) => s.getGarageById);
  const { addServiceToCart, isInCart, removeFromCart } = useAddToCart();

  const [service, setService] = useState(null);
  const [garage, setGarage] = useState(null);
  const [garageName, setGarageName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, [id, garageId]);

  const init = async () => {
    setLoading(true);
    try {
      const cachedGarage = getGarageById(garageId);
      let found = null;
      cachedGarage?.services?.forEach((main) => {
        main.sections?.forEach((section) => {
          section.services?.forEach((svc) => {
            if (String(svc.id) === String(id)) found = svc;
          });
        });
      });

      if (found) {
        setService(found);
        setGarage(cachedGarage);
        setGarageName(cachedGarage.companyName || cachedGarage.name);
        return;
      }

      // Confirmed-working route: GET /services/sub-services/:id
      // (used only if this service isn't found in the garage cache —
      // e.g. reached via a link that didn't carry a garageId).
      if (id) {
        const res = await api.get(`/services/sub-services/${id}`);
        setService(res.data);
        setGarageName(res.data?.section?.mainService?.name || null);
      }
    } catch (err) {
      console.log("INIT ERROR:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const { final: finalPrice, original: originalPrice } = service
    ? getServicePrice(service, activeVehicleType)
    : { final: 0, original: 0 };
  const hasDiscount = originalPrice > finalPrice;
  const added = service ? isInCart(service.id) : false;

  const handleAddToCart = () => {
    if (added) {
      removeFromCart(service.id);
      return;
    }
    addServiceToCart(
      {
        id: service.id,
        title: service.name,
        price: finalPrice,
        carType: activeVehicleType,
        image: service.image || null,
        source: "service",
        slug: service.slug,
        garageId,
        garageName,
        garage,
      },
      { onAdded: () => router.push("/cart") },
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Service not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {service.name}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <Image
            source={{
              uri:
                service.image ||
                "https://via.placeholder.com/800x400?text=Service",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{service.name}</Text>
            {garage?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={PRIMARY_BLUE}
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {garageName && (
            <View style={styles.garageLine}>
              <Ionicons name="storefront-outline" size={13} color="#8E8E93" />
              <Text style={styles.garageNameText}>{garageName}</Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{finalPrice}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.desc}>
            {service.description?.trim()
              ? service.description
              : "No description available"}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookBtn, added && styles.bookBtnAdded]}
          onPress={handleAddToCart}
        >
          <Text style={styles.bookText}>
            {added ? "Remove from Cart" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: 16,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  heroWrap: { height: 220 },
  heroImage: { width: "100%", height: "100%" },
  content: { padding: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 22, fontWeight: "700", flexShrink: 1 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedText: { fontSize: 10, fontWeight: "800", color: PRIMARY_BLUE },
  garageLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  garageNameText: { fontSize: 13, color: "#6B6B80", fontWeight: "600" },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },
  price: { fontSize: 22, fontWeight: "800", color: "green" },
  originalPrice: {
    fontSize: 14,
    color: "#ABABC0",
    textDecorationLine: "line-through",
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  desc: { fontSize: 14, lineHeight: 20 },
  footer: { padding: 16 },
  bookBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  bookBtnAdded: { backgroundColor: "#ef4444" },
  bookText: { color: "#fff", fontWeight: "700" },
});
