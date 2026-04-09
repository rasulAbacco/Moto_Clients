// app/screens/service-garage.jsx  (APP SIDE)

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

const BASE_URL = "https://ld3bgq17-8000.inc1.devtunnels.ms/api/v1";

export default function ServiceGarageScreen() {
  const router = useRouter();
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
        headers: { "x-api-key": process.env.EXPO_PUBLIC_API_KEY },
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
        style={styles.card}
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
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {item.companyName || item.name || "Garage"}
          </Text>
          <Text style={styles.meta}>{item.address || "No address"}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#555" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0062ff" />
        <Text style={{ marginTop: 10 }}>Loading garages...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Garage</Text>
      </View>

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
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No garages available
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 16, borderBottomWidth: 0.5, borderColor: "#ddd" },
  title: { fontSize: 18, fontWeight: "700" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  name: { fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 12, color: "#666", marginTop: 4 },
});
