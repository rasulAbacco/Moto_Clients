import express from "express";
import axios from "axios";

const router = express.Router();

// Garage CRM (where garages and their services live).
// Set these on Render → Environment for the Motor Konnect server:
//   CRM_BASE_URL = https://auto-garage-crm-zrxc.onrender.com   (optional, this is the default)
//   CRM_API_KEY  = the same key the CRM expects in "x-api-key"   (REQUIRED)
// For local testing: CRM_BASE_URL=http://localhost:5001
const CRM_BASE = (
  process.env.CRM_BASE_URL || "https://auto-garage-crm-zrxc.onrender.com"
).replace(/\/+$/, "");
const CRM_V1 = `${CRM_BASE}/api/v1`; // for /external/users
const CRM_API = `${CRM_BASE}/api`; // for /marketplace/...

// The CRM is on Render's free plan and can take ~50s to wake up.
const CRM_TIMEOUT = 60000;

// Last good garage list, so the app still shows garages if the CRM is
// asleep or briefly down. Fresh for 5 minutes.
let garagesCache = { at: 0, data: null };
const CACHE_MS = 5 * 60 * 1000;

router.get("/external/users", async (req, res) => {
  if (garagesCache.data && Date.now() - garagesCache.at < CACHE_MS) {
    return res.json(garagesCache.data);
  }
  if (!process.env.CRM_API_KEY) {
    console.error(
      "CRM_API_KEY is not set on this server — the CRM will reject /external/users. Add it in Render → Environment.",
    );
  }
  try {
    const response = await axios.get(`${CRM_V1}/external/users`, {
      headers: { "x-api-key": process.env.CRM_API_KEY || "" },
      timeout: CRM_TIMEOUT,
    });
    garagesCache = { at: Date.now(), data: response.data };
    return res.json(response.data);
  } catch (error) {
    const status = error?.response?.status;
    console.error(
      "Proxy error /external/users:",
      status || error.code || "",
      error?.response?.data || error.message,
    );
    // Serve the last good list if we have one (even if older than 5 min)
    if (garagesCache.data) return res.json(garagesCache.data);

    const message =
      status === 401 || status === 403
        ? "Garage service rejected the server's API key (check CRM_API_KEY on the server)."
        : error.code === "ECONNABORTED"
          ? "Garage service is starting up. Please pull down to refresh in a minute."
          : "Couldn't load garages right now. Please try again.";
    return res.status(502).json({ success: false, message });
  }
});

router.post("/marketplace/client-lookup", async (req, res) => {
  try {
    const response = await axios.post(
      `${CRM_API}/marketplace/client-lookup`, // ← /api/marketplace/client-lookup ✅
      req.body,
      { headers: { "Content-Type": "application/json" }, timeout: CRM_TIMEOUT },
    );
    return res.json(response.data);
  } catch (error) {
    console.error(
      "Proxy error /marketplace/client-lookup:",
      error?.response?.data || error.message,
    );
    return res.status(error?.response?.status || 500).json(
      error?.response?.data || {
        success: false,
        message: "client-lookup failed",
      },
    );
  }
});

router.post("/marketplace/book", async (req, res) => {
  try {
    const response = await axios.post(
      `${CRM_API}/marketplace/book`, // ← /api/marketplace/book ✅
      req.body,
      { headers: { "Content-Type": "application/json" }, timeout: CRM_TIMEOUT },
    );
    return res.json(response.data);
  } catch (error) {
    console.error(
      "Proxy error /marketplace/book:",
      error?.response?.data || error.message,
    );
    return res
      .status(error?.response?.status || 500)
      .json(
        error?.response?.data || { success: false, message: "Booking failed" },
      );
  }
});

router.get("/marketplace/my-bookings", async (req, res) => {
  try {
    const response = await axios.get(
      `${CRM_API}/marketplace/my-bookings`, // ← /api/marketplace/my-bookings
      { params: req.query, timeout: CRM_TIMEOUT },
    );
    return res.json(response.data);
  } catch (error) {
    console.error(
      "Proxy error /marketplace/my-bookings:",
      error?.response?.data || error.message,
    );
    return res.status(error?.response?.status || 500).json(
      error?.response?.data || {
        success: false,
        message: "Failed to fetch bookings",
      },
    );
  }
});

// ── Notifications proxy ──
// Forwards to CRM notification controller which reads AppNotification from MOTO_DB
// Query params are passed through as-is (e.g. ?phone=919876543210)
// GET /api/v1/notifications → CRM: /api/notifications
router.get("/notifications", async (req, res) => {
  try {
    const response = await axios.get(`${CRM_API}/notifications`, {
      params: req.query, // ← pass ?phone=... through
      timeout: CRM_TIMEOUT,
    });
    return res.json(response.data);
  } catch (error) {
    console.error(
      "Proxy error /notifications:",
      error?.response?.data || error.message,
    );
    return res.status(error?.response?.status || 500).json(
      error?.response?.data || {
        success: false,
        message: "Failed to fetch notifications",
      },
    );
  }
});

export default router;
