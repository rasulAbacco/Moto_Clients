// src/components/ServiceCardList.jsx
//
// Shared 2-column grid wrapper around ServiceCard: handles title,
// loading, and empty states once instead of duplicating them in every
// screen that shows a list of services. Used by Home (default listing +
// search results) and the garage's full active-services list.

import { View, Text, FlatList, StyleSheet } from "react-native";
import ServiceCard from "./ServiceCard";
import useAppStore from "../store/useAppStore";

const NUM_COLUMNS = 2;

export default function ServiceCardList({ rows, loading, title, emptyText }) {
  const getGarageById = useAppStore((s) => s.getGarageById);

  if (loading) {
    return (
      <View>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.center}>
          <Text style={styles.loaderText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!rows?.length) {
    return (
      <View>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.center}>
          <Text style={styles.loaderText}>
            {emptyText || "No services available yet."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        // ✅ REQUIRED by React Native: numColumns can't change on a
        // mounted FlatList instance ("Changing numColumns on the fly is
        // not supported"). Keying on the column count forces a fresh
        // FlatList to mount instead of updating the existing one in
        // place, whenever this component is reused where the count
        // could ever differ (Fast Refresh, conditional rendering, etc).
        key={`service-grid-${NUM_COLUMNS}`}
        data={rows}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.columnWrapper}
        keyExtractor={(item, i) =>
          // Always include the array index — serviceId/garageId alone
          // aren't guaranteed unique if source data has duplicates.
          `${String(item.serviceId ?? item.id ?? "row")}-${String(item.garageId)}-${i}`
        }
        renderItem={({ item }) => (
          <ServiceCard item={item} garage={getGarageById(item.garageId)} />
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  columnWrapper: { justifyContent: "space-between" },
  center: { padding: 30, alignItems: "center" },
  loaderText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
});
