import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/external/users", async (req, res) => {
  try {
    const response = await axios.get(
      "http://localhost:5001/api/v1/external/users",
      {
        headers: {
          "x-api-key": "your_super_secret_key_here",
        },  
      },
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users from CRM",
    });
  }
});

export default router;
