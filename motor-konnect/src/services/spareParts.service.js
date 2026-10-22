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

// Readable message from a failed request. Includes the URL and status so
// it's obvious when the app is pointed at a server without this route.
export const sparePartsErrorMessage = (err) => {
  const status = err?.response?.status;
  const url = `${err?.config?.baseURL || ""}${err?.config?.url || ""}`;
  if (__DEV__)
    console.warn("Spare parts request failed:", status || err?.code, url);

  if (err?.response?.data?.message) return err.response.data.message;
  if (status === 404)
    return `This server doesn't have the spare parts service yet (404). Deploy the latest server or point the app at your dev server.\n${url}`;
  if (err?.code === "ECONNABORTED")
    return "The store is taking longer than usual. Please try again.";
  if (!err?.response)
    return `Can't reach the server. Check your internet connection or the server address.\n${url}`;
  return `Could not load spare parts (error ${status}). Please try again.`;
};

// ─────────────── Buying (needs login except cart validation) ───────────────

const unwrap = (res) => res.data?.data;

/** Live price, stock and shop options for cart items */
export const validatePartsCart = async (items) =>
  unwrap(
    await api.post(
      "/spare-parts/cart/validate",
      {
        items: items.map(({ inventoryId, quantity }) => ({
          inventoryId,
          quantity,
        })),
      },
      { timeout: SLOW_TIMEOUT },
    ),
  ) ?? [];

/** Name, phone and saved address to prefill checkout */
export const getCheckoutProfile = async () =>
  unwrap(await api.get("/spare-parts/checkout-profile"));

/**
 * Place one shop's order.
 * fulfilment: "DELIVERY" | "PICKUP"; paymentMode: "COD" (cash on delivery / pay at shop) | "UPI"
 * shippingAddress: full address for DELIVERY, { name, phone } for PICKUP
 */
export const placePartsOrder = async ({
  items,
  fulfilment,
  paymentMode,
  shippingAddress,
}) =>
  unwrap(
    await api.post(
      "/spare-parts/orders",
      {
        items: items.map(({ inventoryId, quantity }) => ({
          inventoryId,
          quantity,
        })),
        fulfilment,
        paymentMode,
        shippingAddress,
      },
      { timeout: SLOW_TIMEOUT },
    ),
  );

export const getMyPartsOrders = async (params = {}) => {
  const res = await api.get("/spare-parts/orders", {
    params: { limit: 50, ...params },
    timeout: SLOW_TIMEOUT,
  });
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

export const getPartsOrder = async (id) =>
  unwrap(await api.get(`/spare-parts/orders/${id}`, { timeout: SLOW_TIMEOUT }));

export const cancelPartsOrder = async (id) =>
  unwrap(await api.patch(`/spare-parts/orders/${id}/cancel`));

export const getOrderUpi = async (id) =>
  unwrap(
    await api.get(`/spare-parts/orders/${id}/upi`, { timeout: SLOW_TIMEOUT }),
  );

export const submitOrderUpi = async (id, utr) =>
  unwrap(await api.post(`/spare-parts/orders/${id}/upi`, { utr }));

/** First field error from a validation response, else the message */
export const orderErrorMessage = (err) => {
  const data = err?.response?.data;
  if (data?.errors?.length) return data.errors[0].message;
  if (data?.message) return data.message;
  if (err?.code === "ECONNABORTED")
    return "The parts store is taking longer than usual. Please try again.";
  if (!err?.response)
    return "Can't reach the server. Check your internet connection.";
  return "Something went wrong. Please try again.";
};

// ─────────────── Display helpers ───────────────

export const ORDER_STATUS_LABEL = {
  AWAITING_PAYMENT: "Awaiting payment",
  PENDING: "Placed",
  ACCEPTED: "Accepted",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const statusLabel = (order) => {
  if (order.fulfilment === "PICKUP") {
    if (order.status === "PACKED") return "Ready for pickup";
    if (order.status === "DELIVERED") return "Picked up";
  }
  if (
    order.status === "PENDING" &&
    order.paymentMode === "UPI" &&
    order.paymentStatus !== "PAID"
  ) {
    return "Payment being verified";
  }
  return ORDER_STATUS_LABEL[order.status] || order.status;
};

export const paymentLabel = (order) => {
  if (order.paymentMode === "UPI")
    return order.paymentStatus === "PAID" ? "Paid by UPI" : "UPI";
  if (order.paymentMode === "COD")
    return order.fulfilment === "PICKUP" ? "Pay at shop" : "Cash on delivery";
  return order.paymentMode;
};
