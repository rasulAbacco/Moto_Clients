import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useEffect, useState, useRef } from "react";
import SectionHeader from "./SectionHeader";
import api from "../../../services/apiClient";

const { width } = Dimensions.get("window");

// Classic UI Dimensions
const CARD_WIDTH = width * 0.75;
const SPACING = 16;
const SIDE_SPACING = (width - CARD_WIDTH) / 2;

export default function PopularServicesCards() {
  const [services, setServices] = useState([]);
  const flatListRef = useRef(null);
  const scrollIndex = useRef(0);

  // Fetch Services
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await api.get(`/services`);
        setServices(res.data || []);
      } catch (err) {
        console.log("❌ SERVICE FETCH ERROR:", err.message);
      }
    };
    loadServices();
  }, []);

  // Prepare Loop Data (3x the data for seamless infinite feel)
  const carouselData = useMemo(() => {
    if (services.length === 0) return [];
    return [...services, ...services, ...services];
  }, [services]);

  // Auto-scroll logic
  useEffect(() => {
    if (carouselData.length === 0) return;

    // Start in the middle set of data
    const startIndex = services.length;
    scrollIndex.current = startIndex;

    // Small delay to ensure FlatList is mounted before initial scroll
    const initTimeout = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: startIndex,
        animated: false,
      });
    }, 100);

    const interval = setInterval(() => {
      if (!flatListRef.current) return;

      const nextIndex = scrollIndex.current + 1;
      const totalItems = carouselData.length;

      // If we reach the end of the third set, jump back to the middle set
      if (nextIndex >= totalItems - 1) {
        scrollIndex.current = services.length;
        flatListRef.current?.scrollToIndex({
          index: scrollIndex.current,
          animated: false,
        });
      } else {
        scrollIndex.current = nextIndex;
        flatListRef.current?.scrollToIndex({
          index: scrollIndex.current,
          animated: true,
        });
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(initTimeout);
    };
  }, [carouselData, services.length]);

  const renderItem = ({ item }) => (
    <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getServiceIcon(item.name)}
              size={24}
              color="#1A1D23"
            />
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#1E3A5F" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.categoryText}>PREMIUM SERVICE</Text>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.subtitle}>Professional-grade maintenance</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color="#1E3A5F" />
            <Text style={styles.ratingText}>4.9 (120+)</Text>
          </View>
          {/* <Ionicons name="arrow-forward-circle" size={32} color="#1A1D23" /> */}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionHeader title="Popular Services" />

      {carouselData.length === 0 ? (
        <View style={styles.loader}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={carouselData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + SPACING}
          snapToAlignment="center"
          decelerationRate="fast"
          // This padding ensures the cards stay centered
          contentContainerStyle={{
            paddingHorizontal: SIDE_SPACING,
          }}
          ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
          // getItemLayout prevents the "out of range" error by telling FlatList the size of items in advance
          getItemLayout={(data, index) => ({
            length: CARD_WIDTH + SPACING,
            offset: (CARD_WIDTH + SPACING) * index,
            index,
          })}
          // Optimization
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
}

function getServiceIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("tyre")) return "construct-outline";
  if (n.includes("battery")) return "flash-outline";
  if (n.includes("ac")) return "thermometer-outline";
  if (n.includes("wash")) return "sparkles-outline";
  return "settings-outline";
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  cardContainer: {
    paddingVertical: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    height: 185,
    borderWidth: 1,
    borderColor: "#E3E6EB",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F6F7F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E3E6EB",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6ECF3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1E3A5F",
    textTransform: "uppercase",
  },
  content: { marginTop: 10 },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8A919C",
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    color: "#1A1D23",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#636366",
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1D23",
  },
  loader: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#8A919C",
    fontSize: 14,
  },
});
