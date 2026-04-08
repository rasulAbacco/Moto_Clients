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

export default function ServiceGarageScreen() {
  const router = useRouter();

  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("SCREEN LOADED");
    fetchGarages();
  }, []);

  const fetchGarages = async () => {
    console.log("FETCH STARTED");

    try {
      const url = `${process.env.EXPO_PUBLIC_API_URL}/external/users`;

      console.log("API URL:", url);

      const res = await axios.get(url, {
        headers: {
          "x-api-key": process.env.EXPO_PUBLIC_API_KEY,
        },
        timeout: 10000,
      });

      console.log("RESPONSE RECEIVED");

      if (res?.data?.success) {
        setGarages(res.data.data || []);
      } else {
        console.log("Invalid response");
        setGarages([]);
      }
    } catch (err) {
      console.log("ERROR FULL:", err);
      console.log("ERROR MESSAGE:", err.message);
    } finally {
      console.log("FETCH FINISHED");
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/service-confirm",
          params: {
            garageId: item.email, // temporary unique id
            name: item.companyName,
          },
        })
      }
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.companyName}</Text>
        <Text style={styles.meta}>{item.address}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#555" />
    </TouchableOpacity>
  );

  // 🔄 Loading state
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Select Garage</Text>
      </View>

      <FlatList
        data={garages}
        keyExtractor={(item) => item.email}
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

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#ddd",
    marginBottom: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
  },

  meta: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
