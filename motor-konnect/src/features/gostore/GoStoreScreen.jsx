// src/features/gostore/GoStoreScreen.jsx
//
// Store tab — live spare parts from the MotorDesk spare-parts store,
// served through our server at /api/spare-parts/products?vehicle=car|bike.
// Opens on the user's selected vehicle type; Car/Bike toggle, search,
// category chips, pull to refresh, and a detail sheet with vendor contact.
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import useDebounce from "../../hooks/useDebounce";
import { getSelectedVehicle } from "../vehicle/vehicle.service";
import {
  getSpareParts,
  sparePartsErrorMessage,
} from "../../services/spareParts.service";

import StoreHeader from "./components/StoreHeader";
import PartCard from "./components/PartCard";
import ViewCartBar, { VIEW_CART_BAR_HEIGHT } from "./components/ViewCartBar";
import { usePartsCart } from "../../providers/PartsCartProvider";
import PartDetailSheet from "./components/PartDetailSheet";

const VEHICLES = [
  { key: "car", label: "Car", icon: "car-sport-outline" },
  { key: "bike", label: "Bike", icon: "bicycle-outline" },
];

const toVehicleKey = (v) =>
  /bike|scooter|motor\s?cycle|two/i.test(
    String(v?.vehicleType || v?.type || ""),
  )
    ? "bike"
    : "car";

export default function GoStoreScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { count: cartCount } = usePartsCart();

  const [vehicle, setVehicle] = useState(null); // null until we read the user's vehicle
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const search = useDebounce(query, 250);

  // Start on the user's own vehicle type
  useEffect(() => {
    getSelectedVehicle()
      .then((v) => setVehicle(toVehicleKey(v)))
      .catch(() => setVehicle("car"));
  }, []);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!vehicle) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        setParts(await getSpareParts({ vehicle }));
      } catch (err) {
        setError(sparePartsErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [vehicle],
  );

  useEffect(() => {
    setCategory("All");
    load();
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set(parts.map((p) => p.category).filter(Boolean));
    return ["All", ...[...set].sort()];
  }, [parts]);

  const visible = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return (
      parts
        .filter((p) => category === "All" || p.category === category)
        .filter(
          (p) =>
            !q ||
            [p.name, p.brand, p.category, p.partNumber, p.vendor?.name]
              .filter(Boolean)
              .some((t) => String(t).toLowerCase().includes(q)),
        )
        // in-stock first
        .sort((a, b) => Number(b.inStock) - Number(a.inStock))
    );
  }, [parts, category, search]);

  const listHeader = (
    <View>
      <StoreHeader />

      {/* Car / Bike */}
      <View style={[styles.segment, { backgroundColor: c.inputBackground }]}>
        {VEHICLES.map((v) => {
          const active = vehicle === v.key;
          return (
            <Pressable
              key={v.key}
              onPress={() => setVehicle(v.key)}
              style={[
                styles.segmentBtn,
                active && { backgroundColor: c.surface, ...theme.shadow.card },
              ]}
            >
              <Ionicons
                name={v.icon}
                size={16}
                color={active ? c.primary : c.textSecondary}
              />
              <Text
                style={[
                  styles.segmentText,
                  { color: active ? c.primary : c.textSecondary },
                ]}
              >
                {v.label} parts
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Search */}
      <View
        style={[
          styles.search,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        <Ionicons name="search" size={18} color={c.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search parts, brands, part no."
          placeholderTextColor={c.textMuted}
          style={[styles.searchInput, { color: c.text }]}
          returnKeyType="search"
          autoCorrect={false}
        />
        {!!query && (
          <Pressable onPress={() => setQuery("")} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={c.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Categories */}
      {categories.length > 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? c.primary : c.surface,
                    borderColor: active ? c.primary : c.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? c.onPrimary : c.text },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {!loading && !error && parts.length > 0 && (
        <Text style={[styles.count, { color: c.textSecondary }]}>
          {visible.length} {visible.length === 1 ? "part" : "parts"}
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[styles.stateSub, { color: c.textSecondary }]}>
            Loading spare parts…
          </Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.state}>
          <Ionicons
            name="cloud-offline-outline"
            size={40}
            color={c.textMuted}
          />
          <Text style={[styles.stateTitle, { color: c.text }]}>
            Couldn&apos;t load the store
          </Text>
          <Text style={[styles.stateSub, { color: c.textSecondary }]}>
            {error}
          </Text>
          <Pressable
            onPress={() => load()}
            style={[styles.retry, { backgroundColor: c.primary }]}
          >
            <Text style={[styles.retryText, { color: c.onPrimary }]}>
              Try again
            </Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Ionicons name="cube-outline" size={40} color={c.textMuted} />
        <Text style={[styles.stateTitle, { color: c.text }]}>
          {parts.length ? "No matching parts" : `No ${vehicle} parts yet`}
        </Text>
        <Text style={[styles.stateSub, { color: c.textSecondary }]}>
          {parts.length
            ? "Try a different search or category."
            : "New parts are being added. Check back soon."}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c.background }}
      edges={["top"]}
    >
      <FlatList
        data={loading || error ? [] : visible}
        keyExtractor={(item, i) => item.id || `${item.name}-${i}`}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={[
          styles.list,
          cartCount > 0 && { paddingBottom: 32 + VIEW_CART_BAR_HEIGHT },
        ]}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <PartCard part={item} onPress={() => setSelected(item)} />
        )}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <ViewCartBar />

      <PartDetailSheet part={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  column: { gap: 12, marginBottom: 12 },
  segment: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    height: 38,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  segmentText: { fontSize: 14, fontWeight: "600" },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  chips: { gap: 8, paddingVertical: 12 },
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: "center",
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  count: { fontSize: 12, marginBottom: 8, marginTop: 4 },
  state: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
    gap: 8,
  },
  stateTitle: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  stateSub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  retry: {
    marginTop: 10,
    paddingHorizontal: 22,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
  },
  retryText: { fontSize: 14, fontWeight: "600" },
});
