import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../hooks/useTheme.js";
import { useRouter } from "expo-router";
import SectionHeader from "./SectionHeader.jsx";

const { width } = Dimensions.get("window");

const CURATED = [
  {
    id: "1",
    title: "AC Service & Repair",
    tag: "Most Booked",
    icon: "thermometer-outline",
    gradient: ["#7c3aed", "#4f46e5"],
    path: "/services/ac",
  },
  {
    id: "2",
    title: "Full Car Service",
    tag: "Best Value",
    icon: "settings-outline",
    gradient: ["#7c3aed", "#4f46e5"],
    path: "/services/full-service",
  },
  {
    id: "3",
    title: "Tyre Replacement",
    tag: "Quick Fix",
    icon: "ellipse-outline",
    gradient: ["#7c3aed", "#4f46e5"],
    path: "/services/tyre",
  },
  {
    id: "4",
    title: "Denting & Painting",
    tag: "Top Rated",
    icon: "color-palette-outline",
    gradient: ["#7c3aed", "#4f46e5"],
    path: "/services/denting",
  },
];

export default function CuratedServices() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View>
      <SectionHeader title="Curated For You" seeAllPath="/services" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {CURATED.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => router.push(item.path)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Tag */}
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>

              {/* Icon */}
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={28} color="#fff" />
              </View>

              {/* Title */}
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>

              {/* CTA */}
              <View style={styles.cta}>
                <Text style={styles.ctaText}>Book Now</Text>
                <Ionicons name="arrow-forward" size={12} color="#fff" />
              </View>

              {/* Decor */}
              <View style={styles.decor} />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: 12,
    paddingRight: 4,
  },
  card: {
    width: 150,
    height: 190,
    borderRadius: 18,
    padding: 14,
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ctaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "600",
  },
  decor: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
