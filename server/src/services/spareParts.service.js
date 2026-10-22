// src/services/spareParts.service.js
//
// Spare parts for the Store tab. The app never talks to the MotorDesk
// spare-parts store directly — it calls OUR server, which fetches,
// cleans and caches the store data:
//   GET /api/spare-parts/products?vehicle=car|bike
//   GET /api/spare-parts/vendors?vehicle=car|bike
//
// Product shape returned by the server (see server sparePartsController):
// { id, name, description, brand, category, partNumber, price (incl. GST),
//   mrp, discountPercent, stock, inStock, unit, warranty, compatibleModels[],
//   images[], vendor: { id, name, phone, city, ... }, vehicleType }
import api from "./apiClient";

// The store is on a free plan and can take ~50s to wake up on a cold
// start, so allow more than the default 10s client timeout.
const SLOW_TIMEOUT = 60000;

export const getSpareParts = async ({ vehicle, vendor } = {}) => {
  const res = await api.get("/spare-parts/products", {
    params: { vehicle, vendor },
    timeout: SLOW_TIMEOUT,
  });
  return Array.isArray(res.data?.products) ? res.data.products : [];
};

export const getSparePartVendors = async ({ vehicle } = {}) => {
  const res = await api.get("/spare-parts/vendors", {
    params: { vehicle },
    timeout: SLOW_TIMEOUT,
  });
  return Array.isArray(res.data?.vendors) ? res.data.vendors : [];
};

// Readable message from a failed request (server sends { message }).
export const sparePartsErrorMessage = (err) =>
  err?.response?.data?.message ||
  (err?.code === "ECONNABORTED"
    ? "The store is taking longer than usual. Please try again."
    : "Could not load spare parts. Check your connection and try again.");
