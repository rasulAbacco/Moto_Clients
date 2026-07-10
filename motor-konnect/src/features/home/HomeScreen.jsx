// HomeScreen.jsx
import { Animated, StyleSheet, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import SectionRenderer from "./components/SectionRenderer";
import StickyHeader from "./components/StickyHeader";
import HomeHeader from "./components/HomeHeader";
import api from "../../services/apiClient";
import {
  flattenGarageMatches,
  flattenAllGarageServices,
  flattenGarage,
} from "../../services/search.service";
import { useCart } from "../../hooks/useCart";

import { useAuth } from "../../providers/AuthProvider";
import { useLoginSheet } from "../../providers/LoginSheetProvider";
import useAppStore from "../../store/useAppStore";

export default function HomeScreen() {
  const { theme } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [searching, setSearching] = useState(false);

  // `category` (CAR/BIKE/WASHING) — matches your real seeded vehicleType
  // values (VehicleSelector.jsx fixed from "WASH" to "WASHING"). Sent to
  // /services and /packages, and used to filter Home's service listing.
  const [category, setCategory] = useState("CAR");

  const { user } = useAuth();
  const { openLoginSheet } = useLoginSheet();
  const { cartItems } = useCart(); // ✅ real cart — used to detect the active garage

  // ── Global store: vehicle type + garages cache ──
  const activeVehicleType = useAppStore((s) => s.activeVehicleType);
  const hydrateVehicleType = useAppStore((s) => s.hydrateVehicleType);
  const garages = useAppStore((s) => s.garages);
  const garageLoading = useAppStore((s) => s.garageLoading);
  const hydrateGarages = useAppStore((s) => s.hydrateGarages);
  const refreshGarages = useAppStore((s) => s.refreshGarages);
  const getGarageById = useAppStore((s) => s.getGarageById);

  useFocusEffect(
    useCallback(() => {
      hydrateVehicleType();
      hydrateGarages(); // no-ops if already loaded
    }, []),
  );

  // ──────────────────────────────────────────────────────────────
  // 🔍 DEBUG: dump the raw shape of garages + one nested service the
  // moment they're loaded. This is what we actually need to see to fix
  // category filtering for real instead of guessing again — specifically
  // whether any nested service object carries a vehicleType/category
  // field, and what it's actually called.
  // Remove this whole block once that's confirmed.
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!garages.length) {
      console.log("🔍 [DEBUG] garages: none loaded yet");
      return;
    }

    console.log(`🔍 [DEBUG] garages loaded: ${garages.length}`);

    // Log EVERY garage's name + service count, not just the first one
    // with services — we need to see if category is guessable across
    // ALL of them, not just one.
    garages.forEach((g) => {
      const mainNames = (g.services || []).map((m) => m.name);
      console.log(
        `🔍 [DEBUG] Garage "${g.companyName || g.name}" (id ${g.id ?? g.userId}) — ` +
          `${g.services?.length || 0} main service group(s): ${JSON.stringify(mainNames)}`,
      );
    });

    // 🔍 DEBUG: for EVERY garage, log every main group's name and the
    // distinct pricing.carType values found under it. Testing a theory:
    // "AC Services & Repair" groups showed carType SEDAN/SUV (car-only
    // body types) — if a group explicitly named "Bike Services" shows
    // DIFFERENT carType values, then pricing.carType itself is a real,
    // reliable per-service category signal, better than the often-generic
    // main-group name.
    garages.forEach((g) => {
      g.services?.forEach((main) => {
        const carTypesInThisGroup = new Set();
        main.sections?.forEach((section) => {
          section.services?.forEach((svc) => {
            svc.pricing?.forEach((p) => carTypesInThisGroup.add(p.carType));
          });
        });
        console.log(
          `🔍 [DEBUG] "${g.companyName || g.name}" -> MAIN "${main.name}" ` +
            `carType values seen: ${JSON.stringify([...carTypesInThisGroup])}`,
        );
      });
    });

    const garageWithServices = garages.find((g) => g.services?.length > 0);
    if (!garageWithServices) {
      console.log(
        "🔍 [DEBUG] NONE of the loaded garages have any active services.",
      );
      return;
    }

    console.log(
      "🔍 [DEBUG] Inspecting garage:",
      garageWithServices.companyName || garageWithServices.name,
      "| id:",
      garageWithServices.id ?? garageWithServices.userId,
    );

    // Log every MAIN service's name and every SECTION's name under it —
    // this is what we need to see whether category hides in these names
    // (e.g. "Car AC Repair" vs a shared generic "AC Repair").
    garageWithServices.services?.forEach((main, mi) => {
      console.log(`🔍 [DEBUG]   MAIN[${mi}] name: "${main.name}"`);
      main.sections?.forEach((section, si) => {
        console.log(
          `🔍 [DEBUG]     SECTION[${si}] name: "${section.name}" (${section.services?.length || 0} services)`,
        );
      });
    });

    const firstMain = garageWithServices.services?.[0];
    const firstSection = firstMain?.sections?.[0];
    const firstSvc = firstSection?.services?.[0];
    if (firstSvc) {
      console.log(
        "🔍 [DEBUG] First SUB-SERVICE full object:",
        JSON.stringify(firstSvc, null, 2),
      );
      console.log(
        "🔍 [DEBUG] Candidate category fields — vehicleType:",
        firstSvc.vehicleType,
        "| vehicleTypeId:",
        firstSvc.vehicleTypeId,
        "| vehicleTypeName:",
        firstSvc.vehicleTypeName,
        "| category:",
        firstSvc.category,
      );
    }
  }, [garages]);

  // 🔍 DEBUG: log every time the category filter changes and how many
  // rows survive it, so we can see whether filtering is doing anything
  // at all right now.
  useEffect(() => {
    console.log(`🔍 [DEBUG] category changed to: ${category}`);
  }, [category]);
  // ──────────────────────────────────────────────────────────────

  useEffect(() => {
    loadServices();
  }, [category]);

  const loadServices = async () => {
    try {
      const [serviceRes, packageRes] = await Promise.all([
        api.get(`/services?vehicleType=${category}`),
        api.get(`/packages?vehicleType=${category}`),
      ]);
      setServices(serviceRes.data);
      const rawPackages = packageRes.data?.data || [];
      const formattedPackages = rawPackages.map((pkg) => ({
        ...pkg,
        garageId: pkg.userId || pkg.garageId,
        garageName: pkg.garageName || "Unknown Garage",
      }));
      setPackages(formattedPackages);
    } catch (err) {
      console.log("❌ loadServices ERROR:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadServices(), refreshGarages(), hydrateVehicleType()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!user) openLoginSheet();
  }, []);

  // ── Search: garage-linked rows only (real garageId, bookable) ──
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setSearching(true);
      const garageRows = flattenGarageMatches(garages, q);
      console.log(
        `🔍 [DEBUG] search "${q}" -> ${garageRows.length} garage-linked matches`,
      );
      if (!cancelled) {
        setSearchResults({ garageRows });
        setSearching(false);
      }
    };

    const debounce = setTimeout(run, 300);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [searchQuery, garages]);

  const isSearching = searchQuery.trim().length > 0;

  // ✅ Real, garage-linked, ACTIVE services for Home's default listing,
  // filtered by the selected CAR/BIKE/WASHING button.
  const garageServiceRows = useMemo(() => {
    const rows = flattenAllGarageServices(garages, { limit: 20, category });
    console.log(
      `🔍 [DEBUG] flattenAllGarageServices(category="${category}") -> ${rows.length} rows`,
      rows.length
        ? `| sample: ${rows[0]?.serviceName} @ ${rows[0]?.garageName}`
        : "",
    );
    return rows;
  }, [garages, category]);

  // ✅ "More from this garage" — once the cart is locked to a garage,
  // show the rest of that garage's active services right on Home.
  const activeCartGarageId = useMemo(() => {
    const laborItem = cartItems.find(
      (i) => i.source === "service" || i.source === "package",
    );
    return laborItem?.garageId ?? null;
  }, [cartItems]);

  const moreFromGarageRows = useMemo(() => {
    if (!activeCartGarageId) return [];
    const garage = getGarageById(activeCartGarageId);
    if (!garage) return [];
    const inCartIds = new Set(cartItems.map((i) => String(i.id)));
    return flattenGarage(garage).filter(
      (row) => !inCartIds.has(String(row.serviceId)),
    );
  }, [activeCartGarageId, garages, cartItems]);

  const activeCartGarageName = cartItems.find(
    (i) => i.source === "service" || i.source === "package",
  )?.garageName;

  const sections = useMemo(() => {
    if (isSearching) {
      return [
        {
          id: "garage-matches",
          type: "unifiedSearch",
          data: searchResults?.garageRows || [],
          loading: searching,
        },
      ];
    }

    const sects = [
      { id: "carousel", type: "carousel", data: packages },
      {
        id: "vehicleSelector",
        type: "vehicleSelector",
        selected: category,
        onChange: setCategory,
      },
    ];

    if (moreFromGarageRows.length) {
      sects.push({
        id: "more-from-garage",
        type: "unifiedSearch",
        data: moreFromGarageRows,
        title: `More from ${activeCartGarageName || "this garage"}`,
      });
    }

    sects.push(
      {
        id: "services",
        type: "unifiedSearch",
        data: garageServiceRows,
        loading: garageLoading,
        title: "Popular Services Near You",
      },
      { id: "garages", type: "garages", data: garages, loading: garageLoading },
      { id: "membership", type: "membership" },
      { id: "curated", type: "curated", data: packages },
      { id: "assist", type: "assist" },
    );

    return sects;
  }, [
    garageServiceRows,
    moreFromGarageRows,
    activeCartGarageName,
    packages,
    garages,
    garageLoading,
    activeVehicleType,
    category,
    isSearching,
    searchResults,
    searching,
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
  homeHeaderWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  sectionWrapper: { paddingHorizontal: 16, marginBottom: 16 },
});
