// auth.routes.js
import express from "express";
import {
  getProfile,
  updateProfile,
  addVehicle,
  getVehicles,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";

const router = express.Router();

// Public
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Protected — profile
router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, updateProfile);

// Protected — vehicles
router.post("/vehicles", authenticate, addVehicle);
router.get("/vehicles", authenticate, getVehicles);

export default router;
