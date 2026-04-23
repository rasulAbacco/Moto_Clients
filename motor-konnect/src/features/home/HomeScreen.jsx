import { Animated, StyleSheet, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useRef, useState, useEffect, useMemo } from "react";

import SectionRenderer from "./components/SectionRenderer";
import StickyHeader from "./components/StickyHeader";
import HomeHeader from "./components/HomeHeader";
import api from "../../services/apiClient";

import { useAuth } from "../../providers/AuthProvider";
import { useLoginSheet } from "../../providers/LoginSheetProvider";

export default function HomeScreen() {
  const { theme } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);

  const [garages, setGarages] = useState([]);
  const [garageLoading, setGarageLoading] = useState(false);

  const [selectedVehicleType, setSelectedVehicleType] = useState("CAR");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth();
  const { openLoginSheet } = useLoginSheet();

  useEffect(() => {
    loadServices();
    loadGarages();
  }, [selectedVehicleType]);

  const loadServices = async () => {
    try {
      const [serviceRes, packageRes] = await Promise.all([
        api.get(`/services?vehicleType=${selectedVehicleType}`),
        api.get(`/packages?vehicleType=${selectedVehicleType}`),
      ]);

      setServices(serviceRes.data);
      setPackages(packageRes.data?.data || []);
    } catch (err) {
      console.log("❌ ERROR:", err);
    }
  };

  const BASE_URL = "https://ld3bgq17-8000.inc1.devtunnels.ms/api/v1";

  const loadGarages = async () => {
    try {
      setGarageLoading(true);

      const res = await fetch(`${BASE_URL}/external/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.EXPO_PUBLIC_API_KEY,
        },
      });

      const data = await res.json();

      // ✅ FIXED: clean extraction
      const garagesData = data?.data || [];

      // ✅ FIXED: filter only garages with services
      const filteredGarages = garagesData.filter(
        (g) => g.services && g.services.length > 0,
      );

      setGarages(filteredGarages);
    } catch (err) {
      console.log("❌ GARAGE ERROR:", err);
      setGarages([]);
    } finally {
      setGarageLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadServices(), loadGarages()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!user) {
      openLoginSheet();
    }
  }, []);

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return services;

    return services.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q) ||
        (s.section?.name || "").toLowerCase().includes(q),
    );
  }, [services, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const sections = useMemo(() => {
    if (isSearching) {
      return [{ id: "services", type: "services", data: filteredServices }];
    }

    return [
      { id: "carousel", type: "carousel", data: packages },

      {
        id: "vehicleSelector",
        type: "vehicleSelector",
        selected: selectedVehicleType,
        onChange: setSelectedVehicleType,
      },

      { id: "services", type: "services", data: services },

      {
        id: "garages",
        type: "garages",
        data: garages,
        loading: garageLoading,
      },

      { id: "membership", type: "membership" },
      { id: "curated", type: "curated", data: packages },
      { id: "assist", type: "assist" },
    ];
  }, [
    services,
    filteredServices,
    packages,
    garages,
    garageLoading,
    selectedVehicleType,
    isSearching,
  ]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      <StickyHeader
        scrollY={scrollY}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={() => setSearchQuery("")}
      />

      <Animated.FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.sectionWrapper}>
            <SectionRenderer section={item} />
          </View>
        )}
        ListHeaderComponent={
          !isSearching ? (
            <View style={styles.homeHeaderWrap}>
              <HomeHeader />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  homeHeaderWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
