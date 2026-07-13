// src/store/useAppStore.js
//
// Global memory cloud for Moto.
//
// UPDATE: garages now live here too. Your backend has no `GET
// /garages/:id` — garages only come from one bulk CRM call
// (`/external/users`). So "ID-driven navigation with lazy per-screen
// fetch" for garage detail screens isn't literally possible yet; the
// honest version of it is: fetch garages ONCE (here), cache them, and
// let any screen resolve a garageId against this cache instead of
// receiving the full object via route params.
//
// TODO once vehicle.service.js is confirmed: wire hydrateVehicleType()
// to real persistence (marked below).

import { create } from "zustand";
// TODO: uncomment once vehicle.service.js is confirmed
// import { getSelectedVehicle, setSelectedVehicle } from "../features/vehicle/vehicle.service";

// const BASE_URL = "https://x59j71v4-8000.inc1.devtunnels.ms/api/v1"; // TODO: move to env var
const BASE_URL = "https://moto-clients.onrender.com/api/v1"; // TODO: move to env var

const useAppStore = create((set, get) => ({
  // ────────────────────────────────
  // Active vehicle type (SEDAN / SUV / LUXURY / HATCHBACK ...)
  // ────────────────────────────────
  activeVehicleType: "SEDAN",

  setActiveVehicleType: (type) => {
    set({ activeVehicleType: (type || "SEDAN").toUpperCase() });
    // TODO: persist via vehicle.service.js once confirmed
  },

  hydrateVehicleType: async () => {
    try {
      // TODO: replace with real call once vehicle.service.js is available
      // const vehicle = await getSelectedVehicle();
      // if (vehicle?.model?.segment) {
      //   set({ activeVehicleType: vehicle.model.segment.toUpperCase() });
      // }
    } catch (e) {
      console.log("hydrateVehicleType error:", e?.message);
    }
  },

  // ────────────────────────────────
  // Garages cache — the closest thing to "lazy fetch by ID" your
  // backend currently supports (single bulk CRM fetch, cached here).
  // ────────────────────────────────
  garages: [],
  garageLoading: false,

  hydrateGarages: async () => {
    const { garages, garageLoading } = get();
    if (garageLoading || garages.length) {
      console.log(
        `🔍 [DEBUG] hydrateGarages() skipped — garageLoading=${garageLoading}, garages.length=${garages.length}`,
      );
      return; // already loaded/loading
    }

    const url = `${BASE_URL}/external/users`;
    console.log("🔍 [DEBUG] hydrateGarages() called — fetching:", url);
    console.log(
      "🔍 [DEBUG] EXPO_PUBLIC_API_KEY present?",
      !!process.env.EXPO_PUBLIC_API_KEY,
    );

    set({ garageLoading: true });

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.EXPO_PUBLIC_API_KEY,
        },
      });

      console.log("🔍 [DEBUG] /external/users status:", res.status, res.ok);

      const text = await res.text();

      // ✅ Log a snippet of the RAW body regardless of status, since
      // fetch() doesn't throw on 4xx/5xx — a 401/404/500 with an HTML
      // or JSON error body would otherwise pass through silently.
      console.log(
        "🔍 [DEBUG] /external/users raw body (first 500 chars):",
        text.slice(0, 500),
      );

      if (!res.ok) {
        console.log(
          `🔍 [DEBUG] hydrateGarages aborted — non-OK status ${res.status}`,
        );
        set({ garages: [], garageLoading: false });
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        // ✅ FIX: was referencing an undefined `error` variable here,
        // which threw a ReferenceError caught by the OUTER catch below
        // instead of logging anything useful.
        console.error("🔍 [DEBUG] hydrateGarages JSON parse error:", parseErr);
        set({ garages: [], garageLoading: false });
        return;
      }

      // ✅ Log the parsed shape so we can see exactly what keys exist
      // (data.data? data itself an array? something else entirely?)
      console.log(
        "🔍 [DEBUG] parsed response — top-level keys:",
        Array.isArray(data) ? "ARRAY" : Object.keys(data || {}),
      );
      console.log(
        "🔍 [DEBUG] data.data is array?",
        Array.isArray(data?.data),
        "| length:",
        data?.data?.length,
      );

      const rawList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

      if (rawList.length) {
        console.log(
          "🔍 [DEBUG] services length across ALL 41:",
          rawList.map((g) => ({
            id: g.id,
            name: g.companyName || g.username,
            servicesLen: g.services?.length ?? "n/a",
          })),
        );
        console.log(
          "🔍 [DEBUG] sample raw garage object (keys):",
          Object.keys(rawList[0]),
        );
        console.log(
          "🔍 [DEBUG] sample raw garage — services field type:",
          Array.isArray(rawList[0].services)
            ? `array (len ${rawList[0].services.length})`
            : typeof rawList[0].services,
        );
      } else {
        console.log(
          "🔍 [DEBUG] rawList is EMPTY — check whether `data` truly has no records, or the key used to hold them isn't `data`.",
        );
      }

      const filtered = rawList.filter(
        (g) => Array.isArray(g.services) && g.services.length > 0,
      );

      console.log(
        `🔍 [DEBUG] hydrateGarages() -> ${rawList.length} raw, ${filtered.length} with active services`,
      );

      set({ garages: filtered, garageLoading: false });
    } catch (e) {
      console.log(
        "🔍 [DEBUG] hydrateGarages() network/unexpected error:",
        e?.message,
      );
      set({ garages: [], garageLoading: false });
    }
  },

  refreshGarages: async () => {
    console.log("🔍 [DEBUG] refreshGarages() called — forcing refetch");
    set({ garages: [] }); // force hydrateGarages to actually refetch
    await get().hydrateGarages();
  },

  /** Resolve a garageId (string/number, from route params) to the full
   * cached garage object. Returns null if not yet hydrated — callers
   * should show a loading/empty state and can call hydrateGarages(). */
  getGarageById: (garageId) => {
    return (
      get().garages.find(
        (g) => String(g.id ?? g.userId) === String(garageId),
      ) || null
    );
  },

  // ❌ REMOVED: cart used to live here, but your app already has a real,
  // working, AsyncStorage-persisted cart in CartProvider.jsx / useCart.js
  // (CartContext), which CartScreen/CartBar/checkout already read from.
  // Duplicating cart state here was the bug that made "Add to Cart" look
  // like it silently failed — items were going into this store instead,
  // which nothing else ever read. Use useCart() for all cart operations;
  // this store is vehicle type + garages cache only.
}));

export default useAppStore;
