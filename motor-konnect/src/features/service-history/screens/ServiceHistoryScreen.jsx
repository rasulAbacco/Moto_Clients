import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../../providers/AuthProvider";
import { useTheme } from "../../../hooks/useTheme";
import axios from "axios";

const BASE_URL = "https://moto-clients.onrender.com/api/v1";
// const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const STATUS_COLORS = {
  PENDING: "#f59e0b",
  ACCEPTED: "#10b981",
  REJECTED: "#ef4444",
  TIMEOUT: "#6b7280",
  CANCELLED: "#6b7280",
};

export default function ServiceHistoryScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      if (!user?.phone) return;
      const res = await axios.get(`${BASE_URL}/marketplace/my-bookings`, {
        params: { phone: user.phone },
      });
      if (res.data?.success) setBookings(res.data.data || []);
    } catch (err) {
      console.error("History fetch error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.card || "#fff", borderColor: theme.colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.serviceName, { color: theme.colors.text }]} numberOfLines={2}>
          {item.serviceName}
        </Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || "#6b7280" }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={[styles.garageName, { color: theme.colors.text }]}>🏪 {item.garageName}</Text>
      {item.garageAddress ? (
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>📍 {item.garageAddress}</Text>
      ) : null}

      <View style={styles.row}>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          🗓{" "}
          {new Date(item.scheduledAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
        {item.carType ? (
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>🚗 {item.carType}</Text>
        ) : null}
      </View>

      <Text style={[styles.price, { color: theme.colors.primary }]}>₹{item.finalPrice}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={["top"]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons
              name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
              size={22}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Service History</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      {/* HEADER — same pattern as SupportScreen */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Service History</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="receipt-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No bookings yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: { width: 40 },
  title: { fontSize: 20, fontWeight: "700" },
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 0.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  serviceName: { fontSize: 14, fontWeight: "700", flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  garageName: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  meta: { fontSize: 12, marginBottom: 2 },
  row: { flexDirection: "row", gap: 12, marginTop: 4 },
  price: { fontSize: 15, fontWeight: "700", marginTop: 8 },
  emptyText: { fontSize: 14, marginTop: 12 },
});