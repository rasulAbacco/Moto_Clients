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

import { API_BASE_URL as BASE_URL } from "../constants/config";
// No API key in the app: our server adds the CRM key itself (CRM_API_KEY on
// the server). Keys inside an app can always be extracted.

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// GET with a timeout (Render free servers can take ~50s to wake up)
async function getJson(url, timeoutMs = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {}
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

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
  garageError: null,

  hydrateGarages: async () => {
    const { garages, garageLoading } = get();
    if (garageLoading || garages.length) return; // already loaded/loading

    const url = `${BASE_URL}/external/users`;
    set({ garageLoading: true, garageError: null });

    // Try twice — the first call may just wake the server up
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const { ok, status, data } = await getJson(url);
        if (!ok) {
          if (__DEV__)
            console.log(`Garages request failed (${status}):`, data?.message);
          if (attempt < 2 && status >= 500) {
            await wait(2000);
            continue;
          }
          set({
            garages: [],
            garageLoading: false,
            garageError:
              data?.message || `Couldn't load workshops (error ${status}).`,
          });
          return;
        }

        const rawList = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        // Only garages that have at least one active service
        const filtered = rawList.filter(
          (g) => Array.isArray(g.services) && g.services.length > 0,
        );
        set({ garages: filtered, garageLoading: false, garageError: null });
        return;
      } catch (e) {
        if (__DEV__) console.log("Garages request error:", e?.message);
        if (attempt < 2) {
          await wait(2000);
          continue;
        }
        set({
          garages: [],
          garageLoading: false,
          garageError:
            e?.name === "AbortError"
              ? "The server is taking too long. Pull down to refresh."
              : "Can't reach the server. Check your internet and pull down to refresh.",
        });
      }
    }
  },

  refreshGarages: async () => {
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
