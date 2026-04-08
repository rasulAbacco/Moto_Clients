//client\src\features\home\HomeScreen.jsx
import { Animated, StyleSheet, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useRef, useState, useEffect, useMemo } from "react";

import SectionRenderer from "./components/SectionRenderer";
import StickyHeader from "./components/StickyHeader";
import HomeHeader from "./components/HomeHeader";
import VehicleSelector from "./components/VehicleSelector";
import api from "../../services/apiClient";

import { useAuth } from "../../providers/AuthProvider";
import { useLoginSheet } from "../../providers/LoginSheetProvider";

export default function HomeScreen() {
  const { theme } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState("Car");

  const { user } = useAuth();
  const { openLoginSheet } = useLoginSheet();

  // Load services whenever vehicle type changes
  useEffect(() => {
    loadServices();
  }, [selectedVehicleType]);

  const loadServices = async () => {
    try {
      const res = await api.get(`/services?vehicleType=${selectedVehicleType}`);
      setServices(res.data);
    } catch (err) {
      console.log("ERROR:", err);
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

  const sections = useMemo(() => {
    return [
      { id: "carousel", type: "carousel" },
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
  }, [services, selectedVehicleType]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      {/* Search bar */}
      <StickyHeader scrollY={scrollY} />

      <Animated.FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.sectionWrapper}>
            <SectionRenderer section={item} />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.homeHeaderWrap}>
            <HomeHeader />
          </View>
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
