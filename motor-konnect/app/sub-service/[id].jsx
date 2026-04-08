// app/sub-service/[id].jsx
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../src/services/apiClient";
import { useTheme } from "../../src/hooks/useTheme";

const { width } = Dimensions.get("window");

// ── Helpers ────────────────────────────────────────────────────────────────────

const calculateFinalPrice = (service) => {
  if (!service?.discountType || !service?.discountValue) return service?.price;
  if (service.discountType === "PERCENTAGE") {
    return Math.round(
      service.price - (service.price * service.discountValue) / 100,
    );
  }
  if (service.discountType === "FLAT") {
    return Math.max(service.price - service.discountValue, 0);
  }
  return service.price;
};

const getDiscountLabel = (service) => {
  if (!service?.discountType || !service?.discountValue) return null;
  return service.discountType === "PERCENTAGE"
    ? `${service.discountValue}% OFF`
    : `₹${service.discountValue} OFF`;
};

const StarRating = ({ rating = 4.5, count = 0, color }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <View style={ratingStyles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={
            i <= full
              ? "star"
              : half && i === full + 1
                ? "star-half"
                : "star-outline"
          }
          size={14}
          color="#f59e0b"
          style={{ marginRight: 1 }}
        />
      ))}
      {count > 0 && (
        <Text style={[ratingStyles.count, { color }]}>{count} reviews</Text>
      )}
    </View>
  );
};

const ratingStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
  count: { fontSize: 12, marginLeft: 6 },
});

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function SubServiceDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) loadService();
  }, [id]);

  const loadService = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(
        `/marketplace/services/${service.slug}/garages`,
      );
      setService(res.data);
    } catch (err) {
      console.log("DETAIL ERROR:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.textSecondary }]}
        >
          Loading service details…
        </Text>
      </SafeAreaView>
    );
  }

  // ── Error / Not Found ────────────────────────────────────────────────────────
  if (error || !service) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={52}
          color={theme.colors.textSecondary}
        />
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
          Service Not Found
        </Text>
        <Text
          style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}
        >
          This service may have been removed or is currently unavailable.
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
          onPress={loadService}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 12 }}
        >
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Data ─────────────────────────────────────────────────────────────────────
  const finalPrice = calculateFinalPrice(service);
  const discountLabel = getDiscountLabel(service);
  const hasDiscount = !!discountLabel;

  // Includes: use API data or fallback list
  const includes = service.includes?.length
    ? service.includes
    : [
        "Professional inspection by certified technician",
        "Genuine parts & quality materials",
        "Post-service quality check",
        "Digital service report",
      ];

  // Reviews: use API data or fallback
  const reviews = service.reviews?.length
    ? service.reviews
    : [
        {
          id: "r1",
          author: "Ramesh K.",
          rating: 5,
          comment: "Excellent service, very professional team.",
          date: "2 days ago",
        },
        {
          id: "r2",
          author: "Priya S.",
          rating: 4,
          comment: "Quick and reliable. Would recommend.",
          date: "1 week ago",
        },
      ];

  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      {/* ── Sticky Header ── */}
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

        <Text
          style={[styles.headerTitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {service.name}
        </Text>

        {/* Share placeholder */}
        <TouchableOpacity
          style={styles.headerRight}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="share-outline" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero Image */}
        <View style={styles.heroWrap}>
          <Image
            source={{
              uri:
                service.imageUrl ||
                "https://via.placeholder.com/800x400/1e293b/ffffff?text=Service",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Gradient overlay at bottom of image */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)"]}
            style={styles.heroGradient}
          />
          {/* Discount badge over image */}
          {hasDiscount && (
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{discountLabel}</Text>
            </View>
          )}
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Name + Rating */}
          <Text style={[styles.serviceName, { color: theme.colors.text }]}>
            {service.name}
          </Text>

          <View style={styles.ratingRow}>
            <StarRating
              rating={avgRating}
              count={reviews.length}
              color={theme.colors.textSecondary}
            />
            {service.duration && (
              <View style={styles.durationChip}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.durationText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {service.duration}
                </Text>
              </View>
            )}
          </View>

          {/* Pricing Card */}
          <View
            style={[
              styles.pricingCard,
              {
                backgroundColor:
                  theme.colors.card || theme.colors.surface || "#fff",
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.pricingLeft}>
              <Text
                style={[
                  styles.priceLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Service Price
              </Text>
              <View style={styles.priceAmountRow}>
                <Text
                  style={[styles.finalPrice, { color: theme.colors.primary }]}
                >
                  ₹{finalPrice}
                </Text>
                {hasDiscount && service.price && (
                  <Text style={styles.originalPrice}>₹{service.price}</Text>
                )}
              </View>
            </View>
            {hasDiscount && (
              <View
                style={[styles.savingsBadge, { backgroundColor: "#dcfce7" }]}
              >
                <Ionicons name="pricetag-outline" size={12} color="#16a34a" />
                <Text style={styles.savingsText}>
                  You save ₹{service.price - finalPrice}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              About This Service
            </Text>
            <Text
              style={[
                styles.description,
                { color: theme.colors.textSecondary },
              ]}
            >
              {service.description ||
                "This service includes a comprehensive inspection and professional execution by certified technicians, ensuring quality, reliability, and your complete peace of mind."}
            </Text>
          </View>

          {/* What's Included */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              What's Included
            </Text>
            <View
              style={[
                styles.includesCard,
                {
                  backgroundColor:
                    theme.colors.card || theme.colors.surface || "#fff",
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {includes.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.includeRow,
                    index < includes.length - 1 && {
                      borderBottomWidth: 0.5,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.includeIcon,
                      { backgroundColor: theme.colors.primary + "15" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text
                    style={[styles.includeText, { color: theme.colors.text }]}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Customer Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Customer Reviews
              </Text>
              <View style={styles.avgRatingWrap}>
                <Text
                  style={[styles.avgRatingNum, { color: theme.colors.text }]}
                >
                  {avgRating.toFixed(1)}
                </Text>
                <Ionicons name="star" size={14} color="#f59e0b" />
              </View>
            </View>

            {reviews.map((review, index) => (
              <View
                key={review.id}
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor:
                      theme.colors.card || theme.colors.surface || "#fff",
                    borderColor: theme.colors.border,
                    marginBottom: index < reviews.length - 1 ? 10 : 0,
                  },
                ]}
              >
                {/* Reviewer row */}
                <View style={styles.reviewerRow}>
                  <View
                    style={[
                      styles.reviewerAvatar,
                      { backgroundColor: theme.colors.primary + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reviewerInitial,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {review.author?.[0] || "?"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.reviewerName,
                        { color: theme.colors.text },
                      ]}
                    >
                      {review.author}
                    </Text>
                    <StarRating
                      rating={review.rating}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.reviewDate,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {review.date}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.reviewComment,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {review.comment}
                </Text>
              </View>
            ))}
          </View>

          {/* Bottom gap for sticky button */}
          <View style={{ height: 16 }} />
        </View>
      </ScrollView>

      {/* ── Sticky Book Button ── */}
      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.footerPriceWrap}>
          <Text
            style={[
              styles.footerPriceLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Total
          </Text>
          <Text style={[styles.footerPrice, { color: theme.colors.text }]}>
            ₹{finalPrice}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.88}
          onPress={() =>
            router.push({
              pathname: "/book",
              params: {
                externalServiceId: service.slug,
              },
            })
          }
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── States ──
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  loadingText: { fontSize: 14, marginTop: 8 },
  errorTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  errorSubtitle: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 12,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // ── Header ──
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  headerRight: { minWidth: 60, alignItems: "flex-end" },

  // ── Scroll ──
  scroll: { paddingBottom: 0 },

  // ── Hero ──
  heroWrap: {
    width: "100%",
    height: 220,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  heroBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "#16a34a",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // ── Content ──
  content: { padding: 16 },

  serviceName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 8,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: { fontSize: 12 },

  // ── Pricing Card ──
  pricingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pricingLeft: { gap: 4 },
  priceLabel: { fontSize: 11, fontWeight: "500" },
  priceAmountRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  finalPrice: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  originalPrice: {
    fontSize: 15,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  savingsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  savingsText: { color: "#16a34a", fontSize: 12, fontWeight: "700" },

  // ── Sections ──
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  description: { fontSize: 14, lineHeight: 22 },

  // ── Includes ──
  includesCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  includeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  includeIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  includeText: { fontSize: 14, flex: 1, lineHeight: 19 },

  // ── Reviews ──
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  avgRatingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  avgRatingNum: { fontSize: 16, fontWeight: "800" },
  reviewCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewerInitial: { fontSize: 14, fontWeight: "700" },
  reviewerName: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  reviewDate: { fontSize: 11 },
  reviewComment: { fontSize: 13, lineHeight: 19 },

  // ── Sticky Footer ──
  stickyFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
  },
  footerPriceWrap: { gap: 2 },
  footerPriceLabel: { fontSize: 11 },
  footerPrice: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
