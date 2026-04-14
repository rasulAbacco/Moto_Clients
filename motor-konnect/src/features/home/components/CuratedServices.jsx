import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SectionHeader from "./SectionHeader.jsx";

const REVIEWS = [
  {
    id: 1,
    name: "Rahul Sharma",
    rating: 5,
    text: "Very smooth booking experience. Service was done on time.",
  },
  {
    id: 2,
    name: "Amit Verma",
    rating: 5,
    text: "Loved the doorstep service. Highly recommended!",
  },
  {
    id: 3,
    name: "Sneha Patil",
    rating: 4,
    text: "Booking was easy and quick. Good service.",
  },
  {
    id: 4,
    name: "Rohit Kumar",
    rating: 5,
    text: "Best prices and very professional team.",
  },
  {
    id: 5,
    name: "Priya Nair",
    rating: 5,
    text: "AC service was excellent. Cooling improved a lot.",
  },
  {
    id: 6,
    name: "Kiran Reddy",
    rating: 4,
    text: "Good service and timely updates.",
  },
];

const LOOP_DATA = [...REVIEWS, ...REVIEWS];
const CARD_WIDTH = 190;
const GAP = 15;
const TOTAL_WIDTH = (CARD_WIDTH + GAP) * REVIEWS.length;

export default function CuratedServices() {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);
  const pauseTimer = useRef(null);
  const isAnimating = useRef(false);

  // Track current position for seamless resume
  useEffect(() => {
    const listener = translateX.addListener(({ value }) => {
      currentOffset.current = value;
    });
    return () => translateX.removeListener(listener);
  }, []);

  const startAnimation = (startVal) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const remaining = TOTAL_WIDTH + startVal;
    const duration = (remaining / TOTAL_WIDTH) * 15000;

    Animated.timing(translateX, {
      toValue: -TOTAL_WIDTH,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      isAnimating.current = false;
      if (finished) {
        translateX.setValue(0);
        startAnimation(0);
      }
    });
  };

  useEffect(() => {
    startAnimation(0);
    return () => {
      translateX.stopAnimation();
      clearTimeout(pauseTimer.current);
    };
  }, []);

  const handleTouchIn = () => {
    translateX.stopAnimation();
    isAnimating.current = false;

    // Clear any existing timer
    clearTimeout(pauseTimer.current);

    // ✅ FORCE START after 10 seconds even if finger is still down
    pauseTimer.current = setTimeout(() => {
      startAnimation(currentOffset.current);
    }, 10000);
  };

  const handleTouchOut = () => {
    clearTimeout(pauseTimer.current);
    // Resume immediately when finger is removed
    startAnimation(currentOffset.current);
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Customer Reviews" />

      <View
        style={styles.scrollWrapper}
        onTouchStart={handleTouchIn}
        onTouchEnd={handleTouchOut}
      >
        <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
          {LOOP_DATA.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={12}
                      color={i < item.rating ? "#EAB308" : "#CBD5E1"}
                    />
                  ))}
                </View>
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              </View>

              <Text style={styles.text} numberOfLines={3}>
                "{item.text}"
              </Text>

              <View style={styles.footer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.verified}>VERIFIED</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12 },
  scrollWrapper: { overflow: "hidden", paddingVertical: 10 },
  row: { flexDirection: "row", gap: GAP },
  card: {
    width: CARD_WIDTH,
    height: 130,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stars: { flexDirection: "row", gap: 2 },
  text: {
    color: "#334155",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { color: "#1E293B", fontSize: 12, fontWeight: "700" },
  verified: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
