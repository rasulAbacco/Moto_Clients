import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import ServiceGrid from "../src/features/home/components/ServiceGrid";
import api from "../src/services/apiClient";

export default function GarageServices() {
  const { garageName } = useLocalSearchParams();

  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get(`/services`);
      setServices(res.data || []);
    } catch (err) {
      console.log("❌ SERVICE ERROR:", err.message);
      setServices([]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Text style={styles.title}>{garageName || "Garage"} Services</Text>

      <ServiceGrid services={services} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16, // ✅ better than full padding
    paddingTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
});
