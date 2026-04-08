import express from "express";
import axios from "axios";

const router = express.Router();

// ← Different base paths for different CRM route groups
const CRM_V1 = "http://localhost:5001/api/v1";       // for /external/users
const CRM_API = "http://localhost:5001/api";          // for /marketplace/...

router.get("/external/users", async (req, res) => {
  try {
    const response = await axios.get(`${CRM_V1}/external/users`, {  // ← /api/v1/external/users ✅
      headers: { "x-api-key": process.env.CRM_API_KEY || "your_super_secret_key_here" },
    });
    return res.json(response.data);
  } catch (error) {
    console.error("Proxy error /external/users:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch users from CRM" });
  }
});

router.post("/marketplace/client-lookup", async (req, res) => {
  try {
    const response = await axios.post(
      `${CRM_API}/marketplace/client-lookup`,  // ← /api/marketplace/client-lookup ✅
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.json(response.data);
  } catch (error) {
    console.error("Proxy error /marketplace/client-lookup:", error?.response?.data || error.message);
    return res.status(error?.response?.status || 500).json(
      error?.response?.data || { success: false, message: "client-lookup failed" }
    );
  }
});

router.post("/marketplace/book", async (req, res) => {
  try {
    const response = await axios.post(
      `${CRM_API}/marketplace/book`,  // ← /api/marketplace/book ✅
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.json(response.data);
  } catch (error) {
    console.error("Proxy error /marketplace/book:", error?.response?.data || error.message);
    return res.status(error?.response?.status || 500).json(
      error?.response?.data || { success: false, message: "Booking failed" }
    );
  }
});

export default router;