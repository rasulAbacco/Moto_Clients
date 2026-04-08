import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo, useEffect } from "react";
import { useTheme } from "../../../src/hooks/useTheme.js";
import api from "../../services/apiClient.js";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48) / 3;

const ACCENT_COLORS = [
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#533483",
  "#2d6a4f",
  "#1b4332",
  "#6d4c41",
  "#37474f",
];

export default function VehicleBrandScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { theme } = useTheme();

  const [query, setQuery] = useState("");
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type) {
      fetchBrands();
    }
  }, [type]);

  const fetchBrands = async () => {
    try {
      const res = await api.get("/vehicles/brands", {
        params: { type },
      });

      setBrands(res.data);
    } catch (err) {
      console.log("Brand fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return brands;
    return brands.filter((b) =>
      b.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, brands]);

  const isDark = theme.dark;
  const surface = isDark ? "#1c1c1e" : "#ffffff";
  const cardBg = isDark ? "#2c2c2e" : "#f8f8f8";
  const textPrimary = isDark ? "#f5f5f5" : "#111111";
  const textSecondary = isDark ? "#8e8e93" : "#6b6b6b";
  const border = isDark ? "#3a3a3c" : "#e8e8e8";
  const accent = "#0044ff";

  const renderItem = ({ item, index }) => {
    const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: surface,
            borderColor: border,
            width: CARD_SIZE,
          },
        ]}
        onPress={() =>
          router.push({
            pathname: "/vehicle/model",
            params: {
            type,
            brandId: item.id,
            brandData: JSON.stringify({
              name: item.name,
              logoUrl: item.logoUrl,
            }),
          },
          })
        }
        activeOpacity={0.7}
      >
        <View style={[styles.logoCircle, { backgroundColor: color + "18" }]}>
          <Image
            source={{ uri: item.logoUrl }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text
          style={[styles.brandName, { color: textPrimary }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={accent}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          Select Brand
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Hero */}
      <View style={styles.heroWrap}>
        <Text style={[styles.heroEyebrow, { color: accent }]}>
          VEHICLE SETUP
        </Text>
        <Text style={[styles.heroTitle, { color: textPrimary }]}>
          What car do{"\n"}you drive?
        </Text>
        <Text style={[styles.heroSub, { color: textSecondary }]}>
          We'll personalise services for your vehicle
        </Text>
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchWrap,
          { backgroundColor: cardBg, borderColor: border },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={17}
          color={textSecondary}
          style={{ marginRight: 10 }}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search brands..."
          placeholderTextColor={textSecondary + "90"}
          style={[styles.searchInput, { color: textPrimary }]}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={17} color={textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <Text style={[styles.countLabel, { color: textSecondary }]}>
        {filtered.length} brand{filtered.length !== 1 ? "s" : ""} available
      </Text>

      {/* Brand Grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        numColumns={3}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
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

  heroWrap: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: { fontSize: 14, lineHeight: 20 },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontSize: 14 },

  countLabel: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  grid: { paddingHorizontal: 12, paddingBottom: 40 },
  columnWrapper: { gap: 8, marginBottom: 8 },

  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 6,
    // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoImage: { width: 34, height: 34 },
  brandName: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
