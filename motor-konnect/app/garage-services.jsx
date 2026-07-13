// app/garage-services.jsx
//
// Replaces the old ServiceGrid.jsx category drill-down (ServiceGrid ->
// services/[id] -> sub-service/[id]) with a single flat list of that
// garage's active services — same ServiceCard used on Home, so Add to
// Cart works identically here. This is where GarageList.jsx already
// navigates (params: { garageId }).
//
// services/[id].jsx and the old ServiceGrid.jsx are no longer used by
// this flow — safe to delete once you've confirmed nothing else links to
// them directly.

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../src/hooks/useTheme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import useAppStore from "../src/store/useAppStore";
import { flattenGarage } from "../src/services/search.service";
import ServiceCardList from "../src/components/ServiceCardList";

export default function GarageServicesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { garageId } = useLocalSearchParams();

  const getGarageById = useAppStore((s) => s.getGarageById);
  const garages = useAppStore((s) => s.garages);
  const garageLoading = useAppStore((s) => s.garageLoading);
  const hydrateGarages = useAppStore((s) => s.hydrateGarages);

  useEffect(() => {
    // Safety net for deep-links / cold starts where the cache is empty
    if (!garages.length) hydrateGarages();
  }, []);

  const garage = getGarageById(garageId);
  const rows = useMemo(() => (garage ? flattenGarage(garage) : []), [garage]);

  if (garageLoading && !garage) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!garage) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.colors.textSecondary }}>
          Garage not found. Pull to refresh from Home and try again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {garage.companyName || garage.name || "Garage"}
        </Text>
      </View>

      <ServiceCardList
        rows={rows}
        emptyText="This garage hasn't activated any services yet."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingTop: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", flexShrink: 1 },
});
