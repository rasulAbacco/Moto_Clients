import express from "express";
import axios from "axios";

const router = express.Router();

// ← Different base paths for different CRM route groups
const CRM_V1 = "http://localhost:5001/api/v1"; // for /external/users
const CRM_API = "http://localhost:5001/api"; // for /marketplace/...

router.get("/external/users", async (req, res) => {
  try {
    const response = await axios.get(`${CRM_V1}/external/users`, {
      // ← /api/v1/external/users ✅
      headers: {
        "x-api-key": process.env.CRM_API_KEY || "your_super_secret_key_here",
      },
    });
    return res.json(response.data);
  } catch (error) {
    console.error("Proxy error /external/users:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch users from CRM" });
  }
});

router.post("/marketplace/client-lookup", async (req, res) => {
  try {
    const response = await axios.post(
      `${CRM_API}/marketplace/client-lookup`, // ← /api/marketplace/client-lookup ✅
      req.body,
      { headers: { "Content-Type": "application/json" } },
    );
    return res.json(response.data);
  } catch (error) {
    console.error(
      "Proxy error /marketplace/client-lookup:",
      error?.response?.data || error.message,
    );
    return res
      .status(error?.response?.status || 500)
      .json(
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
      { headers: { "Content-Type": "application/json" } },
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
      { params: req.query },
    );
    return res.json(response.data);
  } catch (error) {
    console.error(
      "Proxy error /marketplace/my-bookings:",
      error?.response?.data || error.message,
    );
    return res
      .status(error?.response?.status || 500)
      .json(
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
    });
    return res.json(response.data);
  } catch (error) {
    console.error(
      "Proxy error /notifications:",
      error?.response?.data || error.message,
    );
    return res
      .status(error?.response?.status || 500)
      .json(
        error?.response?.data || {
          success: false,
          message: "Failed to fetch notifications",
        },
      );
  }
});

export default router;