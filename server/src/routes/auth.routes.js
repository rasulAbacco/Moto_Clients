// auth.routes.js
import express from "express";
import {
  getProfile,
  updateProfile,
  addVehicle,
  getVehicles,
  updateVehicle,
  getVehicleById,
  deleteVehicle,
  addGuestVehicle,
  uploadProfileImage,
  getProfileImage,
  setPrimaryVehicle,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  sendOtp,
  verifyOtp,
  sendEmailOTP,
  verifyEmailOTP,
  completeProfile,
} from "../controllers/otp.controller.js";

const router = express.Router();

// Public - Email OTP
router.post("/send-otp", sendEmailOTP);
router.post("/verify-otp", verifyEmailOTP);

// Public - SMS OTP (legacy)
router.post("/send-sms-otp", sendOtp);
router.post("/verify-sms-otp", verifyOtp);

// Protected — profile
router.get("/me", authenticate, getProfile);
router.get("/profile-image", authenticate, getProfileImage);
router.put("/me", authenticate, updateProfile);
router.post("/guest/vehicles", addGuestVehicle);

// Full Name, after verify OTP
router.post("/complete-profile", authenticate, completeProfile);

// Protected — vehicles
router.post("/vehicles", authenticate, addVehicle);
router.get("/vehicles", authenticate, getVehicles);
router.get("/vehicles/:id", authenticate, getVehicleById);
router.put("/vehicles/:id", authenticate, updateVehicle);
router.delete("/vehicles/:id", authenticate, deleteVehicle);
router.put(
  "/profile-image",
  authenticate,
  upload.single("image"),
  uploadProfileImage,
);
router.patch("/vehicles/:id/primary", authenticate, setPrimaryVehicle);

export default router;
