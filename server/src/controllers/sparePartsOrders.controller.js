// server/src/controllers/sparePartsOrders.controller.js
//
// Buying spare parts from the MotorDesk spare-parts store, for Motor Konnect users.
// The app calls OUR server; we call the store's partner API with a secret key and
// tell it which customer is ordering (matched by phone on the store side). The key
// never reaches the app.
//
// .env:
//   SPARE_PARTS_API_URL=https://motordesk-spareparts-backend.onrender.com
//   SPARE_PARTS_PARTNER_KEY=<same value as PARTNER_API_KEY on the store server>
import axios from "axios";
import prisma from "../config/db.js";

const apiUrl = () =>
  (process.env.SPARE_PARTS_API_URL || "https://motordesk-spareparts-backend.onrender.com").replace(/\/+$/, "");

const partnerKey = () => process.env.SPARE_PARTS_PARTNER_KEY || "";

const TIMEOUT = 60000; // the store may be waking up (Render free plan)

/** The logged-in user's details, sent to the store so it can match/create their customer account */
async function customerHeaders(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true, lastName: true, phone: true, email: true },
  });
  const phone = String(user?.phone || "").replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    const err = new Error("Add your mobile number in Profile to order spare parts");
    err.status = 400;
    throw err;
  }
  const name = [user.fullName, user.lastName].filter(Boolean).join(" ").trim();
  return {
    "X-Customer-Phone": phone,
    "X-Customer-Name": encodeURIComponent(name || "Motor Konnect customer"),
    ...(user.email && { "X-Customer-Email": encodeURIComponent(user.email) }),
  };
}

async function callStore({ method, path, data, params, customer }) {
  if (!partnerKey()) {
    const err = new Error("Spare parts ordering is not set up yet (SPARE_PARTS_PARTNER_KEY missing on the server)");
    err.status = 503;
    throw err;
  }
  return axios({
    method,
    url: `${apiUrl()}/api/v1/partner${path}`,
    data,
    params,
    timeout: TIMEOUT,
    headers: {
      Accept: "application/json",
      "X-Partner-Key": partnerKey(),
      ...(customer || {}),
    },
  });
}

/** Pass the store's answer (or its error message) straight back to the app */
const proxy = (build) => async (req, res) => {
  try {
    const opts = await build(req);
    const r = await callStore(opts);
    res.status(r.status).json(r.data);
  } catch (err) {
    const status = err.status || err.response?.status || (err.code === "ECONNABORTED" ? 504 : 502);
    const message =
      err.response?.data?.message ||
      (err.code === "ECONNABORTED"
        ? "The parts store is taking longer than usual. Please try again."
        : err.message || "Could not reach the parts store");
    if (status >= 500) console.error("spare-parts order error:", status, message);
    res.status(status).json({ success: false, message, errors: err.response?.data?.errors });
  }
};

const withCustomer = async (req, extra) => ({ customer: await customerHeaders(req.user.id), ...extra });

// POST /api/spare-parts/cart/validate   (no login needed — live price, stock and shop options)
export const validateCart = proxy(async (req) => ({ method: "post", path: "/cart/validate", data: { items: req.body?.items } }));

// POST /api/spare-parts/orders
export const placeOrder = proxy((req) => {
  const { items, fulfilment, paymentMode, shippingAddress } = req.body || {};
  return withCustomer(req, { method: "post", path: "/orders", data: { items, fulfilment, paymentMode, shippingAddress } });
});

// GET /api/spare-parts/orders?status=&page=
export const myOrders = proxy((req) => withCustomer(req, { method: "get", path: "/orders", params: req.query }));

// GET /api/spare-parts/orders/:id
export const orderDetail = proxy((req) =>
  withCustomer(req, { method: "get", path: `/orders/${encodeURIComponent(req.params.id)}` }),
);

// PATCH /api/spare-parts/orders/:id/cancel
export const cancelOrder = proxy((req) =>
  withCustomer(req, { method: "patch", path: `/orders/${encodeURIComponent(req.params.id)}/cancel` }),
);

// GET /api/spare-parts/orders/:id/upi  → shop UPI ID, amount, upi:// link
export const upiDetails = proxy((req) =>
  withCustomer(req, { method: "get", path: `/orders/${encodeURIComponent(req.params.id)}/upi` }),
);

// POST /api/spare-parts/orders/:id/upi  { utr }
export const submitUpi = proxy((req) =>
  withCustomer(req, { method: "post", path: `/orders/${encodeURIComponent(req.params.id)}/upi`, data: { utr: req.body?.utr } }),
);

// GET /api/spare-parts/checkout-profile → prefill name / phone / address in the app
export const checkoutProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { fullName: true, lastName: true, phone: true, email: true, address: true },
  });
  res.json({
    success: true,
    data: {
      name: [user?.fullName, user?.lastName].filter(Boolean).join(" ").trim(),
      phone: String(user?.phone || "").replace(/\D/g, "").slice(-10),
      email: user?.email || null,
      address: user?.address
        ? { line1: user.address.street || "", city: user.address.city || "", state: user.address.state || "", pincode: user.address.postalCode || "" }
        : null,
    },
  });
};
