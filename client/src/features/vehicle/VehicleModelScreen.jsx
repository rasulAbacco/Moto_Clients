import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/hooks/useTheme";
import { useEffect, useState } from "react";
import api from "../../services/apiClient.js";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

export default function VehicleModelScreen() {
  // ✅ Also accept the full brand object so we can forward it to specs
  const { type, brandId, brandData } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brandId) {
      fetchModels();
    }
 }, [brandId]);

  const fetchModels = async () => {
    try {
      const res = await api.get(`/vehicles/models/${brandId}`, {
      params: { type },
    });

      setModels(res.data);
    } catch (err) {
      console.log("Model fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = (model) => {
    router.push({
      pathname: "/vehicle/specs",
      params: {
      type,
      brandId,
      brandData,
      model: JSON.stringify(model),
    },
    });
  };

  const isDark = theme.dark;
  const surface = isDark ? "#1c1c1e" : "#ffffff";
  const textPrimary = isDark ? "#f5f5f5" : "#111111";
  const textSecondary = isDark ? "#8e8e93" : "#6b6b6b";
  const border = isDark ? "#3a3a3c" : "#e8e8e8";
  const accent = "#0037ff";
  const cardBg = isDark ? "#2c2c2e" : "#f9f9f9";

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: surface, borderColor: border, width: CARD_W },
      ]}
      onPress={() => handleSelectModel(item)}
      activeOpacity={0.72}
    >
      <View style={[styles.imageWrap, { backgroundColor: cardBg }]}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.modelImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.cardBody}>
        <Text
          style={[styles.modelName, { color: textPrimary }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: accent + "15" }]}>
            <Text style={[styles.badgeText, { color: accent }]}>Latest</Text>
          </View>
        </View>
      </View>
      <View style={[styles.arrowCircle, { backgroundColor: accent }]}>
        <Ionicons name="chevron-forward" size={12} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={accent}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          Select Model
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.heroWrap}>
        <Text style={[styles.heroEyebrow, { color: accent }]}>STEP 2 OF 3</Text>
        <Text style={[styles.heroTitle, { color: textPrimary }]}>
          Select your{"\n"}
          {type === "bike" ? "bike" : "car"} model
        </Text>
        <Text style={[styles.heroSub, { color: textSecondary }]}>
          {models.length} model{models.length !== 1 ? "s" : ""} available
        </Text>
      </View>

      <FlatList
        data={models}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="car-outline" size={48} color={textSecondary} />
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              No models available for this brand
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { minWidth: 44 },
  headerTitle: { fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  headerRight: { minWidth: 44 },
  heroWrap: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18 },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 5,
  },
  heroSub: { fontSize: 13, fontWeight: "500" },
  grid: { paddingHorizontal: 12, paddingBottom: 40 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  imageWrap: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  modelImage: { width: "85%", height: 90 },
  cardBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 6,
  },
  modelName: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  badgeRow: { flexDirection: "row" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  arrowCircle: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
