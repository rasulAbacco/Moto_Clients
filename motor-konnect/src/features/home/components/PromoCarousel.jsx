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
import { useTheme } from "../../../hooks/useTheme";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32; // full width minus side padding

// Default gradient sets for variety
const GRADIENTS = [
  ["#7c3aed", "#4f46e5"],
];

export default function PromoCarousel({ banners = [] }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  });

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });

  if (!banners.length) return null;

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12}
        snapToAlignment="start"
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const gradColors =
            item.gradient || GRADIENTS[index % GRADIENTS.length];
          return (
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => item.path && router.push(item.path)}
              style={styles.cardTouchable}
            >
              <LinearGradient
                colors={gradColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                {/* Badge */}
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}

                {/* Content */}
                <View style={styles.cardContent}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                </View>

                {/* CTA */}
                {item.cta && (
                  <View style={styles.ctaRow}>
                    <Text style={styles.ctaText}>{item.cta}</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color="rgba(255,255,255,0.9)"
                    />
                  </View>
                )}

                {/* Decorative circle */}
                <View style={styles.decorCircle} />
                <View style={styles.decorCircle2} />
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingLeft: 0, paddingRight: 12 }}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />

      {/* Pagination dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: theme.colors.primary,
                  width: activeIndex === index ? 20 : 6,
                  opacity: activeIndex === index ? 1 : 0.3,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
    marginBottom: 8,
  },
  cardTouchable: {
    marginRight: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: 170,
    borderRadius: 20,
    padding: 22,
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ctaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
  },
  // Decorative background circles
  decorCircle: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  decorCircle2: {
    position: "absolute",
    right: 30,
    bottom: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
