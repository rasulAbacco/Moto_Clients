// motor-konnect\app\service-garage.jsx

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../src/hooks/useTheme";
import ScreenHeader from "../src/components/common/ScreenHeader";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.3:8000/api/v1";

export default function ServiceGarageScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.colors;
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGarages();
  }, []);

  const fetchGarages = async () => {
    try {
      const url = `${BASE_URL}/external/users`;
      console.log("Fetching garages from:", url);

      const res = await axios.get(url, {
        headers: {
          "x-api-key":
            process.env.EXPO_PUBLIC_API_KEY || "your_super_secret_key_here",
        },
        timeout: 10000,
      });

      if (res?.data?.success) {
        const data = res.data.data || [];

        // ✅ LOG THE FIRST ITEM so we can see exact field names from API
        if (data.length > 0) {
          console.log("GARAGE ITEM FIELDS:", JSON.stringify(data[0]));
        }

        setGarages(data);
      } else {
        setGarages([]);
      }
    } catch (err) {
      console.log("Garage fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    // ✅ Try every possible id field the API might return
    // After you see the log above, replace this with the correct field
    const garageId =
      item.id ?? item.userId ?? item._id ?? item.garageId ?? index;
    const uniqueKey = String(garageId) + "_" + index; // guaranteed unique even if id missing

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.card,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
        onPress={() =>
          router.push({
            pathname: "/service-confirm",
            params: {
              garageId: garageId, // CRM User.id integer
              name: item.companyName,
            },
          })
        }
      >
        <View style={[styles.avatar, { backgroundColor: c.primaryLight }]}>
          <Ionicons name="business-outline" size={20} color={c.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.text }]}>
            {item.companyName || item.name || "Garage"}
          </Text>
          <Text
            style={[styles.meta, { color: c.textSecondary }]}
            numberOfLines={2}
          >
            {item.address || "No address"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <ScreenHeader title="Select Garage" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={{ marginTop: 10, color: c.textSecondary }}>
            Loading garages…
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: c.background }]}
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        title="Select Garage"
        subtitle={garages.length ? `${garages.length} available` : undefined}
      />

      <FlatList
        data={garages}
        // ✅ FIXED: was String(item.id) which crashed when id was undefined
        // Now uses index as guaranteed fallback so FlatList never crashes
        keyExtractor={(item, index) =>
          item.id != null
            ? String(item.id)
            : item.userId != null
              ? String(item.userId)
              : String(index)
        }
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 48 }}>
            <Ionicons name="business-outline" size={36} color={c.textMuted} />
            <Text style={{ marginTop: 10, color: c.textSecondary }}>
              No garages available right now
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 13, marginTop: 3, lineHeight: 18 },
});
