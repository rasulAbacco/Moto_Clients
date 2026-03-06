import { Animated, StyleSheet, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useRef, useState, useEffect, useMemo } from "react";

import SectionRenderer from "./components/SectionRenderer";
import StickyHeader from "./components/StickyHeader";
import api from "../../services/apiClient";

import { useAuth } from "../../providers/AuthProvider";
import { useLoginSheet } from "../../providers/LoginSheetProvider";

export default function HomeScreen() {
  const { theme } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState([]);

  const { user } = useAuth();
  const { openLoginSheet } = useLoginSheet();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await api.get("/services");
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

  const handleProtectedAction = () => {
    if (!user) {
      openLoginSheet();
      return;
    }
    // continue protected logic
  };

  const sections = useMemo(() => {
    return [
      { id: "carousel", type: "carousel" },
      { id: "services", type: "services", data: services },
      { id: "membership", type: "membership" },
      { id: "curated", type: "curated" },
      { id: "assist", type: "assist" },
    ];
  }, [services]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      <Animated.FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.sectionWrapper}>
            <SectionRenderer section={item} />
          </View>
        )}
        ListHeaderComponent={<StickyHeader scrollY={scrollY} />}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
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
  sectionWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
