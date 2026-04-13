import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.92;

export default function PremiumPromoCarousel({ banners = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1 >= banners.length ? 0 : activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, banners]);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  });

  if (!banners.length) return null;

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.95} style={styles.cardWrapper}>
            <LinearGradient
              colors={["#1e1b4b", "#312e81", "#4338ca"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Header: Title & Price */}
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                  {item?.name}
                </Text>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>₹{item?.price}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.description} numberOfLines={2}>
                {item?.description}
              </Text>

              {/* ✅ LIMIT SERVICES TO 2 */}
              <View style={styles.servicesBox}>
                {item?.services?.slice(0, 2).map((s, i) => (
                  <View key={i} style={styles.serviceRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#4ade80"
                    />
                    <Text style={styles.serviceText} numberOfLines={1}>
                      {s?.serviceName}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Footer: Garage & CTA */}
              <View style={styles.footer}>
                <View style={styles.garageInfo}>
                  <Ionicons
                    name="shield-checkmark"
                    size={14}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text style={styles.garageName} numberOfLines={1}>
                    {item?.garageName}
                  </Text>
                </View>

                <TouchableOpacity style={styles.btn}>
                  <Text style={styles.btnText}>Book Now</Text>
                  <Ionicons name="arrow-forward" size={14} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Decorative Circle */}
              <View style={styles.decor} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      />

      {/* Pagination dots */}
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: activeIndex === i ? 20 : 6,
                opacity: activeIndex === i ? 1 : 0.3,
                backgroundColor: "#4338ca",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 10 },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 16,
    borderRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  card: {
    height: 190, // Reduced height since we only show 2 services
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    marginRight: 10,
  },
  priceBadge: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  priceText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  description: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  servicesBox: { marginTop: 8, gap: 5 },
  serviceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  serviceText: { color: "#e2e8f0", fontSize: 12, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  garageInfo: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  garageName: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
  },
  btn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    gap: 5,
  },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  decor: {
    position: "absolute",
    bottom: -50,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    gap: 6,
  },
  dot: { height: 6, borderRadius: 3 },
});
