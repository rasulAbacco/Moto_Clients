// client/src/features/home/HomeScreen.jsx
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

  const [selectedVehicleType, setSelectedVehicleType] = useState("Car");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth();
  const { openLoginSheet } = useLoginSheet();

  useEffect(() => {
    loadServices();
  }, [selectedVehicleType]);

  const loadServices = async () => {
    try {
      const [serviceRes, packageRes] = await Promise.all([
        api.get(`/services?vehicleType=${selectedVehicleType}`),
        api.get(`/packages?vehicleType=${selectedVehicleType.toUpperCase()}`),
      ]);

      console.log("🚀 SERVICES:", serviceRes.data);
      console.log("🚀 PACKAGES API:", packageRes.data);

      setServices(serviceRes.data);
      setPackages(packageRes.data?.data || []);

      console.log("✅ PACKAGES STATE SET:", packageRes.data?.data);
    } catch (err) {
      console.log("❌ ERROR:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!user) {
      openLoginSheet();
    }
  }, []);

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q) ||
        (s.section?.name || "").toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const sections = useMemo(() => {
    if (isSearching) {
      // When searching, only show the service grid (filtered)
      return [
        { id: "services", type: "services", data: filteredServices },
      ];
    }

    return [
      // ✅ IMPORTANT FIX → pass data
      { id: "carousel", type: "carousel", data: packages },

      {
        id: "vehicleSelector",
        type: "vehicleSelector",
        selected: selectedVehicleType,
        onChange: setSelectedVehicleType,
      },

      { id: "services", type: "services", data: services },
      { id: "membership", type: "membership" },
      { id: "curated", type: "curated" },
      { id: "assist", type: "assist" },
    ];
  }, [services, filteredServices,packages, selectedVehicleType, isSearching]);

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
        renderItem={({ item }) => {
          console.log("🎯 RENDER SECTION:", item.type, item.data);
          return (
            <View style={styles.sectionWrapper}>
              <SectionRenderer section={item} />
            </View>
          );
        }}
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
          { useNativeDriver: false }
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